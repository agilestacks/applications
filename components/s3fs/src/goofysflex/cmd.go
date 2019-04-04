package main

import (
	"encoding/json"
	"errors"
	"os/user"

	"github.com/sirupsen/logrus"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCmd = &cobra.Command{
	Use:              app,
	Short:            "enables goofys support for kubernetes",
	Long:             `This is a flex plugin for Kubernetes to enable goofys support for kubernetes'`,
	PersistentPreRun: defaultPreRun,
	SilenceUsage:     false,
	SilenceErrors:    true,
}

var mountCmd = &cobra.Command{
	Use:           "mount TARGET JSON",
	Short:         "reacts on mount action",
	Long:          `Executed by kubelet. This is a CLI callback to react on mount volume operation'`,
	RunE:          runMount,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var unmountCmd = &cobra.Command{
	Use:           "unmount TARGET",
	Short:         "reacts on unmount action",
	Long:          `Executed by kubelet. This is a CLI callback to react on unmount volume operation'`,
	RunE:          runUnmount,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var initCmd = &cobra.Command{
	Use:           "init JSON",
	Short:         "reacts on init action",
	Long:          `Executed by kubelet. At present does nothing'`,
	Run:           runInit,
	SilenceUsage:  true,
	SilenceErrors: true,
}

func bindFlag(v *viper.Viper, cmd *cobra.Command, viperKey, flag string) {
	flagP := cmd.Flags().Lookup(flag)
	if flagP == nil {
		flagP = cmd.PersistentFlags().Lookup(flag)
	}
	if flagP != nil {
		v.BindPFlag(viperKey, flagP)
	}
}

func defaultPreRun(c *cobra.Command, args []string) {
	bindFlag(viper.GetViper(), c, "verbose", "verbose")
}

func runInit(c *cobra.Command, args []string) {
	respondCapabilities()
}

func runMount(c *cobra.Command, args []string) error {
	if len(args) < 2 {
		return errors.New("expecting at least 2 arguments")
	}

	target := args[0]
	optsS := args[1]

	if optsS == "" {
		return errors.New("Mount options in JSON format expected")
	}

	logrus.Infof("Mount %s using %s", target, optsS)

	user, _ := user.Current()
	// meaningful defaults
	opts := MountOptions{
		Region:   "us-east-1",
		DirMode:  "0755",
		FileMode: "0644",
		GID:      user.Gid,
		UID:      user.Uid,
		ACL:      "private",
	}
	err := json.Unmarshal([]byte(optsS), &opts)
	if err != nil {
		logrus.Errorf("Error %s to decode JSON: %s", err, optsS)
	}
	return Mount(target, opts)
}

func runUnmount(c *cobra.Command, args []string) error {
	if len(args) == 0 {
		return errors.New("Unmount must have at least 1 argument")
	}

	target := args[0]
	logrus.Infof("Unmount %s", target)

	return Unmount(target)
}

func init() {
	rootCmd.AddCommand(mountCmd)
	rootCmd.AddCommand(unmountCmd)
	rootCmd.AddCommand(initCmd)
}
