import {
  CableIcon,
  CirclePowerIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  ConnectionStatusBadge,
  KnowledgeSourceIcon,
  connectionStatusCopy,
} from "@/components/knowledge/knowledge-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getKnowledgeSourceDefinition } from "@/data/mock-knowledge"
import { useKnowledgeStore } from "@/store/knowledge-store"

export function KnowledgeConnections() {
  const connections = useKnowledgeStore((state) => state.connections)
  const statusFilter = useKnowledgeStore(
    (state) => state.connectionStatusFilter
  )
  const searchQuery = useKnowledgeStore((state) => state.searchQuery)
  const setSearchQuery = useKnowledgeStore((state) => state.setSearchQuery)
  const setStatusFilter = useKnowledgeStore(
    (state) => state.setConnectionStatusFilter
  )
  const setNewConnectionOpen = useKnowledgeStore(
    (state) => state.setNewConnectionOpen
  )
  const openConnectionDetails = useKnowledgeStore(
    (state) => state.openConnectionDetails
  )
  const requestDisconnectConnection = useKnowledgeStore(
    (state) => state.requestDisconnectConnection
  )
  const filtered = connections.filter((connection) => {
    const query = searchQuery.toLocaleLowerCase()
    const searchMatch =
      !query ||
      [connection.name, connection.address, ...connection.capabilities]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    return (
      searchMatch &&
      (statusFilter === "all" || connection.status === statusFilter)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="min-w-52 flex-1">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索连接名称、地址或能力"
            aria-label="搜索数据连接"
          />
        </InputGroup>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as typeof statusFilter)
          }
        >
          <SelectTrigger className="w-36" aria-label="筛选连接状态">
            <SelectValue>
              {statusFilter === "all"
                ? "全部状态"
                : connectionStatusCopy[statusFilter].label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="online">在线</SelectItem>
              <SelectItem value="offline">离线</SelectItem>
              <SelectItem value="auth-error">认证失败</SelectItem>
              <SelectItem value="untested">未测试</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setNewConnectionOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          新建连接
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Empty className="min-h-72 rounded-lg border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CableIcon />
            </EmptyMedia>
            <EmptyTitle>没有匹配的数据连接</EmptyTitle>
            <EmptyDescription>
              调整搜索条件，或创建一个只读的前端 Mock 连接。
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>地址</TableHead>
                <TableHead>能力</TableHead>
                <TableHead className="text-right">使用中</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最近测试</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">操作</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((connection) => {
                const definition = getKnowledgeSourceDefinition(connection.type)
                return (
                  <ContextMenu key={connection.id}>
                    <ContextMenuTrigger
                      render={
                        <TableRow
                          tabIndex={0}
                          className="cursor-pointer"
                          onClick={() => openConnectionDetails(connection.id)}
                          onKeyDown={(event) => {
                            if (event.target !== event.currentTarget) return
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              openConnectionDetails(connection.id)
                            }
                          }}
                        />
                      }
                    >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <KnowledgeSourceIcon
                          type={connection.type}
                          className="size-4 shrink-0"
                        />
                        <div>
                          <div className="font-medium">{connection.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {definition?.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-64 truncate font-mono text-xs">
                      {connection.address}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {connection.capabilities.map((capability) => (
                          <Badge key={capability} variant="outline">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {connection.linkedKnowledgeCount}
                    </TableCell>
                    <TableCell>
                      <ConnectionStatusBadge status={connection.status} />
                    </TableCell>
                    <TableCell>{connection.lastTest}</TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`${connection.name} 更多操作`}
                                  />
                                }
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </TooltipTrigger>
                          <TooltipContent>更多操作</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              openConnectionDetails(connection.id)
                            }
                          >
                            <PencilIcon />
                            查看与编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.success(
                                "前端 Mock 测试完成，未发起网络请求"
                              )
                            }
                          >
                            <ShieldCheckIcon />
                            测试连接
                          </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              requestDisconnectConnection(connection.id)
                            }
                          >
                            <CirclePowerIcon />
                            断开连接
                          </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-60">
                      <ContextMenuGroup>
                        <ContextMenuItem
                          onClick={() => openConnectionDetails(connection.id)}
                        >
                          <PencilIcon />
                          查看与编辑
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            toast.success("连接地址已复制（前端 Mock）")
                          }
                        >
                          <CopyIcon />
                          复制连接地址
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            toast.success("前端 Mock 测试完成，未发起网络请求")
                          }
                        >
                          <ShieldCheckIcon />
                          测试连接
                        </ContextMenuItem>
                      </ContextMenuGroup>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        variant="destructive"
                        onClick={() =>
                          requestDisconnectConnection(connection.id)
                        }
                      >
                        <CirclePowerIcon />
                        断开连接
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
