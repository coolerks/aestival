import { GitForkIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { MockForkRelation } from "@/data/mock-conversation-management"

type ForkRelationBarProps = {
  relation: MockForkRelation
  onNavigate: (target: "origin" | "branch") => void
}

export function ForkRelationBar({
  relation,
  onNavigate,
}: ForkRelationBarProps) {
  return (
    <Alert>
      <GitForkIcon aria-hidden="true" />
      <AlertTitle>Mock 分叉关系</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>
          原会话快照和当前分支均保留在前端内存中，可往返检查。
        </span>
        <span className="flex flex-wrap gap-2">
          <Button
            variant={relation.active === "origin" ? "secondary" : "outline"}
            size="sm"
            onClick={() => onNavigate("origin")}
          >
            原会话
          </Button>
          <Button
            variant={relation.active === "branch" ? "secondary" : "outline"}
            size="sm"
            onClick={() => onNavigate("branch")}
          >
            当前分支
          </Button>
        </span>
      </AlertDescription>
    </Alert>
  )
}
