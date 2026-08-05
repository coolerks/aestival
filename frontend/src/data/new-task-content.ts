import rawContent from "@/data/new-task-content.json"

export type WelcomePoemMetadataMode =
  | "none"
  | "author"
  | "title"
  | "author-title"

export type WelcomePoem = {
  id: string
  text: string
  author: string
  title: string
}

export type WelcomePeriod =
  | "00:00-04:59"
  | "05:00-07:59"
  | "08:00-11:59"
  | "12:00-13:59"
  | "14:00-17:59"
  | "18:00-20:59"
  | "21:00-23:59"

type NewTaskContent = {
  version: number
  periods: Record<WelcomePeriod, string[]>
  poems: WelcomePoem[]
  placeholders: string[]
}

export const newTaskContent = rawContent as NewTaskContent

const poemById = new Map(
  newTaskContent.poems.map((poem) => [poem.id, poem])
)

function randomIndex(length: number): number {
  if (length <= 1) return 0
  return Math.floor(Math.random() * length)
}

function getWelcomePoemCandidates(hour: number): WelcomePoem[] {
  const period = getWelcomePeriod(hour)
  return newTaskContent.periods[period]
    .map((id) => poemById.get(id))
    .filter((poem): poem is WelcomePoem => Boolean(poem))
}

export function getWelcomePeriod(hour = new Date().getHours()): WelcomePeriod {
  if (hour < 5) return "00:00-04:59"
  if (hour < 8) return "05:00-07:59"
  if (hour < 12) return "08:00-11:59"
  if (hour < 14) return "12:00-13:59"
  if (hour < 18) return "14:00-17:59"
  if (hour < 21) return "18:00-20:59"
  return "21:00-23:59"
}

export function pickWelcomePoem(
  hour = new Date().getHours()
): WelcomePoem {
  const candidates = getWelcomePoemCandidates(hour)

  return candidates[randomIndex(candidates.length)] ?? newTaskContent.poems[0]
}

export function pickAnotherWelcomePoem(
  currentId: string,
  hour = new Date().getHours()
): WelcomePoem {
  const candidates = getWelcomePoemCandidates(hour)
  const alternatives = candidates.filter((poem) => poem.id !== currentId)

  return alternatives[randomIndex(alternatives.length)]
    ?? candidates[0]
    ?? newTaskContent.poems[0]
}

export function pickPromptPlaceholder(): string {
  return newTaskContent.placeholders[randomIndex(newTaskContent.placeholders.length)]
    ?? "随心输入，描述你想完成的任务…"
}

export function formatWelcomePoem(
  poem: WelcomePoem,
  mode: WelcomePoemMetadataMode
): string {
  if (mode === "author") return `${poem.text}——${poem.author}`
  if (mode === "title") return `${poem.text}——《${poem.title}》`
  if (mode === "author-title") {
    return `${poem.text}——${poem.author}《${poem.title}》`
  }
  return poem.text
}
