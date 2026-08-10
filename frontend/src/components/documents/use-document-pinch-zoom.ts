import { useEffect, useRef, type RefObject } from "react"

type UseDocumentPinchZoomOptions = {
  rootRef: RefObject<HTMLElement | null>
  zoom: number
  minZoom: number
  maxZoom: number
  onZoomChange: (zoom: number) => void
  enabled?: boolean
}

type GestureEventLike = Event & {
  scale?: number
}

function clampZoom(zoom: number, minZoom: number, maxZoom: number) {
  return Math.min(maxZoom, Math.max(minZoom, Math.round(zoom)))
}

function isZoomSurface(target: EventTarget | null) {
  return target instanceof Element
    && Boolean(target.closest("[data-document-zoom-surface]"))
    && !target.closest("[data-document-zoom-ignore]")
}

/**
 * Normalises Chromium ctrl+wheel pinch events and WebKit gesture events.
 * The listener is deliberately scoped to the document surface so toolbars,
 * navigation panes and sheet tabs keep their normal wheel behaviour.
 */
export function useDocumentPinchZoom({
  rootRef,
  zoom,
  minZoom,
  maxZoom,
  onZoomChange,
  enabled = true,
}: UseDocumentPinchZoomOptions) {
  const zoomRef = useRef(zoom)
  const onZoomChangeRef = useRef(onZoomChange)
  const frameRef = useRef<number | null>(null)
  const pendingZoomRef = useRef(zoom)
  const gestureStartZoomRef = useRef(zoom)

  useEffect(() => {
    zoomRef.current = zoom
    pendingZoomRef.current = zoom
  }, [zoom])
  useEffect(() => {
    onZoomChangeRef.current = onZoomChange
  }, [onZoomChange])

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current
    if (!root) return

    const commit = (nextZoom: number) => {
      pendingZoomRef.current = clampZoom(nextZoom, minZoom, maxZoom)
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        const next = pendingZoomRef.current
        if (next === zoomRef.current) return
        zoomRef.current = next
        onZoomChangeRef.current(next)
      })
    }

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey || !isZoomSurface(event.target)) return
      event.preventDefault()
      event.stopPropagation()
      const factor = Math.exp(-event.deltaY * 0.012)
      commit(pendingZoomRef.current * factor)
    }
    const onGestureStart = (event: Event) => {
      if (!isZoomSurface(event.target)) return
      event.preventDefault()
      gestureStartZoomRef.current = zoomRef.current
    }
    const onGestureChange = (event: Event) => {
      if (!isZoomSurface(event.target)) return
      event.preventDefault()
      const scale = (event as GestureEventLike).scale
      if (typeof scale === "number" && Number.isFinite(scale)) {
        commit(gestureStartZoomRef.current * scale)
      }
    }

    root.addEventListener("wheel", onWheel, { passive: false })
    root.addEventListener("gesturestart", onGestureStart, { passive: false })
    root.addEventListener("gesturechange", onGestureChange, { passive: false })
    return () => {
      root.removeEventListener("wheel", onWheel)
      root.removeEventListener("gesturestart", onGestureStart)
      root.removeEventListener("gesturechange", onGestureChange)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
    }
  }, [enabled, maxZoom, minZoom, rootRef])
}
