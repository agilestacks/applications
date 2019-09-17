package main

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/sirupsen/logrus"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

const defaultGitHost = "github.com"
const defaultGitUser = "x-oauth-basic"
const defaultGitProtocol = "https"
const secretType = "superhub.io/git"

var namespace string
var k8s *kubernetes.Clientset

func doGet(name, namespace string, labels, args []string) {
	host := defaultGitHost
	protocol := defaultGitProtocol
	for _, arg := range args {
		if strings.HasPrefix(arg, "host=") {
			s := strings.SplitN(arg, "=", 2)
			host = s[1]
			continue
		}
		if strings.HasPrefix(arg, "protocol=") {
			s := strings.SplitN(arg, "=", 2)
			protocol = s[1]
			continue
		}
	}

	secretsClient := k8s.CoreV1().Secrets(namespace)
	var secret *v1.Secret
	if name != "" {
		temp, err := secretsClient.Get(name, metav1.GetOptions{})
		if err != nil {
			logrus.Fatal(err)
		}
		secret = temp
	} else {
		opts := metav1.ListOptions{}
		if len(labels) > 0 {
			opts.LabelSelector = strings.Join(labels, ",")
		}
		secrets, err := secretsClient.List(opts)
		secrets.Items = filterSecretsByType(secrets, secretType)
		if err != nil {
			logrus.Fatal(err)
		}
		if len(secrets.Items) > 0 {
			if host != "" {
				secret = findSecretWithDataFieldHost(secrets, "clone_url", host)
			} else {
				secret = findSecretWithDataField(secrets, "password")
			}
		}
	}

	if secret == nil {
		logrus.Fatalf("Cannot find credentials for %s://%s", protocol, host)
	}

	username := string(secret.Data["username"][:])
	if username == "" {
		username = defaultGitUser
	}
	fmt.Printf("username=%s\n", username)

	password := string(secret.Data["password"][:])
	if password != "" {
		fmt.Printf("password=%s\n", password)
	}
}

func filterSecretsByType(secrets *v1.SecretList, desiredType v1.SecretType) []v1.Secret {
	result := make([]v1.Secret, len(secrets.Items))
	count := 0
	for _, secret := range secrets.Items {
		if secret.Type == desiredType {
			result[count] = v1.Secret(secret)
			count++
		}
	}
	return result[:count]
}

func findSecretWithDataFieldHost(secrets *v1.SecretList, dataField, host string) *v1.Secret {
	for _, secret := range secrets.Items {
		value := string(secret.Data[dataField][:])
		u, err := url.Parse(value)
		if err != nil {
			logrus.Fatal(err)
		}
		// not clear if git (caller) will send a host info stripped or not
		if u.Hostname() == host || u.Host == host {
			return &secret
		}
	}
	return nil
}

func findSecretWithDataField(secrets *v1.SecretList, dataField string) *v1.Secret {
	for _, secret := range secrets.Items {
		if len(secret.Data[dataField]) > 0 {
			return &secret
		}
	}
	return nil
}

func main() {
	k8s, namespace = newK8sClient()
	err := rootCmd.Execute()
	if err != nil {
		logrus.Fatal(err)
	}
}
