export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the DOM fallback used by the desktop WebView.
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.top = "-9999px"
  textarea.style.left = "-9999px"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  try {
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

export async function readTextFromClipboard(): Promise<string | null> {
  try {
    if (!navigator.clipboard?.readText) return null
    return await navigator.clipboard.readText()
  } catch {
    return null
  }
}

export function selectedText(): string {
  return window.getSelection()?.toString() ?? ""
}

export function selectElementContents(element: HTMLElement): void {
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}

export function inputHasSelection(element: HTMLInputElement | HTMLTextAreaElement): boolean {
  return (element.selectionEnd ?? 0) > (element.selectionStart ?? 0)
}

export function replaceInputSelection(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void {
  const start = element.selectionStart ?? element.value.length
  const end = element.selectionEnd ?? start
  element.focus()
  element.setRangeText(value, start, end, "end")
  element.dispatchEvent(new Event("input", { bubbles: true }))
}
