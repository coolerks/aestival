import assert from "node:assert/strict"
import test from "node:test"

import {
  collectLayoutGroupIds,
  countResourceReferences,
  createInitialEditorWorkbenchState,
  reduceEditorWorkbenchState,
  selectActiveEditor,
  selectGroupActiveEditor,
  validateEditorWorkbenchState,
} from "../src/store/editor-layout.ts"
import {
  languageRegistrySmokeCheck,
  normalizeLanguageId,
  resolveLanguageId,
} from "../src/lib/monaco-language-registry.ts"

function open(state, resourceId, options = {}) {
  return reduceEditorWorkbenchState(state, {
    type: "open-file",
    resourceId,
    pinned: options.pinned ?? false,
    dirty: options.dirty ?? false,
    contentView: options.contentView ?? "source",
    targetGroupId: options.targetGroupId,
  })
}

function activate(state, groupId, editorId) {
  return reduceEditorWorkbenchState(state, {
    type: "activate-editor",
    groupId,
    editorId,
  })
}

function split(state, direction = "right") {
  const group = state.groups[state.activeGroupId]
  return reduceEditorWorkbenchState(state, {
    type: "split-editor",
    groupId: group.id,
    editorId: group.activeEditorId,
    direction,
  })
}

function editorForResource(state, groupId, resourceId) {
  const group = state.groups[groupId]
  const editorId = group.editorIds.find((id) => state.editors[id]?.resourceId === resourceId)
  return editorId ? state.editors[editorId] : null
}

function expectValid(state) {
  assert.deepEqual(validateEditorWorkbenchState(state), [])
}

test("初始状态只在主编辑组固定聊天页签", () => {
  const state = createInitialEditorWorkbenchState()
  const primary = state.groups[state.primaryGroupId]
  assert.deepEqual(primary.editorIds, ["editor-chat"])
  assert.equal(primary.activeEditorId, "editor-chat")
  assert.equal(state.editors["editor-chat"].kind, "chat")
  expectValid(state)
})

test("文件预览只替换目标编辑组自己的预览页签", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  state = split(state)
  const bottom = state.activeGroupId
  state = open(state, "readme", { targetGroupId: bottom })
  state = open(state, "logo", { targetGroupId: bottom })

  assert.equal(editorForResource(state, bottom, "readme"), null)
  assert.ok(editorForResource(state, bottom, "logo"))
  assert.ok(editorForResource(state, state.primaryGroupId, "app"))
  expectValid(state)
})

test("拆分只复制当前活动输入，源组页签与活动状态不变", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  state = open(state, "readme", { pinned: true })
  const primary = state.primaryGroupId
  const app = editorForResource(state, primary, "app")
  state = activate(state, primary, app.id)
  const sourceActive = state.groups[primary].activeEditorId
  state = split(state, "down")
  const secondary = state.activeGroupId

  assert.deepEqual(
    state.groups[primary].editorIds.map((id) => state.editors[id].kind === "chat" ? "chat" : state.editors[id].resourceId),
    ["chat", "app", "readme"],
  )
  assert.equal(state.groups[primary].activeEditorId, sourceActive)
  assert.deepEqual(
    state.groups[secondary].editorIds.map((id) => state.editors[id].resourceId),
    ["app"],
  )
  assert.equal(countResourceReferences(state, "app"), 2)
  expectValid(state)
})

test("不同编辑组切换页签完全独立", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  state = open(state, "readme", { pinned: true })
  const primary = state.primaryGroupId
  state = split(state)
  const secondary = state.activeGroupId
  state = open(state, "logo", { pinned: true, targetGroupId: secondary })
  const primaryApp = editorForResource(state, primary, "app")
  const secondaryLogo = editorForResource(state, secondary, "logo")
  const secondaryBefore = state.groups[secondary].activeEditorId

  state = activate(state, primary, primaryApp.id)
  assert.equal(state.groups[secondary].activeEditorId, secondaryBefore)
  state = activate(state, secondary, secondaryLogo.id)
  assert.equal(state.groups[primary].activeEditorId, primaryApp.id)
  expectValid(state)
})

test("最后聚焦的编辑组接收文件树新文件，其他组无反应", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  state = split(state)
  const secondary = state.activeGroupId
  state = reduceEditorWorkbenchState(state, { type: "focus-group", groupId: secondary })
  state = open(state, "readme", { pinned: true })

  assert.ok(editorForResource(state, secondary, "readme"))
  assert.equal(editorForResource(state, state.primaryGroupId, "readme"), null)
  expectValid(state)
})

test("文件已在别组打开时仍在活动组创建独立实例而不跳组", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  const primary = state.primaryGroupId
  state = split(state)
  const secondary = state.activeGroupId
  state = open(state, "readme", { pinned: true, targetGroupId: secondary })
  state = reduceEditorWorkbenchState(state, { type: "focus-group", groupId: secondary })
  state = open(state, "app", { pinned: true })

  assert.equal(state.activeGroupId, secondary)
  assert.equal(countResourceReferences(state, "app"), 2)
  assert.ok(editorForResource(state, primary, "app"))
  assert.ok(editorForResource(state, secondary, "app"))
  expectValid(state)
})

