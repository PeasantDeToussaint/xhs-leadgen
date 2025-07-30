"use client"

import { useState } from "react"
import {
  Check,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Star,
  StarOff,
  Trash2,
  UserPlus,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { mockAnalyzedLeads } from "@/lib/mock-data"
import { PageContainer } from "@/components/layout/page-container"

interface Lead {
  user_id: string
  user_name: string
  user_avatar?: string
  id: string
  content: string
  liked_count: number
  created_time: string
  note_id: string
  note_title: string
  note_url: string
  note_type: "normal" | "video"
  note_cover?: string
  note_liked_count?: number
  aiAnalysis: string
  leadScore: number
  tags: string[]
  engagement: string
  intentLevel: string
  contactPotential: string
  status?: "new" | "contacted" | "qualified" | "converted" | "lost"
  favorite?: boolean
  lastContact?: string
  assignedTo?: string
}

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [leads, setLeads] = useState<Lead[]>(
    mockAnalyzedLeads.map((lead) => ({
      ...lead,
      status: Math.random() > 0.5 ? "new" : "contacted",
      favorite: Math.random() > 0.7,
      lastContact: Math.random() > 0.5 ? new Date().toISOString() : undefined,
      assignedTo: Math.random() > 0.6 ? "张经理" : undefined,
    })),
  )

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map((lead) => lead.id))
    }
  }

  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id))
    } else {
      setSelectedLeads([...selectedLeads, id])
    }
  }

  const toggleFavorite = (id: string) => {
    setLeads(
      leads.map((lead) => {
        if (lead.id === id) {
          return { ...lead, favorite: !lead.favorite }
        }
        return lead
      }),
    )
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-green-100 text-green-800"
      case "converted":
        return "bg-purple-100 text-purple-800"
      case "lost":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "new":
        return "新线索"
      case "contacted":
        return "已联系"
      case "qualified":
        return "已确认"
      case "converted":
        return "已转化"
      case "lost":
        return "已流失"
      default:
        return "未分类"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-orange-600"
  }

  return (
    <MainLayout>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">线索管理</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加线索
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">全部线索</TabsTrigger>
                <TabsTrigger value="new">新线索</TabsTrigger>
                <TabsTrigger value="contacted">已联系</TabsTrigger>
                <TabsTrigger value="qualified">已确认</TabsTrigger>
                <TabsTrigger value="converted">已转化</TabsTrigger>
                <TabsTrigger value="favorites">收藏</TabsTrigger>
              </TabsList>
              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                <Input
                  placeholder="搜索线索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>筛选条件</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem>评分 80 分以上</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>极高购买意向</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>高联系潜力</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>有明确预算</DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Check className="mr-2 h-4 w-4" />
                      应用筛选
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>全部线索</CardTitle>
                      <CardDescription>管理和跟踪所有潜在客户</CardDescription>
                    </div>
                    {selectedLeads.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">已选择 {selectedLeads.length} 项</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              批量操作
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <UserPlus className="mr-2 h-4 w-4" />
                              分配给...
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="mr-2 h-4 w-4" />
                              标记为收藏
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              导出选中项
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除选中项
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedLeads.length === leads.length && leads.length > 0}
                              onCheckedChange={toggleSelectAll}
                              aria-label="Select all"
                            />
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>用户信息</TableHead>
                          <TableHead>评分</TableHead>
                          <TableHead>意向等级</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>来源</TableHead>
                          <TableHead>最后联系</TableHead>
                          <TableHead>负责人</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                              没有找到匹配的线索
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLeads.map((lead) => (
                            <TableRow key={lead.id} className="group">
                              <TableCell>
                                <Checkbox
                                  checked={selectedLeads.includes(lead.id)}
                                  onCheckedChange={() => toggleSelectLead(lead.id)}
                                  aria-label={`Select ${lead.user_name}`}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleFavorite(lead.id)}
                                >
                                  {lead.favorite ? (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <StarOff className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={lead.user_avatar || "/placeholder.svg"} alt={lead.user_name} />
                                    <AvatarFallback>{lead.user_name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{lead.user_name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {lead.content}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`font-medium ${getScoreColor(lead.leadScore)}`}>{lead.leadScore}分</div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    lead.intentLevel === "极高"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : lead.intentLevel === "高"
                                        ? "bg-orange-50 text-orange-700 border-orange-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  }
                                >
                                  {lead.intentLevel}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(lead.status)}>{getStatusText(lead.status)}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">{lead.note_title.slice(0, 15)}...</span>
                                  <span className="text-xs text-muted-foreground">
                                    {lead.note_type === "video" ? "视频" : "图文"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {lead.lastContact ? (
                                  <span className="text-xs">{new Date(lead.lastContact).toLocaleDateString()}</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">未联系</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {lead.assignedTo ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">{lead.assignedTo[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">{lead.assignedTo}</span>
                                  </div>
                                ) : (
                                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                                    <UserPlus className="mr-1 h-3 w-3" />
                                    分配
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>查看详情</DropdownMenuItem>
                                    <DropdownMenuItem>编辑信息</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>更改状态</DropdownMenuLabel>
                                    <DropdownMenuItem>标记为已联系</DropdownMenuItem>
                                    <DropdownMenuItem>标记为已确认</DropdownMenuItem>
                                    <DropdownMenuItem>标记为已转化</DropdownMenuItem>
                                    <DropdownMenuItem>标记为已流失</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">删除线索</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </MainLayout>
  )
}
