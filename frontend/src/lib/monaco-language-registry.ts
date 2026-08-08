import type { MockFile } from "@/data/mock-workspace-panels"

/**
 * Monaco's built-in language contributions. The package exposes a few
 * definitions under a different directory name (for example `coffee`), but
 * the public language id is the one listed here.
 */
export const MONACO_LANGUAGE_IDS = [
  "plaintext",
  "json",
  "abap",
  "apex",
  "azcli",
  "bat",
  "bicep",
  "cameligo",
  "clojure",
  "coffeescript",
  "c",
  "cpp",
  "csharp",
  "csp",
  "css",
  "cypher",
  "dart",
  "dockerfile",
  "ecl",
  "elixir",
  "flow9",
  "fsharp",
  "freemarker2",
  "go",
  "graphql",
  "handlebars",
  "hcl",
  "html",
  "ini",
  "java",
  "javascript",
  "julia",
  "kotlin",
  "less",
  "lexon",
  "lua",
  "liquid",
  "m3",
  "markdown",
  "mdx",
  "mips",
  "msdax",
  "mysql",
  "objective-c",
  "pascal",
  "pascaligo",
  "perl",
  "pgsql",
  "php",
  "pla",
  "postiats",
  "powerquery",
  "powershell",
  "proto",
  "pug",
  "python",
  "qsharp",
  "r",
  "razor",
  "redis",
  "redshift",
  "restructuredtext",
  "ruby",
  "rust",
  "sb",
  "scala",
  "scheme",
  "scss",
  "shell",
  "sol",
  "sparql",
  "sql",
  "st",
  "swift",
  "systemverilog",
  "verilog",
  "tcl",
  "twig",
  "typescript",
  "typespec",
  "vb",
  "wgsl",
  "xml",
  "yaml",
  "aes",
] as const

export type MonacoLanguageId = (typeof MONACO_LANGUAGE_IDS)[number]

type LanguageMeta = {
  label: string
  aliases?: string[]
  extensions?: string[]
  filenames?: string[]
  /** File icon family consumed by file/editor surfaces when available. */
  iconKey?: MockFile["icon"]
  wrap?: boolean
}

const languageMeta: Partial<Record<MonacoLanguageId, LanguageMeta>> = {
  plaintext: { label: "纯文本", aliases: ["text", "txt"], iconKey: "document", wrap: true },
  json: { label: "JSON", extensions: [".json", ".jsonc"] },
  typescript: { label: "TypeScript", aliases: ["ts", "typescript react"], extensions: [".ts", ".tsx", ".mts", ".cts"], iconKey: "react_ts" },
  javascript: { label: "JavaScript", aliases: ["js", "javascript react"], extensions: [".js", ".jsx", ".mjs", ".cjs"], iconKey: "document" },
  html: { label: "HTML", extensions: [".html", ".htm"] },
  css: { label: "CSS", extensions: [".css"] },
  scss: { label: "SCSS", extensions: [".scss"] },
  less: { label: "Less", extensions: [".less"] },
  markdown: { label: "Markdown", aliases: ["md"], extensions: [".md", ".markdown"], iconKey: "markdown" },
  mdx: { label: "MDX", extensions: [".mdx"] },
  yaml: { label: "YAML", extensions: [".yaml", ".yml"] },
  xml: { label: "XML", extensions: [".xml", ".xsd", ".svg"] },
  python: { label: "Python", aliases: ["py"], extensions: [".py", ".pyw"] },
  go: { label: "Go", extensions: [".go"] },
  rust: { label: "Rust", extensions: [".rs"] },
  java: { label: "Java", extensions: [".java"] },
  kotlin: { label: "Kotlin", extensions: [".kt", ".kts"] },
  c: { label: "C", extensions: [".c", ".h"] },
  cpp: { label: "C++", extensions: [".cpp", ".cc", ".cxx", ".hpp"] },
  csharp: { label: "C#", aliases: ["c#"], extensions: [".cs"] },
  "objective-c": { label: "Objective-C", extensions: [".m", ".mm"] },
  sql: { label: "SQL", extensions: [".sql"] },
  shell: { label: "Shell", aliases: ["bash", "sh"], extensions: [".sh", ".bash", ".zsh"] },
  powershell: { label: "PowerShell", extensions: [".ps1", ".psm1"] },
  dockerfile: { label: "Dockerfile", filenames: ["Dockerfile"] },
  ini: { label: "INI", extensions: [".ini", ".conf"] },
  graphql: { label: "GraphQL", extensions: [".graphql", ".gql"] },
  proto: { label: "Protocol Buffers", aliases: ["protobuf"], extensions: [".proto"] },
  sol: { label: "Solidity", aliases: ["solidity"], extensions: [".sol"] },
  aes: { label: "Sophia", aliases: ["sophia"], extensions: [".aes"] },
}

