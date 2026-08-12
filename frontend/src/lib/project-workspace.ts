import type {
  ProjectDraft,
  ProjectDraftErrors,
  ProjectRoot,
} from "@/types/project-workspace"

function platformCaseSensitive() {
  return typeof navigator === "undefined" || !/Mac|Win/i.test(navigator.platform)
}

export function normalizeProjectPath(path: string) {
  const normalized = path
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/\/$/, "")
  return platformCaseSensitive() ? normalized : normalized.toLocaleLowerCase()
}

export function projectRootFromPath(path: string): ProjectRoot {
  const normalized = path.replace(/\\/g, "/").replace(/\/$/, "")
  const pathParts = normalized.split("/").filter(Boolean)
  const displayName = pathParts[pathParts.length - 1] ?? normalized
  const canonicalIdentity = normalizeProjectPath(path)
  return {
    id: `root-${canonicalIdentity.replace(/[^a-z0-9]+/gi, "-")}-${Date.now()}`,
    displayName,
    path: normalized,
    canonicalIdentity,
    availability: "ready",
  }
}

export function rootsOverlap(left: ProjectRoot, right: ProjectRoot) {
  const leftParts = left.canonicalIdentity.split("/").filter(Boolean)
  const rightParts = right.canonicalIdentity.split("/").filter(Boolean)
  const shorter = leftParts.length <= rightParts.length ? leftParts : rightParts
  const longer = shorter === leftParts ? rightParts : leftParts
  return shorter.every((part, index) => part === longer[index])
}

export function appendProjectRoots(
  current: ProjectRoot[],
  additions: ProjectRoot[],
): { roots: ProjectRoot[]; error?: string } {
  const next = [...current]
  for (const root of additions) {
    if (
      next.some(
        (candidate) => candidate.canonicalIdentity === root.canonicalIdentity,
      )
    ) {
      return { roots: next, error: `“${root.path}”已经添加` }
    }
    const overlap = next.find((candidate) => rootsOverlap(candidate, root))
    if (overlap) {
      return {
        roots: next,
        error: `“${overlap.path}”与“${root.path}”存在父子目录重叠`,
      }
    }
    next.push(root)
  }
  return { roots: next }
}

export function validateProjectDraft(draft: ProjectDraft): ProjectDraftErrors {
  const errors: ProjectDraftErrors = {}
  if (!draft.name.trim()) errors.name = "请输入项目名称"
  if (!draft.kind) errors.kind = "请选择项目类型"
  if (!draft.roots.length) errors.roots = "请至少添加一个文件夹"
  const unavailable = draft.roots.find(
    (root) => root.availability !== "ready",
  )
  if (unavailable) errors.roots = `“${unavailable.path}”当前不可用，请重新选择`

  const identities = new Set<string>()
  for (const root of draft.roots) {
    if (identities.has(root.canonicalIdentity)) {
      errors.roots = `“${root.path}”已经添加`
      break
    }
    identities.add(root.canonicalIdentity)
  }
  if (!errors.roots) {
    for (let index = 0; index < draft.roots.length; index += 1) {
      for (let cursor = index + 1; cursor < draft.roots.length; cursor += 1) {
        const left = draft.roots[index]
        const right = draft.roots[cursor]
        if (left && right && rootsOverlap(left, right)) {
          errors.roots = `“${left.path}”与“${right.path}”存在父子目录重叠`
        }
      }
    }
  }
  if (
    !draft.defaultRootId ||
    !draft.roots.some((root) => root.id === draft.defaultRootId)
  ) {
    errors.defaultRootId = "请选择默认根目录"
  }
  return errors
}

export function noteEditorKey(groupId: string, noteId: string) {
  return `${groupId}:${noteId}`
}
