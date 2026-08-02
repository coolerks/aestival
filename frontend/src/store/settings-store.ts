import { create } from "zustand"

import { mockConnections, mockPairingRequests, type ConnectionStatus, type MockConnection, type SettingsCategory } from "@/data/mock-settings"

export type SettingsDialog = "provider" | "model" | "connection" | "pairing" | "disconnect" | "shortcut" | "reset" | "cache" | null

type SettingsStore = {
  activeCategory: SettingsCategory
  search: string
  categorySheetOpen: boolean
  modelTab: "providers" | "models" | "routing" | "limits"
  connectionTab: "connections" | "pairings" | "activity"
  connectionSearch: string
  connectionStatus: "all" | ConnectionStatus
  riskOnly: boolean
  connections: MockConnection[]
  pairingIds: string[]
  selectedConnectionId: string | null
  connectionDetailsOpen: boolean
  dialog: SettingsDialog
  dialogId: string | null
  wizardStep: number
  selectedPlatform: string
  privatePolicy: "pairing" | "allowlist" | "disabled" | "open"
  notificationEnabled: Record<string, boolean>
  quietHours: boolean
  theme: "light" | "dark" | "system"
  motion: boolean
  fontSize: number
  codeFontSize: number
  shortcutSearch: string
  shortcutConflictsOnly: boolean
  setActiveCategory: (category: SettingsCategory) => void
  setSearch: (search: string) => void
  setCategorySheetOpen: (open: boolean) => void
  setModelTab: (tab: "providers" | "models" | "routing" | "limits") => void
  setConnectionTab: (tab: "connections" | "pairings" | "activity") => void
  setConnectionSearch: (search: string) => void
  setConnectionStatus: (status: "all" | ConnectionStatus) => void
  setRiskOnly: (value: boolean) => void
  openConnectionDetails: (id: string) => void
  setConnectionDetailsOpen: (open: boolean) => void
  setDialog: (dialog: SettingsDialog, id?: string | null) => void
  setWizardStep: (step: number) => void
  setSelectedPlatform: (platform: string) => void
  setPrivatePolicy: (policy: "pairing" | "allowlist" | "disabled" | "open") => void
  toggleConnection: (id: string) => void
  disconnectConnection: (id: string) => void
  resolvePairing: (id: string) => void
  setNotificationEnabled: (event: string, enabled: boolean) => void
  setQuietHours: (enabled: boolean) => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setMotion: (enabled: boolean) => void
  setFontSize: (size: number) => void
  setCodeFontSize: (size: number) => void
  setShortcutSearch: (search: string) => void
  setShortcutConflictsOnly: (value: boolean) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  activeCategory: "models",
  search: "",
  categorySheetOpen: false,
  modelTab: "providers",
  connectionTab: "connections",
  connectionSearch: "",
  connectionStatus: "all",
  riskOnly: false,
  connections: mockConnections.map((connection) => ({ ...connection, capabilities: [...connection.capabilities] })),
  pairingIds: mockPairingRequests.map((request) => request.id),
  selectedConnectionId: null,
  connectionDetailsOpen: false,
  dialog: null,
  dialogId: null,
  wizardStep: 1,
  selectedPlatform: "telegram",
  privatePolicy: "pairing",
  notificationEnabled: {},
  quietHours: false,
  theme: "system",
  motion: true,
  fontSize: 14,
  codeFontSize: 13,
  shortcutSearch: "",
  shortcutConflictsOnly: false,
  setActiveCategory: (activeCategory) => set({ activeCategory, categorySheetOpen: false }),
  setSearch: (search) => set({ search }),
  setCategorySheetOpen: (categorySheetOpen) => set({ categorySheetOpen }),
  setModelTab: (modelTab) => set({ modelTab }),
  setConnectionTab: (connectionTab) => set({ connectionTab }),
  setConnectionSearch: (connectionSearch) => set({ connectionSearch }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setRiskOnly: (riskOnly) => set({ riskOnly }),
  openConnectionDetails: (selectedConnectionId) => set({ selectedConnectionId, connectionDetailsOpen: true }),
  setConnectionDetailsOpen: (connectionDetailsOpen) => set({ connectionDetailsOpen }),
  setDialog: (dialog, dialogId = null) => set({ dialog, dialogId, wizardStep: 1 }),
  setWizardStep: (wizardStep) => set({ wizardStep }),
  setSelectedPlatform: (selectedPlatform) => set({ selectedPlatform }),
  setPrivatePolicy: (privatePolicy) => set({ privatePolicy }),
  toggleConnection: (id) => set((state) => ({ connections: state.connections.map((connection) => connection.id === id ? { ...connection, status: connection.status === "paused" ? "online" : "paused" } : connection) })),
  disconnectConnection: (id) => set((state) => ({ connections: state.connections.filter((connection) => connection.id !== id), dialog: null, dialogId: null, connectionDetailsOpen: state.selectedConnectionId === id ? false : state.connectionDetailsOpen })),
  resolvePairing: (id) => set((state) => ({ pairingIds: state.pairingIds.filter((pairingId) => pairingId !== id), dialog: null, dialogId: null })),
  setNotificationEnabled: (event, enabled) => set((state) => ({ notificationEnabled: { ...state.notificationEnabled, [event]: enabled } })),
  setQuietHours: (quietHours) => set({ quietHours }),
  setTheme: (theme) => set({ theme }),
  setMotion: (motion) => set({ motion }),
  setFontSize: (fontSize) => set({ fontSize }),
  setCodeFontSize: (codeFontSize) => set({ codeFontSize }),
  setShortcutSearch: (shortcutSearch) => set({ shortcutSearch }),
  setShortcutConflictsOnly: (shortcutConflictsOnly) => set({ shortcutConflictsOnly }),
}))
