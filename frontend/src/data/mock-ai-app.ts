export type MockCodeLanguage = "html" | "css" | "javascript"

export type MockCodeFile = {
  id: string
  name: string
  language: MockCodeLanguage
  content: string
}

export type MockAiCodeBundle = {
  id: string
  suggestedName: string
  description: string
  entryFile: string
  files: MockCodeFile[]
}

export type MockAppNetworkPolicy = "off" | "allowlist" | "all"
export type MockAppWindowSize = "900x680" | "1200x800" | "390x844"

export type MockAppDraftInput = {
  name: string
  description: string
  entryFile: string
  windowSize: MockAppWindowSize
  networkPolicy: MockAppNetworkPolicy
  allowedDomains: string
  fileAccess: boolean
  clipboardRead: boolean
  clipboardWrite: boolean
  sourceConversation: string
  sourceMessageId: string
  sourceModel: string
}

export type MockAppDraft = MockAppDraftInput & {
  id: string
  icon: "aestival-default"
  files: MockCodeFile[]
  createdAt: string
}

export type MockSpeechRate = "0.75" | "1" | "1.25" | "1.5"
export type MockSpeechVoice = "云舟" | "清和" | "远山"

export type MockSpeechPlayback = {
  messageId: string
  sourceTitle: string
  content: string
  playing: boolean
  progress: number
  rate: MockSpeechRate
  voice: MockSpeechVoice
}

export const mockAiCodeBundle: MockAiCodeBundle = {
  id: "sprint-focus-board",
  suggestedName: "冲刺专注板",
  description: "一个由 HTML、CSS 和 JavaScript 组成的本地专注计数小应用。",
  entryFile: "index.html",
  files: [
    {
      id: "index-html",
      name: "index.html",
      language: "html",
      content: `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>冲刺专注板</title>
  </head>
  <body>
    <main class="focus-board">
      <p class="eyebrow">Aestival Mock App</p>
      <h1>今天完成一个关键任务</h1>
      <p id="count">已完成 0 次专注冲刺</p>
      <button id="complete" type="button">完成一次冲刺</button>
    </main>
  </body>
</html>`,
    },
    {
      id: "styles-css",
      name: "styles.css",
      language: "css",
      content: `:root {
  color: #171717;
  background: #f5f5f4;
  font-family: system-ui, sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.focus-board {
  width: min(32rem, calc(100vw - 3rem));
  padding: 2rem;
  border: 1px solid #d6d3d1;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 1rem 3rem rgb(0 0 0 / 8%);
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: #737373;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 1rem;
  font-size: clamp(1.5rem, 5vw, 2.25rem);
}

button {
  margin-top: 1rem;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #ffffff;
  background: #171717;
  font: inherit;
  cursor: pointer;
}`,
    },
    {
      id: "script-js",
      name: "script.js",
      language: "javascript",
      content: `const count = document.querySelector("#count")
const button = document.querySelector("#complete")
let completed = 0

button?.addEventListener("click", () => {
  completed += 1
  if (count) {
    count.textContent = \`已完成 \${completed} 次专注冲刺\`
  }
})`,
    },
  ],
}

export const mockSpeechRates: MockSpeechRate[] = [
  "0.75",
  "1",
  "1.25",
  "1.5",
]

export const mockSpeechVoices: MockSpeechVoice[] = [
  "云舟",
  "清和",
  "远山",
]

export function createMockPreviewDocument(files: MockCodeFile[]) {
  const html =
    files.find((file) => file.language === "html")?.content ??
    "<!doctype html><html><body></body></html>"
  const css =
    files.find((file) => file.language === "css")?.content ?? ""
  const javascript =
    files.find((file) => file.language === "javascript")?.content ?? ""

  const withStyle = html.includes("</head>")
    ? html.replace("</head>", `<style>${css}</style></head>`)
    : `<style>${css}</style>${html}`

  return withStyle.includes("</body>")
    ? withStyle.replace(
        "</body>",
        `<script>${javascript}</script></body>`
      )
    : `${withStyle}<script>${javascript}</script>`
}

export function createMockAppDraft(
  input: MockAppDraftInput,
  files: MockCodeFile[]
): MockAppDraft {
  return {
    ...input,
    id: `mock-app-${Date.now()}`,
    icon: "aestival-default",
    files,
    createdAt: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()),
  }
}
