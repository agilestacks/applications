package main

import (
	"io/ioutil"
	"os"
	"path/filepath"

	apiv1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
	"k8s.io/client-go/util/homedir"
)

const nsFile = "/var/run/secrets/kubernetes.io/serviceaccount/namespace"
const saFile = "/run/secrets/kubernetes.io/serviceaccount/token"

func k8sInCluster() (*kubernetes.Clientset, error) {
	config, err := rest.InClusterConfig()
	if err != nil {
		panic(err.Error())
	}
	// creates the clientset
	return kubernetes.NewForConfig(config)
}

func kubeconfigFromFS() (*rest.Config, string) {
	kubeconfig := os.Getenv("KUBECONFIG")
	if kubeconfig == "" || !fileExists(kubeconfig) {
		if home := homedir.HomeDir(); home != "" {
			kubeconfig = filepath.Join(home, ".kube", "config")
		}
		if !fileExists(kubeconfig) {
			kubeconfig = "kubeconfig"
		}
	}
	cluster := clientcmdapi.Cluster{Server: ""}
	config := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		&clientcmd.ClientConfigLoadingRules{ExplicitPath: kubeconfig},
		&clientcmd.ConfigOverrides{ClusterInfo: cluster},
	)
	namespace, _, err := config.Namespace()
	if err != nil || namespace == "" {
		namespace = apiv1.NamespaceDefault
	}
	conf, _ := config.ClientConfig()
	return conf, namespace
}

func kubeconfigInCluster() (*rest.Config, string) {
	config, err := rest.InClusterConfig()
	if err != nil {
		panic(err)
	}

	if fileExists(nsFile) {
		buf, err := ioutil.ReadFile(nsFile)
		namespace := string(buf)
		if err != nil {
			return config, namespace
		}
	}
	return config, apiv1.NamespaceDefault
}

func newK8sClient() (*kubernetes.Clientset, string) {
	if fileExists(saFile) {
		conf, ns := kubeconfigInCluster()
		clientset := kubernetes.NewForConfigOrDie(conf)
		return clientset, ns
	}
	conf, ns := kubeconfigFromFS()
	clientset := kubernetes.NewForConfigOrDie(conf)
	return clientset, ns
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func currentNamespace(config clientcmdapi.Config) string {
	nsFile := "/var/run/secrets/kubernetes.io/serviceaccount/namespace"
	if fileExists(nsFile) {
		buff, err := ioutil.ReadFile(nsFile)
		if err != nil {
			return string(buff)
		}
	}

	ns, _, err := clientcmd.NewDefaultClientConfig(config, nil).Namespace()
	if err != nil && ns != "" {
		return ns
	}

	return apiv1.NamespaceDefault
}
