import { Window as WailsWindow } from "@wailsio/runtime"

type WailsRuntimeWindow = Window & {
  _wails?: {
    environment?: unknown
  }
}

function hasWailsDesktopRuntime() {
  return Boolean((window as WailsRuntimeWindow)._wails?.environment)
}

export async function toggleWindowMaximise() {
  if (!hasWailsDesktopRuntime()) {
    return
  }

  try {
    await WailsWindow.ToggleMaximise()
  } finally {
    // Wails 3 Maximise() 会暂时清空窗口最小/最大尺寸；macOS 从 zoom 状态
    // 直接拖角恢复时不会经过 Wails UnMaximise()，因此必须主动恢复约束。
    await WailsWindow.EnableSizeConstraints()
  }
}
