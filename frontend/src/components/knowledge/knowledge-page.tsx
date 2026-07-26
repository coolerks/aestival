import {
  CableIcon,
  DatabaseIcon,
  RefreshCwIcon,
  SearchCheckIcon,
} from "lucide-react"

import { KnowledgeConnections } from "@/components/knowledge/knowledge-connections"
import {
  ConnectionDetails,
  KnowledgeDetails,
  KnowledgeManagementDialogs,
} from "@/components/knowledge/knowledge-details"
import { KnowledgeOverview } from "@/components/knowledge/knowledge-overview"
import { KnowledgeRetrievalTest } from "@/components/knowledge/knowledge-retrieval-test"
import { KnowledgeSyncRecords } from "@/components/knowledge/knowledge-sync-records"
import {
  NewConnectionWizard,
  NewKnowledgeWizard,
} from "@/components/knowledge/knowledge-wizards"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { KnowledgeTab } from "@/data/mock-knowledge"
import { useKnowledgeStore } from "@/store/knowledge-store"

const descriptions: Record<KnowledgeTab, string> = {
  libraries: "组织来源、切片与检索配置，并控制哪些智能体可以使用。",
  connections: "管理数据库、向量库、搜索索引与本地文件来源。",
  retrieval: "调整参数并验证本地 Mock 检索结果与可观察过程。",
  sync: "查看同步变化、失败项、估算 token 与本地索引状态。",
}

export function KnowledgePage() {
  const activeTab = useKnowledgeStore((state) => state.activeTab)
  const setActiveTab = useKnowledgeStore((state) => state.setActiveTab)

  return (
    <section className="flex size-full min-h-0 flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as KnowledgeTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            <TabsList className="max-w-full justify-start overflow-x-auto">
              <TabsTrigger value="libraries">
                <DatabaseIcon />
                知识库
              </TabsTrigger>
              <TabsTrigger value="connections">
                <CableIcon />
                数据连接
              </TabsTrigger>
              <TabsTrigger value="retrieval">
                <SearchCheckIcon />
                检索测试
              </TabsTrigger>
              <TabsTrigger value="sync">
                <RefreshCwIcon />
                同步记录
              </TabsTrigger>
            </TabsList>
            <p className="mt-2 text-sm text-muted-foreground">
              {descriptions[activeTab]}
            </p>
          </div>
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            前端 Mock
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <TabsContent value="libraries" className="mt-0">
            <KnowledgeOverview />
          </TabsContent>
          <TabsContent value="connections" className="mt-0">
            <KnowledgeConnections />
          </TabsContent>
          <TabsContent value="retrieval" className="mt-0">
            <KnowledgeRetrievalTest />
          </TabsContent>
          <TabsContent value="sync" className="mt-0">
            <KnowledgeSyncRecords />
          </TabsContent>
        </div>
      </Tabs>
      <KnowledgeDetails />
      <ConnectionDetails />
      <NewConnectionWizard />
      <NewKnowledgeWizard />
      <KnowledgeManagementDialogs />
    </section>
  )
}
