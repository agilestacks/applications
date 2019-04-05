// Flex plugin data contract https://docs.okd.io/latest/install_config/persistent_storage/persistent_storage_flex_volume.html
package main

import (
	"encoding/json"
	"errors"
	"fmt"

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
	Use:           "mount MOUNTDIR JSON",
	Short:         "reacts on mount action",
	Long:          `Executed by kubelet. This is a CLI callback to react on mount volume operation'`,
	RunE:          runMount,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var unmountCmd = &cobra.Command{
	Use:           "unmount MOUNTDIR",
	Short:         "reacts on unmount action",
	Long:          `Executed by kubelet. This is a CLI callback to react on unmount volume operation'`,
	RunE:          runUnmount,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var initCmd = &cobra.Command{
	Use:           "init JSON",
	Short:         "reacts on init action",
	Long:          `Executed by kubelet. At present does nothing`,
	Run:           runInit,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var getVolumeNameCmd = &cobra.Command{
	Use:           "getvolumename JSON",
	Short:         "returns name of the volume",
	Long:          `Name of the volume has been consistent across all nodes`,
	RunE:          runGetVolumeName,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var attachCmd = &cobra.Command{
	Use:           "attach JSON",
	Short:         "returns name of the volume",
	Long:          `Name of the volume has been consistent across all nodes`,
	Run:           runAttach,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var waitForAttachCmd = &cobra.Command{
	Use:           "waitforattach JSON",
	Short:         "returns name of the volume",
	Run:           runAttach,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var isAttachedCmd = &cobra.Command{
	Use:           "isattached JSON NODENAME",
	Short:         "always returns true",
	Run:           runIsAttached,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var mountDeviceCmd = &cobra.Command{
	Use:           "mountdevice MOUNTDIR DEVICENAME JSON",
	Short:         "always returns true",
	Run:           runIsAttached,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var unmountDeviceCmd = &cobra.Command{
	Use:           "mountdevice MOUNTDIR",
	Short:         "Performs the same as unmount",
	RunE:          runUnmount,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var detachCmd = &cobra.Command{
	Use:           "detach JSON",
	Short:         "always returns true",
	Run:           runDefaultResponse,
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
	respondInit(false)
}

func runAttach(c *cobra.Command, args []string) {
	resp := Response{
		Status:  "Success",
		Message: "",
		Device:  "/dev/null",
	}
	printJSON(resp)
}

func runIsAttached(c *cobra.Command, args []string) {
	resp := Response{
		Status:   "Success",
		Message:  "",
		Attached: true,
	}
	printJSON(resp)
}

func runDefaultResponse(c *cobra.Command, args []string) {
	respondSuccess()
}

func runGetVolumeName(c *cobra.Command, args []string) error {
	if len(args) < 1 {
		return errors.New("expecting at least 1 argument: JSON")
	}
	opts, err := UnmarshalMountOpts(args[0])
	if err != nil {
		return err
	}

	name := GetVolumeName(opts)
	resp := Response{
		Status:     "Success",
		VolumeName: fmt.Sprintf("flexvolume-goofysflex/%s", name),
		Message:    "",
	}
	return printJSON(resp)
}

func runMount(c *cobra.Command, args []string) error {
	if len(args) < 2 {
		return errors.New("expecting at least 2 arguments: MOUNTDIR JSON")
	}

	target := args[0]
	optsS := args[1]

	if optsS == "" {
		return errors.New("Mount options in JSON format expected")
	}

	logrus.Infof("Mount %s using %s", target, optsS)

	opts, err := UnmarshalMountOpts(optsS)
	if err != nil {
		logrus.Errorf("Error %s to decode JSON: %s", err, optsS)
	}
	return Mount(target, opts)
}

func runMountDevice(c *cobra.Command, args []string) error {
	if len(args) < 3 {
		return errors.New("expecting at least 3 arguments: MOUNTDIR DEVICENAME JSON")
	}
	// we do not need devicename. because we want to delegate execution to runMount
	newArgs := []string{args[0], args[2]}
	return runMountDevice(c, newArgs)
}

func runUnmount(c *cobra.Command, args []string) error {
	if len(args) == 0 {
		return errors.New("Unmount must have at least 1 argument")
	}

	target := args[0]
	logrus.Infof("Unmount %s", target)

	return Unmount(target)
}

// UnmarshalMountOpts constructs MountOptions from json payload
func UnmarshalMountOpts(s string) (MountOptions, error) {
	opts := DefaultMountOptions()
	err := json.Unmarshal([]byte(s), &opts)
	if err != nil {
		logrus.Errorf("Error %s to decode JSON: %s", err, s)
	}
	return opts, err
}

func init() {
	rootCmd.AddCommand(mountCmd)
	rootCmd.AddCommand(unmountCmd)
	rootCmd.AddCommand(initCmd)
	rootCmd.AddCommand(getVolumeNameCmd)
	rootCmd.AddCommand(attachCmd)
	rootCmd.AddCommand(detachCmd)
	rootCmd.AddCommand(waitForAttachCmd)
	rootCmd.AddCommand(isAttachedCmd)
	rootCmd.AddCommand(mountDeviceCmd)
	rootCmd.AddCommand(unmountDeviceCmd)
}
