import { useRef } from "react"
import Editor, { DiffEditor, type BeforeMount, type OnMount } from "@monaco-editor/react"
import { useTheme } from "next-themes"

import {
  MonacoContextMenu,
  type MonacoEditorInstance,
  type MonacoEditorRef,
} from "@/components/shared/monaco-context-menu"
import { monaco, registerLocalCompletionProviders } from "@/lib/monaco-environment"
import { shouldWrapLanguage } from "@/lib/monaco-language-registry"
import { cn } from "@/lib/utils"

export type EditorSurfaceProps = {
  fileId: string
  modelPath: string
  language: string
  value: string
  readOnly?: boolean
  tabSize?: number
  className?: string
  onChange: (value: string) => void
  onMount?: (editor: MonacoEditorInstance) => void
  onFocus?: () => void
  onCursorPositionChange?: (line: number, column: number) => void
}

export function EditorSurface({
  fileId,
  modelPath,
  language,
  value,
  readOnly = false,
  tabSize = 2,
  className,
  onChange,
  onMount,
  onFocus,
  onCursorPositionChange,
}: EditorSurfaceProps) {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<MonacoEditorInstance | null>(null)
  const editorMenuRef = editorRef as MonacoEditorRef

  const handleBeforeMount: BeforeMount = () => {
    registerLocalCompletionProviders(language)
  }

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
    let suggestionTimer: number | undefined
    editor.addAction({
      id: "aestival.trigger-local-completion",
      label: "显示本地代码提示",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space,
        monaco.KeyMod.WinCtrl | monaco.KeyCode.Space,
      ],
      run: (instance) => {
        instance.focus()
        instance.trigger("aestival", "editor.action.triggerSuggest", {})
      },
    })
    editor.onDidChangeModelContent((event) => {
      if (readOnly) return
      if (event.isFlush) return
      const position = editor.getPosition()
      const model = editor.getModel()
      if (!position || !model) return
      const currentWord = model.getWordUntilPosition(position).word
      const insertedText = event.changes.map((change) => change.text).join("")
      const shouldSuggest = /[./<:@"']/.test(insertedText) || currentWord.length >= 2
      if (!shouldSuggest) return
      window.clearTimeout(suggestionTimer)
      suggestionTimer = window.setTimeout(() => {
        if (!editor.hasTextFocus()) return
        editor.trigger("aestival", "editor.action.triggerSuggest", {})
      }, 80)
    })
    editor.onDidDispose(() => window.clearTimeout(suggestionTimer))
    onCursorPositionChange?.(
      editor.getPosition()?.lineNumber ?? 1,
      editor.getPosition()?.column ?? 1,
    )
    editor.onDidChangeCursorPosition((event) => {
      onCursorPositionChange?.(event.position.lineNumber, event.position.column)
    })
    editor.onDidFocusEditorText(() => onFocus?.())
    onMount?.(editor)
  }

  return (
    <MonacoContextMenu editorRef={editorMenuRef} readOnly={readOnly}>
      <div className={cn("size-full min-h-0", className)}>
        <Editor
          path={`aestival://workspace/${modelPath.replace(/^\/+/, "")}`}
          saveViewState={false}
          language={language}
          value={value}
          beforeMount={handleBeforeMount}
          onChange={(next) => onChange(next ?? "")}
          onMount={handleMount}
          theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
          loading={<div className="grid size-full place-items-center text-xs text-muted-foreground">正在加载语言服务…</div>}
          options={{
            ariaLabel: `编辑 ${fileId}`,
            automaticLayout: true,
            contextmenu: false,
            fixedOverflowWidgets: true,
            fontFamily: "Geist Mono, ui-monospace, monospace",
            fontSize: 13,
            lineNumbersMinChars: 3,
            minimap: { enabled: false },
            folding: true,
            matchBrackets: "always",
            padding: { top: 10, bottom: 10 },
            readOnly,
            scrollBeyondLastLine: false,
            quickSuggestions: { comments: false, other: true, strings: true },
            quickSuggestionsDelay: 60,
            parameterHints: { enabled: true },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showWords: true,
            },
            suggestOnTriggerCharacters: true,
            snippetSuggestions: "top",
            wordBasedSuggestions: "currentDocument",
            tabSize,
            wordWrap: shouldWrapLanguage(language) ? "on" : "off",
          }}
        />
      </div>
    </MonacoContextMenu>
  )
}

export type DiffEditorSurfaceProps = {
  original: string
  modified: string
  language: string
  mode: "side-by-side" | "inline"
  className?: string
}

export function DiffEditorSurface({
  original,
  modified,
  language,
  mode,
  className,
}: DiffEditorSurfaceProps) {
  const { resolvedTheme } = useTheme()
  return (
    <div className={cn("size-full min-h-0", className)}>
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
        loading={<div className="grid size-full place-items-center text-xs text-muted-foreground">正在加载差异编辑器…</div>}
        options={{
          ariaLabel: "文件差异比较",
          automaticLayout: true,
          contextmenu: false,
          enableSplitViewResizing: true,
          fontFamily: "Geist Mono, ui-monospace, monospace",
          fontSize: 13,
          folding: true,
          minimap: { enabled: false },
          originalEditable: false,
          padding: { top: 10, bottom: 10 },
          readOnly: true,
          renderSideBySide: mode === "side-by-side",
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}

/** Shared workbench name for consumers that render a read-only comparison. */
export const EditorDiffSurface = DiffEditorSurface
