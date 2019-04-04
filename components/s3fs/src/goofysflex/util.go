package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"os/user"
	"path"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	// "github.com/go-errors/errors"
)

// Response is a canonical form of flex drive response
type Response struct {
	Status       string       `json:"status,omitempty"`
	Message      string       `json:"message,omitempty"`
	Device       string       `json:"device,omitempty"`
	VolumeName   string       `json:"volumeName,omitempty"`
	Attached     bool         `json:"attached,omitempty"`
	Capabilities Capabilities `json:"capabilities,omitempty"`
}

// Capabilities is a canonical form of init capabilities
type Capabilities struct {
	Attach bool `json:"attach,omitempty"`
}

var logfile *os.File

func printJSON(data interface{}) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}
	fmt.Print(string(jsonBytes))
}

func respondError(err error) {
	resp := Response{
		Status:  "Failure",
		Message: err.Error(),
	}
	printJSON(resp)
}

func respondMessage(text string) {
	resp := Response{
		Status:  "Success",
		Message: text,
	}
	printJSON(resp)
}

func respondSuccess() {
	resp := Response{
		Status: "Success",
	}
	printJSON(resp)
}

func respondCapabilities() {
	resp := Response{
		Status: "Success",
		Capabilities: Capabilities{
			Attach: false,
		},
	}
	printJSON(resp)
}

//hash convers string into sha1
func hash(s string) string {
	h := sha1.New()
	h.Write([]byte(s))
	sum := h.Sum(nil)
	return hex.EncodeToString(sum)
}

func cwd() string {
	cwd, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		logrus.Error(err)
	}
	return cwd
}

func applyEnvVar(environ []string, variable, value string) []string {
	pref := variable + "="
	found := false
	results := make([]string, len(environ))
	copy(results[:], environ)
	newValue := fmt.Sprintf("%s=%s", variable, value)
	for i, envvar := range results {
		if strings.HasPrefix(envvar, pref) {
			results[i] = newValue
			found = true
			break
		}
	}
	if !found {
		results = append(results, newValue)
	}
	return results
}

func init() {
	cwd := cwd()
	user, _ := user.Current()
	viper.SetConfigType("yaml")
	viper.SetConfigName("config")
	viper.AddConfigPath(filepath.Join(cwd, ".goofysflex"))
	viper.AddConfigPath(filepath.Join(user.HomeDir, ".goofysflex"))
	viper.AutomaticEnv()
	viper.ReadInConfig()

	viper.BindEnv("logLevel", "LOG_LEVEL")
	viper.SetDefault("logLevel", "info")

	fname := path.Join(cwd, app+".log")
	const logfilemode = os.O_WRONLY | os.O_CREATE | os.O_APPEND
	logfile, _ := os.OpenFile(fname, logfilemode, 0644)
	logrus.SetOutput(logfile)

	formatter := &logrus.TextFormatter{
		CallerPrettyfier: func(f *runtime.Frame) (string, string) {
			var filename string
			if os.Getenv("GOPATH") != "" {
				repopath := fmt.Sprintf("%s/src/%s", os.Getenv("GOPATH"), app)
				filename = strings.Replace(f.File, repopath, "", -1)
			} else {
				filename = strings.TrimPrefix(f.File, "/go/src/goofysflex/")
			}
			return fmt.Sprintf("%s()", f.Function), fmt.Sprintf("%s:%d", filename, f.Line)
		},
	}
	logrus.SetFormatter(formatter)
	logrus.SetReportCaller(true)

	viper.SetDefault("verbose", false)

	verbose := viper.GetBool("verbose")
	if verbose {
		logrus.SetLevel(logrus.DebugLevel)
	}
}
