package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := application.New(application.Options{
		Name:        "Aestival",
		Description: "本地优先的桌面 AI Agent 工作区",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "Aestival",
		Width:     1440,
		Height:    900,
		MinWidth:  960,
		MinHeight: 640,
		Mac: application.MacWindow{
			// 不设置 InvisibleTitleBarHeight：其原生强制拖拽区域会覆盖顶部角落的原生缩放手柄，
			// 导致缩放与拖拽互相拉扯（窗口抖动/跑位）。窗口拖拽统一由前端
			// --wails-draggable 标题栏承担，仅真实交互控件标记为 no-drag；
			// 窗口四边和四角仍由 AppKit 原生缩放手势优先处理。
			Backdrop: application.MacBackdropTranslucent,
			TitleBar: application.MacTitleBarHiddenInsetUnified,
		},
		BackgroundColour: application.NewRGBA(255, 255, 255, 0),
		URL:              "/",
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