test("跨组移动页签从源组消失并保持目标顺序", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  state = open(state, "readme", { pinned: true })
  const primary = state.primaryGroupId
  const app = editorForResource(state, primary, "app")
  state = activate(state, primary, app.id)
  state = split(state)
  const secondary = state.activeGroupId
  state = open(state, "logo", { pinned: true, targetGroupId: secondary })
  const logo = editorForResource(state, secondary, "logo")
  state = reduceEditorWorkbenchState(state, {
    type: "move-editor",
    sourceGroupId: secondary,
    editorId: logo.id,
    targetGroupId: primary,
    targetIndex: 1,
    copy: false,
  })

  assert.equal(Object.keys(state.groups).length, 2)
  assert.deepEqual(
    state.groups[primary].editorIds.map((id) => state.editors[id].kind === "chat" ? "chat" : state.editors[id].resourceId),
    ["chat", "logo", "app", "readme"],
  )
  assert.equal(editorForResource(state, secondary, "logo"), null)
  expectValid(state)
})

test("移动到已包含同一文件的目标组只激活目标实例", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  const primary = state.primaryGroupId
  state = split(state)
  const secondary = state.activeGroupId
  const secondaryApp = editorForResource(state, secondary, "app")
  state = reduceEditorWorkbenchState(state, {
    type: "move-editor",
    sourceGroupId: secondary,
    editorId: secondaryApp.id,
    targetGroupId: primary,
    targetIndex: 1,
    copy: false,
  })

  assert.equal(countResourceReferences(state, "app"), 1)
  assert.equal(Object.keys(state.groups).length, 1)
  assert.equal(selectActiveEditor(state).resourceId, "app")
  expectValid(state)
})

test("复制到已包含同一文件的目标组保留源实例且不创建重复目标", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  const primary = state.primaryGroupId
  state = split(state)
  const secondary = state.activeGroupId
  state = reduceEditorWorkbenchState(state, {
    type: "move-editor",
    sourceGroupId: secondary,
    editorId: state.groups[secondary].activeEditorId,
    targetGroupId: primary,
    targetIndex: 1,
    copy: true,
  })

  assert.equal(countResourceReferences(state, "app"), 2)
  assert.equal(state.groups[primary].editorIds.filter((id) => state.editors[id].resourceId === "app").length, 1)
  assert.equal(state.groups[secondary].editorIds.length, 1)
  expectValid(state)
})

test("拖到编辑组边缘创建相邻组并移动当前页签", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  state = open(state, "readme", { pinned: true })
  const primary = state.primaryGroupId
  const readme = editorForResource(state, primary, "readme")
  state = reduceEditorWorkbenchState(state, {
    type: "split-with-editor",
    sourceGroupId: primary,
    editorId: readme.id,
    targetGroupId: primary,
    edge: "bottom",
    copy: false,
  })

  assert.equal(Object.keys(state.groups).length, 2)
  assert.deepEqual(collectLayoutGroupIds(state.layout), [primary, state.activeGroupId])
  assert.equal(editorForResource(state, primary, "readme"), null)
  assert.ok(editorForResource(state, state.activeGroupId, "readme"))
  expectValid(state)
})

test("关闭次级组最后一个输入会折叠该组，主组始终回到聊天", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  const primary = state.primaryGroupId
  state = split(state)
  const secondary = state.activeGroupId
  state = reduceEditorWorkbenchState(state, {
    type: "close-editor",
    groupId: secondary,
    editorId: state.groups[secondary].activeEditorId,
  })
  assert.equal(Object.keys(state.groups).length, 1)

  const primaryApp = editorForResource(state, primary, "app")
  state = reduceEditorWorkbenchState(state, {
    type: "close-editor",
    groupId: primary,
    editorId: primaryApp.id,
  })
  assert.equal(state.groups[primary].activeEditorId, "editor-chat")
  assert.deepEqual(state.groups[primary].editorIds, ["editor-chat"])
  expectValid(state)
})

test("Markdown 内容模式属于各自文件输入，不创建第二级页签", () => {
  let state = open(createInitialEditorWorkbenchState(), "readme", {
    pinned: true,
    contentView: "preview",
  })
  const primary = state.primaryGroupId
  const readme = editorForResource(state, primary, "readme")
  state = reduceEditorWorkbenchState(state, {
    type: "set-content-view",
    groupId: primary,
    editorId: readme.id,
    contentView: "split",
  })
  state = split(state)

  assert.equal(state.groups[primary].editorIds.length, 2)
  assert.equal(editorForResource(state, primary, "readme").contentView, "split")
  assert.equal(selectGroupActiveEditor(state, state.activeGroupId).contentView, "split")
  expectValid(state)
})

test("Diff 是活动组中的独立编辑输入", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  state = reduceEditorWorkbenchState(state, {
    type: "open-diff",
    resourceId: "app",
    kind: "saved-working",
  })
  const group = state.groups[state.activeGroupId]
  assert.equal(group.editorIds.length, 3)
  assert.equal(selectActiveEditor(state).kind, "diff")
  assert.equal(countResourceReferences(state, "app"), 2)
  expectValid(state)
})

test("编辑组不再存在固定四组上限", () => {
  let state = open(createInitialEditorWorkbenchState(), "app", { pinned: true })
  for (let index = 0; index < 5; index += 1) state = split(state, index % 2 ? "down" : "right")
  assert.equal(Object.keys(state.groups).length, 6)
  expectValid(state)
})

test("语言注册表覆盖全部声明语言并正确识别常用文件", () => {
  const smoke = languageRegistrySmokeCheck()
  assert.equal(smoke.total, 85)
  assert.deepEqual(smoke.missing, [])
  assert.equal(resolveLanguageId("src/App.tsx"), "typescript")
  assert.equal(resolveLanguageId("src/Widget.jsx"), "javascript")
  assert.equal(resolveLanguageId("Dockerfile"), "dockerfile")
  assert.equal(resolveLanguageId("schema.proto"), "proto")
  assert.equal(resolveLanguageId("unknown.extension"), "plaintext")
  assert.equal(normalizeLanguageId("solidity"), "sol")
})
