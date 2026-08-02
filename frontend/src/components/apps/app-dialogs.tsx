import {
  ClipboardPasteIcon,
  FileArchiveIcon,
  FileCode2Icon,
  FolderInputIcon,
  ImageIcon,
  MessageSquareCodeIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import appIcon from "@/assets/icons/application/icon.svg"
import { CompactDefinitionList } from "@/components/shared/compact-definition-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { appPermissionLabels, appSourceLabels, appStatusLabels, type AppPermissions } from "@/data/mock-app-center"
import { useAppStore } from "@/store/app-store"

const createSources = [
  { id: "blank", label: "空白应用", description: "从标准的三个入口文件开始。", icon: FileCode2Icon },
  { id: "folder", label: "导入本地目录", description: "选择包含 HTML、CSS 和 JavaScript 的目录。", icon: FolderInputIcon },
  { id: "clipboard", label: "从剪贴板导入", description: "解析复制的代码片段，当前仅展示 Mock 流程。", icon: ClipboardPasteIcon },
  { id: "conversation", label: "从会话创建", description: "回到代理会话，让 AI 代码块加入应用中心。", icon: MessageSquareCodeIcon },
]

export function AppCenterDialogs() {
  const apps = useAppStore((state) => state.apps)
  const dialog = useAppStore((state) => state.dialog)
  const dialogAppId = useAppStore((state) => state.dialogAppId)
  const importConflict = useAppStore((state) => state.importConflict)
  const setDialog = useAppStore((state) => state.setDialog)
  const setImportConflict = useAppStore((state) => state.setImportConflict)
  const createBlankApp = useAppStore((state) => state.createBlankApp)
  const deleteApp = useAppStore((state) => state.deleteApp)
  const updatePermission = useAppStore((state) => state.updatePermission)
  const app = apps.find((item) => item.id === dialogAppId)

  return (
    <>
      <Dialog open={dialog === "create"} onOpenChange={(open) => setDialog(open ? "create" : null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>新建本地应用</DialogTitle><DialogDescription>选择源码入口。创建后会进入完整应用编辑器，不在此对话框内编辑代码。</DialogDescription></DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {createSources.map((source) => {
              const Icon = source.icon
              return (
                <Item key={source.id} variant="outline" render={<button type="button" />} onClick={() => {
                  if (source.id === "blank") createBlankApp()
                  else if (source.id === "conversation") toast.info("请从代理会话的代码块选择“加入应用”")
                  else setDialog("import")
                }}>
                  <ItemMedia variant="icon"><Icon /></ItemMedia><ItemContent><ItemTitle>{source.label}</ItemTitle><ItemDescription>{source.description}</ItemDescription></ItemContent>
                </Item>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "import"} onOpenChange={(open) => setDialog(open ? "import" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入应用</DialogTitle><DialogDescription>文件选择和写入尚未接入；先确认同名应用冲突的交互策略。</DialogDescription></DialogHeader>
          <Alert><FileArchiveIcon /><AlertTitle>前端 Mock</AlertTitle><AlertDescription>不会打开目录、读取剪贴板或覆盖本地文件。</AlertDescription></Alert>
          <Field><FieldLabel>发现同名应用时</FieldLabel><RadioGroup value={importConflict} onValueChange={(value) => setImportConflict(value as typeof importConflict)}>
            {[
              ["keep", "保留两者", "为新应用追加名称后缀。"],
              ["overwrite", "覆盖现有应用", "实际接入后需要再次危险确认。"],
              ["cancel", "取消本次导入", "保持应用中心不变。"],
            ].map(([value, title, description]) => <Label key={value} className="flex items-start gap-3 rounded-lg border p-3"><RadioGroupItem value={value} className="mt-0.5" /><span className="grid gap-1"><span className="font-medium">{title}</span><span className="text-xs text-muted-foreground">{description}</span></span></Label>)}
          </RadioGroup><FieldDescription>导入过程会在接入本地服务后展示校验与进度。</FieldDescription></Field>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>取消</Button><Button onClick={() => { toast.info("导入流程为前端 Mock"); setDialog(null) }} disabled={importConflict === "cancel"}><FolderInputIcon data-icon="inline-start" />选择目录</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={dialog === "details" && Boolean(app)} onOpenChange={(open) => !open && setDialog(null)}>
        <SheetContent className="sm:max-w-xl">
          {app ? <ScrollArea className="size-full"><div className="p-5"><SheetHeader className="px-0"><div className="flex items-center gap-3"><img src={appIcon} alt="Aestival 默认应用图标" className="size-11" /><div><SheetTitle>{app.name}</SheetTitle><SheetDescription>{app.description}</SheetDescription></div></div></SheetHeader>
            <Tabs defaultValue="overview" className="mt-5"><TabsList className="w-full overflow-x-auto"><TabsTrigger className="min-w-fit" value="overview">概览</TabsTrigger><TabsTrigger className="min-w-fit" value="code">代码</TabsTrigger><TabsTrigger className="min-w-fit" value="permissions">权限</TabsTrigger><TabsTrigger className="min-w-fit" value="activity">活动</TabsTrigger><TabsTrigger className="min-w-fit" value="settings">设置</TabsTrigger></TabsList>
              <TabsContent value="overview" className="pt-4"><CompactDefinitionList rows={[{ label: "来源", value: appSourceLabels[app.source] }, { label: "状态与运行", value: `${appStatusLabels[app.status]} · 已运行 ${app.runCount} 次` }]} />{app.sourceConversation ? <Alert className="mt-3"><MessageSquareCodeIcon /><AlertTitle>来自会话</AlertTitle><AlertDescription>{app.sourceConversation} · {app.sourceModel}</AlertDescription></Alert> : null}</TabsContent>
              <TabsContent value="code" className="pt-4"><CompactDefinitionList rows={app.files.map((file) => ({ label: file.name, value: `${file.language} · ${file.content.split("\n").length} 行` }))} /></TabsContent>
              <TabsContent value="permissions" className="pt-4"><Permissions appId={app.id} permissions={app.permissions} onChange={updatePermission} /></TabsContent>
              <TabsContent value="activity" className="pt-4"><CompactDefinitionList rows={[{ label: "更新应用配置", value: `${app.updatedAt} · 本地 Mock 记录` }, { label: "运行预览", value: app.lastRunAt ?? "尚无运行记录" }]} /></TabsContent>
              <TabsContent value="settings" className="pt-4"><Alert><ShieldCheckIcon /><AlertTitle>本地优先</AlertTitle><AlertDescription>应用窗口、开机启动与文件目录设置将在桌面服务接入后生效。</AlertDescription></Alert></TabsContent>
            </Tabs></div></ScrollArea> : null}
        </SheetContent>
      </Sheet>

      <Dialog open={dialog === "permissions" && Boolean(app)} onOpenChange={(open) => !open && setDialog(null)}><DialogContent><DialogHeader><DialogTitle>{app?.name} · 权限</DialogTitle><DialogDescription>权限默认关闭；这里的变更只保存在当前前端 Mock 状态。</DialogDescription></DialogHeader>{app ? <Permissions appId={app.id} permissions={app.permissions} onChange={updatePermission} /> : null}</DialogContent></Dialog>

      <Dialog open={dialog === "icon" && Boolean(app)} onOpenChange={(open) => !open && setDialog(null)}><DialogContent><DialogHeader><DialogTitle>更换应用图标</DialogTitle><DialogDescription>当前仅提供项目内的 Aestival 默认 SVG，后续接入本地图标选择。</DialogDescription></DialogHeader><div className="flex items-center justify-center gap-6 rounded-xl bg-muted/40 p-6"><div className="size-24 rounded-2xl bg-background p-4 ring-1 ring-foreground/10"><AspectRatio ratio={1}><img src={appIcon} alt="应用图标大尺寸预览" className="size-full" /></AspectRatio></div><div className="grid gap-2"><Badge variant="secondary">项目图标</Badge><span className="text-sm font-medium">{app?.name}</span><span className="text-xs text-muted-foreground">SVG · 多尺寸自适应</span></div></div><DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>取消</Button><Button onClick={() => { toast.success("已选择默认应用图标"); setDialog(null) }}><ImageIcon data-icon="inline-start" />使用此图标</Button></DialogFooter></DialogContent></Dialog>

      <AlertDialog open={dialog === "delete" && Boolean(app)} onOpenChange={(open) => !open && setDialog(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>删除“{app?.name}”？</AlertDialogTitle><AlertDialogDescription>当前只会从前端 Mock 列表移除。接入本地存储后，删除源码目录前会再次明确确认。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => app && deleteApp(app.id)}><Trash2Icon data-icon="inline-start" />删除应用</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  )
}

function Permissions({ appId, permissions, onChange }: { appId: string; permissions: AppPermissions; onChange: (appId: string, key: keyof AppPermissions, enabled: boolean) => void }) {
  return <CompactDefinitionList rows={Object.entries(permissions).map(([key, enabled]) => ({ label: appPermissionLabels[key as keyof AppPermissions], value: enabled ? "已允许，运行时仍受本地策略限制。" : "默认关闭。", action: <Switch checked={enabled} onCheckedChange={(checked) => onChange(appId, key as keyof AppPermissions, checked)} aria-label={`${appPermissionLabels[key as keyof AppPermissions]}权限`} /> }))} />
}
