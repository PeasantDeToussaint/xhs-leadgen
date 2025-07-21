"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Zap, MessageCircle, TrendingUp, User, AlertCircle, ExternalLink, BarChart3, Globe } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Lead {
  username: string
  nickname: string
  comment: string
  postTitle: string
  postUrl: string
  aiAnalysis: string
  leadScore: number
  tags: string[]
  engagement: string
  intentLevel: string
  contactPotential: string
  followersCount?: number
}

interface AnalysisSummary {
  totalAnalyzed: number
  highQualityLeads: number
  averageScore: number
  topKeywords: string[]
  scrapingStatus: string
}

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
        body: JSON.stringify({ keyword: searchQuery }),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LeadCrush</h1>
                <p className="text-sm text-gray-500">小红书网页抓取 + AI驱动的潜客发现工具</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                🕷️ 网页抓取
              </Badge>
              <Badge variant="outline" className="text-xs">
                🤖 GPT-4 分析
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              小红书网页数据抓取分析
            </CardTitle>
            <p className="text-sm text-gray-600">通过网页抓取技术获取小红书帖子和评论数据，AI智能识别潜在客户</p>
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ 请合理使用抓取功能，遵守网站使用条款和相关法律法规
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
                    抓取中...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    开始抓取
                  </>
                )}
              </Button>
            </div>

            {isSearching && (
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">🕷️ 正在抓取小红书网页数据...</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    正在访问小红书搜索页面
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    解析HTML结构，提取帖子和评论数据
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    AI 正在分析抓取的评论内容
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    生成潜客评分和联系建议
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
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">抓取状态</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-green-600">{summary.scrapingStatus}</div>
                <p className="text-xs text-muted-foreground">网页抓取结果</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">分析评论数</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalAnalyzed}</div>
                <p className="text-xs text-muted-foreground">从网页抓取</p>
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">发现的潜在客户</h2>
                    <p className="text-gray-600">基于小红书网页抓取数据的AI分析结果</p>
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
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-medium">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{result.nickname}</h3>
                              <p className="text-sm text-gray-500">@{result.username}</p>
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
                            <span className="text-sm font-medium text-gray-700">抓取的评论</span>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed">"{result.comment}"</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">来自帖子：{result.postTitle}</p>
                            {result.postUrl && (
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                                <a href={result.postUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  查看原帖
                                </a>
                              </Button>
                            )}
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
                          <Button className="flex-1 bg-transparent" variant="outline">
                            添加到客户池
                          </Button>
                          <Button variant="outline" size="sm">
                            查看资料
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
                  <p className="text-gray-600">网页抓取和AI分析完成，但未找到明确的购买意向信号。</p>
                  <p className="text-sm text-gray-500 mt-2">尝试使用其他关键词或更具体的搜索词</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
