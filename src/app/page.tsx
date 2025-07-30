"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  MessageCircle,
  TrendingUp,
  User,
  AlertCircle,
  ExternalLink,
  BarChart3,
  CheckCircle,
  UserPlus,
  Heart,
  TestTube,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { xiaohongshuAPI } from "@/lib/xiaohongshu-api"
import { MainLayout } from "@/components/layout/main-layout"
import { PageContainer } from "@/components/layout/page-container"

interface Lead {
  // User info from backend
  user_id: string
  user_name: string
  user_avatar?: string

  // Comment data from backend
  id: string
  content: string
  liked_count: number
  created_time: string

  // Note info from backend
  note_id: string
  note_title: string
  note_url: string
  note_type: "normal" | "video"
  note_cover?: string
  note_liked_count?: number

  // AI analysis results
  aiAnalysis: string
  leadScore: number
  tags: string[]
  engagement: string
  intentLevel: string
  contactPotential: string
}

interface AnalysisSummary {
  totalAnalyzed: number
  highQualityLeads: number
  averageScore: number
  topKeywords: string[]
  scrapingStatus: string
  notesAnalyzed: number
}

const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !process.env.NEXT_PUBLIC_XIAOHONGSHU_BACKEND_URL

export default function LeadCrushApp() {
  const [searchQuery, setSearchQuery] = useState("宝宝保险")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Lead[]>([])
  const [summary, setSummary] = useState<AnalysisSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch("/api/analyze-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: searchQuery,
          count: 20, // 搜索20个笔记
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to analyze leads")
      }

      const data = await response.json()
      setResults(data.leads || [])
      setSummary(data.summary || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败，请稍后重试")
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFollowUser = async (userId: string, username: string) => {
    try {
      await xiaohongshuAPI.followUser(userId, true)
      alert(`已关注用户 ${username}`)
    } catch (error) {
      alert(`关注失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const handleLikeNote = async (noteId: string) => {
    try {
      await xiaohongshuAPI.likeNote(noteId, true)
      alert("已点赞该笔记")
    } catch (error) {
      alert(`点赞失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const handleCollectNote = async (noteId: string) => {
    try {
      await xiaohongshuAPI.collectNote(noteId, true)
      alert("已收藏该笔记")
    } catch (error) {
      alert(`收藏失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-orange-100 text-orange-800"
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "极高":
        return "bg-red-100 text-red-800"
      case "高":
        return "bg-orange-100 text-orange-800"
      case "中":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getContactColor = (potential: string) => {
    switch (potential) {
      case "高":
        return "bg-green-100 text-green-800"
      case "中":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handlePostComment = async (noteId: string) => {
    const comment = prompt("请输入评论内容:")
    if (!comment) return

    try {
      await xiaohongshuAPI.postComment(noteId, comment)
      alert("评论发表成功")
    } catch (error) {
      alert(`评论失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  return (
    <MainLayout>
      <PageContainer>
        <div className="space-y-6">
          {/* Status Notice */}
          <Alert className={`${USE_MOCK_DATA ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}`}>
            {USE_MOCK_DATA ? (
              <TestTube className="h-4 w-4 text-blue-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={USE_MOCK_DATA ? "text-blue-800" : "text-green-800"}>
              {USE_MOCK_DATA ? (
                <>
                  <strong>演示模式</strong> - 当前使用模拟数据进行展示。
                  系统将展示真实的分析流程和结果格式，帮助您了解产品功能。
                </>
              ) : (
                <>
                  <strong>已接入真实小红书API！</strong>现在可以获取真实的用户评论数据进行分析。
                  系统将搜索相关笔记，提取真实用户评论，并通过AI识别潜在客户。
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                小红书{USE_MOCK_DATA ? "模拟" : "真实"}数据分析
              </CardTitle>
              <p className="text-sm text-gray-600">
                输入关键词，系统将搜索小红书相关笔记，分析{USE_MOCK_DATA ? "模拟" : "真实"}用户评论，AI智能识别潜在客户
              </p>
              <div
                className={`text-xs p-2 rounded ${USE_MOCK_DATA ? "text-blue-600 bg-blue-50" : "text-green-600 bg-green-50"}`}
              >
                {USE_MOCK_DATA ? (
                  <>🧪 演示模式：使用高质量模拟数据展示分析能力</>
                ) : (
                  <>✅ 使用小红书官方API，获取真实用户数据和评论</>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="输入关键词，如：宝宝保险、理财规划、医疗险..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  disabled={isSearching}
                />
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="px-6">
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      分析中...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
              </div>

              {isSearching && (
                <div className="mt-4 space-y-3">
                  <div className={`p-4 rounded-lg ${USE_MOCK_DATA ? "bg-blue-50" : "bg-blue-50"}`}>
                    <p className="text-sm text-blue-700 font-medium">
                      🔍 正在搜索小红书{USE_MOCK_DATA ? "模拟" : "真实"}数据...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      搜索相关笔记内容
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      获取{USE_MOCK_DATA ? "模拟" : "真实"}用户评论
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      AI 分析购买意向
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      生成线索评分
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Summary Section */}
          {summary && !isSearching && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">分析笔记数</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{summary.notesAnalyzed}</div>
                  <p className="text-xs text-muted-foreground">{USE_MOCK_DATA ? "模拟" : "真实"}小红书笔记</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">分析评论数</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalAnalyzed}</div>
                  <p className="text-xs text-muted-foreground">{USE_MOCK_DATA ? "模拟" : "真实"}用户评论</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">高质量线索</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{summary.highQualityLeads}</div>
                  <p className="text-xs text-muted-foreground">评分80分以上</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均评分</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.averageScore}</div>
                  <p className="text-xs text-muted-foreground">AI智能评分</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          {hasSearched && !isSearching && (
            <>
              {results.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">发现的潜在客户</h2>
                      <p className="text-gray-600">基于小红书{USE_MOCK_DATA ? "模拟" : "真实"}用户评论的AI分析结果</p>
                    </div>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {results.length} 个优质线索
                    </Badge>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {results.map((result, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-medium overflow-hidden">
                                {result.user_avatar ? (
                                  <img
                                    src={result.user_avatar || "/placeholder.svg"}
                                    alt={result.user_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{result.user_name}</h3>
                                <p className="text-sm text-gray-500">ID: {result.user_id}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {result.engagement}
                                  </Badge>
                                  <Badge className={`text-xs ${getIntentColor(result.intentLevel)}`}>
                                    {result.intentLevel}意向
                                  </Badge>
                                  <Badge className={`text-xs ${getContactColor(result.contactPotential)}`}>
                                    {result.contactPotential}联系度
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getScoreColor(result.leadScore)} font-medium`}>
                              {result.leadScore}分
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Original Comment */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {USE_MOCK_DATA ? "模拟" : "真实"}用户评论
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${USE_MOCK_DATA ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}
                              >
                                {USE_MOCK_DATA ? "演示数据" : "小红书API"}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                                <Heart className="h-3 w-3" />
                                {result.liked_count}
                              </div>
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed">"{result.content}"</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">来自笔记：{result.note_title}</p>
                                <Badge variant="outline" className="text-xs">
                                  {result.note_type === "video" ? "视频" : "图文"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {new Date(result.created_time).toLocaleDateString()}
                                </span>
                                {result.note_url && (
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                                    <a href={result.note_url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      查看原帖
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* AI Analysis */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">AI 深度分析</span>
                            </div>
                            <p className="text-blue-800 text-sm leading-relaxed">{result.aiAnalysis}</p>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {result.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFollowUser(result.user_id, result.user_name)}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              关注用户
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleLikeNote(result.note_id)}>
                              <Heart className="h-3 w-3 mr-1" />
                              点赞笔记
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleCollectNote(result.note_id)}>
                              收藏笔记
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePostComment(result.note_id)}>
                              <MessageCircle className="h-3 w-3 mr-1" />
                              评论
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">未发现潜在客户</h3>
                    <p className="text-gray-600">AI分析完成，但未找到明确的购买意向信号。</p>
                    <p className="text-sm text-gray-500 mt-2">尝试使用其他关键词或更具体的搜索词</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </MainLayout>
  )
}
