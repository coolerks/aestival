import { loader } from "@monaco-editor/react"
import * as monaco from "../../node_modules/monaco-editor/esm/vs/editor/editor.api.js"
import "../../node_modules/monaco-editor/esm/vs/languages/definitions/css/register.js"
import "../../node_modules/monaco-editor/esm/vs/languages/definitions/html/register.js"
import "../../node_modules/monaco-editor/esm/vs/languages/definitions/javascript/register.js"
import "../../node_modules/monaco-editor/esm/vs/language/css/monaco.contribution.js"
import "../../node_modules/monaco-editor/esm/vs/language/html/monaco.contribution.js"
import cssWorker from "../../node_modules/monaco-editor/esm/vs/language/css/css.worker.js?worker"
import editorWorker from "../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js?worker"
import htmlWorker from "../../node_modules/monaco-editor/esm/vs/language/html/html.worker.js?worker"

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
    return new editorWorker()
  },
}

loader.config({ monaco })
