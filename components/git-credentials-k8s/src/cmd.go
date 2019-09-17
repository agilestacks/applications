package main

import (
	"regexp"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var app = "asi-git-credentials"
var version = "development"

var rootCmd = &cobra.Command{
	Use:           app,
	Short:         "use kubernetes secrets for credentials",
	Long:          `Git credentials that uses a kubernetes secrets as a credentials store'`,
	SilenceUsage:  false,
	SilenceErrors: true,
}

var getCmd = &cobra.Command{
	Use:           "get",
	Short:         "returns credentials",
	Long:          `Returns username and password from secret'`,
	SilenceUsage:  true,
	SilenceErrors: true,
	Run: func(c *cobra.Command, args []string) {
		secret := viper.GetString("secret")
		labels := viper.GetStringSlice("label")
		namespace := viper.GetString("namespace")
		doGet(secret, namespace, labels, args)
	},

	PersistentPreRun: func(c *cobra.Command, args []string) {
		bindFlag(viper.GetViper(), c, "labels", "labels")
		bindFlag(viper.GetViper(), c, "secret", "secret")
		bindFlag(viper.GetViper(), c, "namespace", "namespace")
		workaroundSliceBug("labels")
		viper.SetDefault("namespace", namespace)
	},
}

var storeCmd = &cobra.Command{
	Use:           "store",
	Short:         "not yet implemented",
	Long:          `Store git user/pass in kubernetes secret'`,
	SilenceUsage:  true,
	SilenceErrors: true,
}

var eraseCmd = &cobra.Command{
	Use:           "erase",
	Short:         "not yet implemented",
	Long:          `Delete git user/pass from  in kubernetes secret'`,
	SilenceUsage:  true,
	SilenceErrors: true,
}

func init() {
	rootCmd.PersistentFlags().StringSliceP("label", "l", []string{}, "OPTIONAL: can be multiple times. Kubernetes labels to match secret (format: label=value)")
	rootCmd.PersistentFlags().StringP("secret", "s", "", "OPTIONAL: name of the kubernetes secret")
	rootCmd.PersistentFlags().StringP("namespace", "n", "", "OPTIONAL: namespace")

	rootCmd.AddCommand(getCmd)
	rootCmd.AddCommand(storeCmd)
	rootCmd.AddCommand(eraseCmd)
}

func workaroundSliceBug(key string) {
	values := viper.GetString(key)
	slice := viper.GetStringSlice(key)
	if values != "" {
		r := regexp.MustCompile(`(?s)\[(.*)\]`)
		values = r.ReplaceAllString(values, "${1}")

		if values != "" {
			slice = strings.Split(values, ",")
		} else {
			slice = []string{}
		}
		viper.Set(key, slice)
	}
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
