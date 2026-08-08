import type { ComponentProps } from "react"

import document from "@/assets/icons/material/document.svg"
import image from "@/assets/icons/material/image.svg"
import json from "@/assets/icons/material/json.svg"
import markdown from "@/assets/icons/material/markdown.svg"
import pdf from "@/assets/icons/material/pdf.svg"
import reactTs from "@/assets/icons/material/react_ts.svg"
import type { MockFile } from "@/data/mock-workspace-panels"
import { cn } from "@/lib/utils"

const fileIcons: Record<MockFile["icon"], string> = {
  document,
  image,
  json,
  markdown,
  pdf,
  react_ts: reactTs,
}

export function EditorFileIcon({
  file,
  className,
  ...props
}: Omit<ComponentProps<"img">, "src"> & { file: MockFile }) {
  return (
    <img
      src={fileIcons[file.icon]}
      alt=""
      aria-hidden="true"
      className={cn("size-4 shrink-0", className)}
      {...props}
    />
  )
}