const fallbackExtensions: Record<string, string> = {
  abap: ".abap",
  apex: ".cls",
  azcli: ".azcli",
  bat: ".bat",
  bicep: ".bicep",
  cameligo: ".mligo",
  clojure: ".clj",
  coffeescript: ".coffee",
  csp: ".csp",
  cypher: ".cypher",
  dart: ".dart",
  ecl: ".ecl",
  elixir: ".ex",
  flow9: ".flow",
  fsharp: ".fs",
  freemarker2: ".ftl",
  hcl: ".hcl",
  handlebars: ".hbs",
  julia: ".jl",
  lexon: ".lexon",
  liquid: ".liquid",
  m3: ".m3",
  mips: ".asm",
  msdax: ".msdax",
  mysql: ".mysql",
  pascal: ".pas",
  pascaligo: ".ligo",
  perl: ".pl",
  pgsql: ".pgsql",
  php: ".php",
  pla: ".pla",
  postiats: ".dats",
  powerquery: ".pq",
  pug: ".pug",
  qsharp: ".qs",
  r: ".r",
  razor: ".cshtml",
  redis: ".redis",
  redshift: ".redshift",
  restructuredtext: ".rst",
  ruby: ".rb",
  sb: ".sb",
  scala: ".scala",
  scheme: ".scm",
  sparql: ".rq",
  st: ".st",
  swift: ".swift",
  systemverilog: ".sv",
  verilog: ".v",
  tcl: ".tcl",
  twig: ".twig",
  typespec: ".tsp",
  vb: ".vb",
  wgsl: ".wgsl",
}

const displayName = (id: MonacoLanguageId) =>
  languageMeta[id]?.label ?? id.replace(/(^|[-_])\w/g, (part) => part.toUpperCase())

export function getLanguageMeta(id: string): LanguageMeta & { id: MonacoLanguageId } {
  const normalized = normalizeLanguageId(id)
  const meta = languageMeta[normalized] ?? ({} as LanguageMeta)
  return {
    id: normalized,
    label: meta.label ?? displayName(normalized),
    aliases: meta.aliases,
    extensions: meta.extensions ?? (fallbackExtensions[normalized] ? [fallbackExtensions[normalized]] : undefined),
    filenames: meta.filenames,
    wrap: meta.wrap ?? (normalized === "markdown" || normalized === "plaintext" || normalized === "restructuredtext"),
  }
}

export function normalizeLanguageId(value: string | undefined): MonacoLanguageId {
  const normalized = value?.trim().toLowerCase() ?? ""
  if (MONACO_LANGUAGE_IDS.includes(normalized as MonacoLanguageId)) return normalized as MonacoLanguageId
  const match = MONACO_LANGUAGE_IDS.find((id) => {
    const meta = languageMeta[id]
    return meta?.aliases?.some((alias) => alias.toLowerCase() === normalized)
  })
  return match ?? "plaintext"
}

export function resolveLanguageId(fileName: string, explicitLanguage?: string): MonacoLanguageId {
  if (explicitLanguage) {
    const explicit = normalizeLanguageId(explicitLanguage)
    if (explicit !== "plaintext" || explicitLanguage.toLowerCase().includes("text")) return explicit
  }
  const nameParts = fileName.split("/")
  const normalizedName = nameParts[nameParts.length - 1]?.toLowerCase() ?? fileName.toLowerCase()
  const exact = MONACO_LANGUAGE_IDS.find((id) => languageMeta[id]?.filenames?.some((name) => name.toLowerCase() === normalizedName))
  if (exact) return exact
  const extensionParts = normalizedName.split(".")
  const extension = normalizedName.includes(".") ? `.${extensionParts[extensionParts.length - 1]}` : ""
  const byExtension = MONACO_LANGUAGE_IDS.find((id) => getLanguageMeta(id).extensions?.includes(extension))
  if (byExtension) return byExtension
  if (normalizedName === "app.tsx") return "typescript"
  if (normalizedName.endsWith(".tsx")) return "typescript"
  if (normalizedName.endsWith(".jsx")) return "javascript"
  if (normalizedName.startsWith("dockerfile")) return "dockerfile"
  return "plaintext"
}

export function languageLabel(id: string): string {
  return getLanguageMeta(id).label
}

export function languageIconKey(id: string): MockFile["icon"] {
  return getLanguageMeta(id).iconKey ?? "document"
}

export function shouldWrapLanguage(id: string): boolean {
  return Boolean(getLanguageMeta(id).wrap)
}

export function languageRegistrySmokeCheck(): { total: number; missing: string[] } {
  const missing = MONACO_LANGUAGE_IDS.filter((id) => !getLanguageMeta(id).label)
  return { total: MONACO_LANGUAGE_IDS.length, missing }
}

export function resolveFileLanguage(file: MockFile): MonacoLanguageId {
  return resolveLanguageId(file.name, file.language)
}

/** Public registry facade for editor consumers and future file-type adapters. */
export const LanguageRegistry = {
  ids: MONACO_LANGUAGE_IDS,
  get: getLanguageMeta,
  normalize: normalizeLanguageId,
  resolve: resolveLanguageId,
  resolveFile: resolveFileLanguage,
  label: languageLabel,
  iconKey: languageIconKey,
  shouldWrap: shouldWrapLanguage,
  smokeCheck: languageRegistrySmokeCheck,
} as const
