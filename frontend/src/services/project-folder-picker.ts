import { Dialogs } from "@wailsio/runtime"

import { projectRootFromPath } from "@/lib/project-workspace"
import type { ProjectRoot } from "@/types/project-workspace"

export type ProjectFolderPickerResult =
  | { status: "selected"; roots: ProjectRoot[] }
  | { status: "cancelled"; roots: [] }
  | { status: "unavailable"; roots: []; message: string }

export async function pickProjectFolders(): Promise<ProjectFolderPickerResult> {
  try {
    const value = await Dialogs.OpenFile({
      CanChooseDirectories: true,
      CanChooseFiles: false,
      CanCreateDirectories: true,
      AllowsMultipleSelection: true,
      ResolvesAliases: true,
      Title: "选择项目文件夹",
      Message: "可一次选择一个或多个文件夹；Aestival 本轮不会扫描其内容。",
      ButtonText: "添加文件夹",
    })
    const paths = Array.isArray(value) ? value : value ? [value] : []
    if (!paths.length) return { status: "cancelled", roots: [] }
    return { status: "selected", roots: paths.map(projectRootFromPath) }
  } catch {
    return {
      status: "unavailable",
      roots: [],
      message: "当前预览环境无法打开系统目录选择器。可使用示例文件夹验证 UI。",
    }
  }
}

export function createPreviewProjectRoot(sequence: number) {
  return projectRootFromPath(`/Users/demo/Documents/Aestival-${sequence}`)
}
