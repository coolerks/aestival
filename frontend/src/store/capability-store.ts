import { create } from "zustand"

import {
  initialCapabilities,
  type CapabilityRecord,
  type CapabilityStatus,
  type CapabilityTab,
} from "@/data/mock-capabilities"

export type CapabilityDialog = "create" | "delete" | null

type CapabilityStore = {
  records: CapabilityRecord[]
  activeTab: CapabilityTab
  search: string
  statusFilter: "all" | CapabilityStatus
  sourceFilter: string
  selectedId: string | null
  detailsOpen: boolean
  dialog: CapabilityDialog
  dialogId: string | null
  wizardStep: number
  installMethod: "manual" | "ai" | "market"
  hookStage: string
  validationProgress: number
  setActiveTab: (tab: CapabilityTab) => void
  setSearch: (search: string) => void
  setStatusFilter: (status: "all" | CapabilityStatus) => void
  setSourceFilter: (source: string) => void
  openDetails: (id: string) => void
  setDetailsOpen: (open: boolean) => void
  setDialog: (dialog: CapabilityDialog, id?: string | null) => void
  setWizardStep: (step: number) => void
  setInstallMethod: (method: "manual" | "ai" | "market") => void
  setHookStage: (stage: string) => void
  toggleEnabled: (id: string) => void
  deleteRecord: (id: string) => void
  validateMock: () => void
}

export const useCapabilityStore = create<CapabilityStore>((set) => ({
  records: initialCapabilities.map((record) => ({ ...record, meta: [...record.meta], permissions: [...record.permissions] })),
  activeTab: "mcp",
  search: "",
  statusFilter: "all",
  sourceFilter: "all",
  selectedId: null,
  detailsOpen: false,
  dialog: null,
  dialogId: null,
  wizardStep: 1,
  installMethod: "manual",
  hookStage: "all",
  validationProgress: 0,
  setActiveTab: (activeTab) => set({ activeTab, search: "", statusFilter: "all", sourceFilter: "all", hookStage: "all" }),
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  openDetails: (selectedId) => set({ selectedId, detailsOpen: true }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  setDialog: (dialog, dialogId = null) => set({ dialog, dialogId, wizardStep: 1, validationProgress: 0 }),
  setWizardStep: (wizardStep) => set({ wizardStep }),
  setInstallMethod: (installMethod) => set({ installMethod, validationProgress: 0 }),
  setHookStage: (hookStage) => set({ hookStage }),
  toggleEnabled: (id) => set((state) => ({
    records: state.records.map((record) => record.id === id
      ? { ...record, enabled: !record.enabled, status: record.enabled ? "disabled" : "enabled" }
      : record),
  })),
  deleteRecord: (id) => set((state) => ({
    records: state.records.filter((record) => record.id !== id),
    dialog: null,
    dialogId: null,
    detailsOpen: state.selectedId === id ? false : state.detailsOpen,
  })),
  validateMock: () => set({ validationProgress: 20 }),
}))
