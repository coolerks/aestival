//go:build !darwin || ios

package main

import "github.com/wailsapp/wails/v3/pkg/application"

func installTrafficLightOffset(
	_ *application.WebviewWindow,
	_ float64,
	_ float64,
) {
}
