import { useRef } from "react"
import Editor from "@monaco-editor/react"

import { MonacoContextMenu, type MonacoEditorInstance } from "@/components/shared/monaco-context-menu"
import "@/lib/monaco-environment"

export function CapabilityCodeEditor({ language, value }: { language: string; value: string }) {
  const editorRef = useRef<MonacoEditorInstance | null>(null)
  return (
    <div className="h-72 overflow-hidden rounded-lg border">
      <MonacoContextMenu editorRef={editorRef}>
        <Editor
          height="100%"
          language={language}
          value={value}
          theme="vs"
          onMount={(editor) => {
            editorRef.current = editor
          }}
          options={{
            ariaLabel: "能力代码编辑器",
            contextmenu: false,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </MonacoContextMenu>
    </div>
  )
}
