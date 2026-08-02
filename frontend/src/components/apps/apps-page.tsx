import { useEffect } from "react"

import { AppCenterDialogs } from "@/components/apps/app-dialogs"
import { AppEditor } from "@/components/apps/app-editor"
import { AppLibrary } from "@/components/apps/app-library"
import { useAppStore } from "@/store/app-store"
import { useWorkspaceStore } from "@/store/workspace-store"

export function AppsPage() {
  const view = useAppStore((state) => state.view)
  const hydrateConversationDraft = useAppStore((state) => state.hydrateConversationDraft)
  const mockAppDraft = useWorkspaceStore((state) => state.mockAppDraft)

  useEffect(() => {
    if (mockAppDraft) hydrateConversationDraft(mockAppDraft)
  }, [hydrateConversationDraft, mockAppDraft])

  return <div className="relative flex size-full min-h-0 flex-col">{view === "editor" ? <AppEditor /> : <AppLibrary />}<AppCenterDialogs /></div>
}
