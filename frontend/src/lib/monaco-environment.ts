import { loader } from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import "../../node_modules/monaco-editor/esm/vs/basic-languages/monaco.contribution.js"
import cssWorker from "../../node_modules/monaco-editor/esm/vs/language/css/css.worker.js?worker"
import editorWorker from "../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js?worker"
import htmlWorker from "../../node_modules/monaco-editor/esm/vs/language/html/html.worker.js?worker"
import jsonWorker from "../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js?worker"
import tsWorker from "../../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js?worker"
import { normalizeLanguageId } from "./monaco-language-registry"

export { monaco }

type MonacoEnvironment = {
  getWorker: (_moduleId: string, label: string) => Worker
}

const workerScope = self as typeof self & {
  MonacoEnvironment?: MonacoEnvironment
}

workerScope.MonacoEnvironment = {
  getWorker: (_moduleId, label) => {
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker()
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker()
    }
    if (label === "json") {
      return new jsonWorker()
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

loader.config({ monaco })

const registeredCompletionLanguages = new Set<string>()

const genericKeywords = [
  "if",
  "else",
  "for",
  "while",
  "return",
  "function",
  "class",
  "const",
  "let",
  "var",
  "true",
  "false",
  "null",
  "undefined",
  "import",
  "export",
  "new",
  "try",
  "catch",
  "async",
  "await",
]

const commonKeywords: Record<string, string[]> = {
  javascript: ["const", "let", "function", "return", "import", "export", "async", "await"],
  typescript: ["interface", "type", "enum", "implements", "public", "private", "readonly"],
  python: ["def", "class", "import", "from", "return", "async", "await", "yield"],
  go: ["package", "func", "struct", "interface", "defer", "go", "select"],
  rust: ["fn", "let", "mut", "struct", "enum", "impl", "trait", "match"],
  sql: ["SELECT", "FROM", "WHERE", "JOIN", "GROUP BY", "ORDER BY", "INSERT", "UPDATE"],
  json: ["true", "false", "null"],
  css: ["display", "position", "color", "background", "margin", "padding"],
  html: ["div", "section", "main", "header", "button", "aria-label"],
}

type LocalSnippet = {
  label: string
  detail: string
  insertText: string
}

const commonSnippets: Partial<Record<string, LocalSnippet[]>> = {
  javascript: [
    { label: "console.log", detail: "输出到控制台", insertText: "console.log(${1:value})" },
    { label: "function", detail: "函数声明", insertText: "function ${1:name}(${2:args}) {\n\t${0}\n}" },
    { label: "async function", detail: "异步函数声明", insertText: "async function ${1:name}(${2:args}) {\n\t${0}\n}" },
    { label: "import", detail: "ES 模块导入", insertText: "import { ${1:name} } from \"${2:module}\"" },
  ],
  typescript: [
    { label: "console.log", detail: "输出到控制台", insertText: "console.log(${1:value})" },
    { label: "interface", detail: "接口声明", insertText: "interface ${1:Name} {\n\t${2:key}: ${3:string}\n}" },
    { label: "type", detail: "类型别名", insertText: "type ${1:Name} = {\n\t${2:key}: ${3:string}\n}" },
    { label: "React component", detail: "React 函数组件", insertText: "export function ${1:Component}() {\n\treturn <div>${0}</div>\n}" },
  ],
  python: [
    { label: "def", detail: "函数声明", insertText: "def ${1:name}(${2:args}):\n\t${0:pass}" },
    { label: "class", detail: "类声明", insertText: "class ${1:Name}:\n\tdef __init__(self${2:, args}):\n\t\t${0:pass}" },
  ],
  go: [
    { label: "func", detail: "函数声明", insertText: "func ${1:name}(${2:args}) ${3:error} {\n\t${0}\n}" },
    { label: "if err", detail: "错误检查", insertText: "if err != nil {\n\treturn ${1:err}\n}" },
  ],
  rust: [
    { label: "fn", detail: "函数声明", insertText: "fn ${1:name}(${2:args}) ${3:-> Result<()> }{\n\t${0}\n}" },
    { label: "match", detail: "match 表达式", insertText: "match ${1:value} {\n\t${2:pattern} => ${0},\n}" },
  ],
  html: [
    { label: "document", detail: "HTML 文档骨架", insertText: "<!doctype html>\n<html lang=\"${1:zh-CN}\">\n<head>\n\t<meta charset=\"UTF-8\" />\n\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n\t<title>${2:Document}</title>\n</head>\n<body>\n\t${0}\n</body>\n</html>" },
  ],
  css: [
    { label: "display flex", detail: "Flex 布局", insertText: "display: flex;\n${1:gap}: ${2:1rem};" },
    { label: "display grid", detail: "Grid 布局", insertText: "display: grid;\ngrid-template-columns: ${1:repeat(2, minmax(0, 1fr))};" },
  ],
  markdown: [
    { label: "code fence", detail: "代码块", insertText: "```${1:language}\n${0}\n```" },
    { label: "table", detail: "Markdown 表格", insertText: "| ${1:列 1} | ${2:列 2} |\n| --- | --- |\n| ${0} | |" },
  ],
  sql: [
    { label: "SELECT", detail: "查询语句", insertText: "SELECT ${1:*}\nFROM ${2:table}\nWHERE ${0:condition};" },
  ],
  json: [
    { label: "object", detail: "JSON 对象", insertText: "{\n\t\"${1:key}\": ${0:value}\n}" },
  ],
}

monaco.typescript.typescriptDefaults.setEagerModelSync(true)
monaco.typescript.javascriptDefaults.setEagerModelSync(true)
monaco.typescript.typescriptDefaults.setCompilerOptions({
  allowNonTsExtensions: true,
  allowJs: true,
  jsx: monaco.typescript.JsxEmit.ReactJSX,
  module: monaco.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
  target: monaco.typescript.ScriptTarget.ES2020,
})

export function registerLocalCompletionProviders(primaryLanguage?: string) {
  const normalizedPrimary = primaryLanguage ? normalizeLanguageId(primaryLanguage) : undefined
  const languageIds = normalizedPrimary ? [normalizedPrimary] : ["plaintext"]

  for (const languageId of languageIds) {
    if (registeredCompletionLanguages.has(languageId)) continue
    const disposable = monaco.languages.registerCompletionItemProvider(languageId, {
        triggerCharacters: [".", "/", "\"", "'", "<", "@", ":"],
        provideCompletionItems(model, position) {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }
          const documentWords = model.getValue().match(/[A-Za-z_$][\w$-]{1,}/g) ?? []
          const suggestions = new Set([
            ...genericKeywords,
            ...(commonKeywords[languageId] ?? []),
            ...documentWords,
          ])
          const snippets = languageId === "typescript"
            ? [...(commonSnippets.javascript ?? []), ...(commonSnippets.typescript ?? [])]
            : commonSnippets[languageId] ?? []
          return {
            suggestions: [
              ...snippets.map((snippet, index) => ({
                label: snippet.label,
                detail: snippet.detail,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: snippet.insertText,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                sortText: `0-${String(index).padStart(2, "0")}`,
                range,
              })),
              ...Array.from(suggestions).slice(0, 80).map((label) => ({
                label,
                detail: commonKeywords[languageId]?.includes(label) || genericKeywords.includes(label)
                  ? "Aestival 本地关键字"
                  : "当前文件中的词语",
                kind: commonKeywords[languageId]?.includes(label)
                  || genericKeywords.includes(label)
                  ? monaco.languages.CompletionItemKind.Keyword
                  : monaco.languages.CompletionItemKind.Text,
                insertText: label,
                sortText: `1-${label}`,
                range,
              })),
            ],
          }
        },
    })
    registeredCompletionLanguages.add(languageId)
    void disposable
  }
}
