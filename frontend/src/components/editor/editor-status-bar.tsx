import { AlertTriangleIcon, CheckCircle2Icon, CircleAlertIcon } from "lucide-react"

import {
  languageLabel,
  MONACO_LANGUAGE_IDS,
} from "@/lib/monaco-language-registry"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type EditorStatusBarProps = {
  languageId: string
  line: number
  column: number
  encoding: string
  lineEnding: string
  tabSize?: number
  errors?: number
  warnings?: number
  fileSize: string
  dirty: boolean
  readonly?: boolean
  onTabSizeChange?: (tabSize: number) => void
  onEncodingChange?: (encoding: string) => void
  onLineEndingChange?: (lineEnding: string) => void
  onLanguageChange?: (languageId: string) => void
}

export function EditorStatusBar({
  languageId,
  line,
  column,
  encoding,
  lineEnding,
  tabSize = 2,
  errors = 0,
  warnings = 0,
  fileSize,
  dirty,
  readonly = false,
  onTabSizeChange,
  onEncodingChange,
  onLineEndingChange,
  onLanguageChange,
}: EditorStatusBarProps) {
  const compactSelectClass = "h-6 border-0 bg-transparent px-1 text-[11px] shadow-none"
  return (
    <div className="flex h-7 shrink-0 items-center gap-3 border-t px-3 text-[11px] text-muted-foreground">
      <span>行 {line}，列 {column}</span>
      <Select value={String(tabSize)} onValueChange={(value) => { if (value) onTabSizeChange?.(Number(value)) }}>
        <SelectTrigger size="sm" className={compactSelectClass} aria-label="缩进大小"><SelectValue>空格: {tabSize}</SelectValue></SelectTrigger>
        <SelectContent><SelectGroup><SelectItem value="2">空格: 2</SelectItem><SelectItem value="4">空格: 4</SelectItem></SelectGroup></SelectContent>
      </Select>
      <Select value={encoding} onValueChange={(value) => { if (value) onEncodingChange?.(value) }}>
        <SelectTrigger size="sm" className={compactSelectClass} aria-label="文件编码"><SelectValue>{encoding}</SelectValue></SelectTrigger>
        <SelectContent><SelectGroup><SelectItem value="UTF-8">UTF-8</SelectItem><SelectItem value="UTF-16 LE">UTF-16 LE</SelectItem><SelectItem value="UTF-16 BE">UTF-16 BE</SelectItem></SelectGroup></SelectContent>
      </Select>
      <Select value={lineEnding} onValueChange={(value) => { if (value) onLineEndingChange?.(value) }}>
        <SelectTrigger size="sm" className={compactSelectClass} aria-label="换行符"><SelectValue>{lineEnding}</SelectValue></SelectTrigger>
        <SelectContent><SelectGroup><SelectItem value="LF">LF</SelectItem><SelectItem value="CRLF">CRLF</SelectItem></SelectGroup></SelectContent>
      </Select>
      <Select value={languageId} onValueChange={(value) => { if (value) onLanguageChange?.(value) }}>
        <SelectTrigger size="sm" className={`${compactSelectClass} hidden sm:flex`} aria-label="语言模式"><SelectValue>{languageLabel(languageId)}</SelectValue></SelectTrigger>
        <SelectContent><SelectGroup>{MONACO_LANGUAGE_IDS.map((id) => <SelectItem key={id} value={id}>{languageLabel(id)}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      <span className="flex-1" />
      {errors > 0 ? <span className="inline-flex items-center gap-1 text-destructive"><CircleAlertIcon className="size-3.5" />{errors}</span> : <span className="inline-flex items-center gap-1"><CheckCircle2Icon className="size-3.5" />无错误</span>}
      {warnings > 0 ? <span className="inline-flex items-center gap-1 text-amber-600"><AlertTriangleIcon className="size-3.5" />{warnings}</span> : null}
      <span>{fileSize}</span>
      <span>{readonly ? "只读" : dirty ? "已修改" : "已保存"}</span>
    </div>
  )
}
