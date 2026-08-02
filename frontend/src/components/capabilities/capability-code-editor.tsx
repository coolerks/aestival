import Editor from "@monaco-editor/react"

import "@/lib/monaco-environment"

export function CapabilityCodeEditor({ language, value }: { language: string; value: string }) {
  return (
    <div className="h-72 overflow-hidden rounded-lg border">
      <Editor
        height="100%"
        language={language}
        value={value}
        theme="vs"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          padding: { top: 12 },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  )
}
