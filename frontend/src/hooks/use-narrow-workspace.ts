import { useEffect, useState } from "react"

const NARROW_WORKSPACE_QUERY = "(max-width: 1099px)"

export function useNarrowWorkspace() {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(NARROW_WORKSPACE_QUERY)
    const update = () => setIsNarrow(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  return isNarrow
}
