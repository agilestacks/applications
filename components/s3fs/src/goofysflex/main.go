package main

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path"
	"strings"

	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

var app = "goofysflex"
var version = "development"

// MountOptions structure encapsulates config options
type MountOptions struct {
	AccessKey string `json:"access-key,omitempty"`
	Bucket    string `json:"bucket,omitempty"`
	SecretKey string `json:"secret-key,omitempty"`
	SubPath   string `json:"sub-path,omitempty"`
	Region    string `json:"region,omitempty"`
	Endpoint  string `json:"endpoint,omitempty"`
	DirMode   string `json:"dir-mode,omitempty"`
	FileMode  string `json:"file-mode,omitempty"`
	GID       string `json:"gid,omitempty"`
	UID       string `json:"uid,omitempty"`
	ACL       string `json:"acl,omitempty"`
}

func isMountPoint(path string) bool {
	cmd := exec.Command("mountpoint", path)
	err := cmd.Run()
	if err != nil {
		return false
	}
	return true
}

// Mount ... this function creates a new volume mount
func Mount(target string, opts MountOptions) error {
	// bucket := options["bucket"]
	// subPath := options["subPath"]
	args := []string{
		"-o", "allow_other",
		"--dir-mode", opts.DirMode,
		"--file-mode", opts.FileMode,
		"--region", opts.Region,
		"--gid", opts.GID,
		"--uid", opts.UID,
		"--acl", opts.ACL,
	}

	if opts.Endpoint != "" {
		args = append(args, "--endpoint", opts.Endpoint)
	}

	verbose := viper.Get("verbose")
	if verbose == true {
		args = append(args, "--debug_s3", "--debug_fuse")
	}

	// to avoid collisions we generate synthetic
	var bucket, mountPath string
	if opts.SubPath != "" {
		bucket = opts.Bucket + ":" + opts.SubPath
		mountPath = path.Join(cwd(), "mnt", hash(opts.Bucket+"/"+opts.SubPath))
	} else {
		bucket = opts.Bucket
		mountPath = path.Join(cwd(), "mnt", hash(opts.Bucket))
	}
	args = append(args, bucket, mountPath)

	if !isMountPoint(mountPath) {
		exec.Command("umount", mountPath).Run()
		exec.Command("rm", "-rf", mountPath).Run()
		logrus.Infof("Making dir %s", mountPath)
		os.MkdirAll(mountPath, 0755)

		const bin = "goofys"
		mountCmd := exec.Command(bin, args...)
		mountCmd.Env = os.Environ()
		if opts.AccessKey != "" {
			mountCmd.Env = applyEnvVar(mountCmd.Env, "AWS_ACCESS_KEY_ID", opts.AccessKey)
		}
		if opts.SecretKey != "" {
			mountCmd.Env = applyEnvVar(mountCmd.Env, "AWS_SECRET_ACCESS_KEY", opts.SecretKey)
		}

		var stderr bytes.Buffer
		mountCmd.Stderr = &stderr
		logrus.Infof("Running: %s %s", bin, strings.Join(args, " "))
		logrus.Debugf("Using env vars: %v", mountCmd.Env)
		err := mountCmd.Run()
		if err != nil {
			logrus.Errorf("Error: %s", err)
			logrus.Errorf("Output: %s", stderr.String())
			// errMsg := err.Error() + ": " + stderr.String()
			// if viper.Get("verbose") != "" {
			// 	errMsg += fmt.Sprintf("; /var/log/syslog follows")
			// 	grepCmd := exec.Command("sh", "-c", "grep goofys /var/log/syslog | tail")
			// 	var stdout bytes.Buffer
			// 	grepCmd.Stdout = &stdout
			// 	grepCmd.Run()
			// 	errMsg += stdout.String()
			// }
			return fmt.Errorf("Error executing %s: %s", bin, err)
		}
	}
	// Now we rmdir the target, and then make a symlink to it!
	err := os.Remove(target)
	if err != nil {
		return err
	}

	logrus.Infof("Making symlink %s to %s", target, mountPath)
	err = os.Symlink(mountPath, target)
	if err == nil {
		respondSuccess()
	}
	return err
}

// Unmount ... performs an unmount operation
func Unmount(target string) error {
	logrus.Infof("Unmount %s", target)
	err := os.Remove(target)
	if err == nil {
		respondSuccess()
	}
	return err
}

func init() {
	// put cwd to path
	if os.Getenv("PATH") != "" {
		os.Setenv("PATH", cwd()+string(os.PathListSeparator)+os.Getenv("PATH"))
	} else {
		os.Setenv("PATH", cwd())
	}
}

func main() {
	defer logfile.Close()
	// logrus.Infof("Starting %s ver: %s", app, version)
	err := rootCmd.Execute()
	if err != nil {
		logrus.Error(err)
		respondError(err)
		os.Exit(2)
	}
}
