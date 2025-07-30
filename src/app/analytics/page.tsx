"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Calendar, Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { PageContainer } from "@/components/layout/page-container"

// Mock data for charts
const leadsByDay = [
  { date: "周一", count: 12, highQuality: 5 },
  { date: "周二", count: 18, highQuality: 8 },
  { date: "周三", count: 15, highQuality: 6 },
  { date: "周四", count: 22, highQuality: 10 },
  { date: "周五", count: 28, highQuality: 14 },
  { date: "周六", count: 20, highQuality: 9 },
  { date: "周日", count: 16, highQuality: 7 },
]

const conversionData = [
  { name: "已转化", value: 35, color: "#4ade80" },
  { name: "进行中", value: 45, color: "#60a5fa" },
  { name: "已流失", value: 20, color: "#f87171" },
]

const leadSourceData = [
  { name: "宝宝保险", value: 35 },
  { name: "医疗险", value: 25 },
  { name: "重疾险", value: 20 },
  { name: "理财规划", value: 15 },
  { name: "其他", value: 5 },
]

const scoreDistribution = [
  { score: "90-100", count: 15 },
  { score: "80-89", count: 25 },
  { score: "70-79", count: 18 },
  { score: "60-69", count: 12 },
  { score: "<60", count: 8 },
]

const intentLevelData = [
  { level: "极高", count: 18 },
  { level: "高", count: 32 },
  { level: "中", count: 24 },
  { level: "低", count: 14 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <MainLayout>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">数据分析</h1>
            <div className="mt-4 flex items-center gap-2 sm:mt-0">
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">最近7天</SelectItem>
                  <SelectItem value="30d">最近30天</SelectItem>
                  <SelectItem value="90d">最近90天</SelectItem>
                  <SelectItem value="1y">最近一年</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">总览</TabsTrigger>
              <TabsTrigger value="leads">线索分析</TabsTrigger>
              <TabsTrigger value="conversion">转化分析</TabsTrigger>
              <TabsTrigger value="sources">来源分析</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">总线索数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">132</div>
                    <p className="text-xs text-muted-foreground">
                      较上期 <span className="text-green-600">+12%</span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">高质量线索</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">59</div>
                    <p className="text-xs text-muted-foreground">
                      较上期 <span className="text-green-600">+18%</span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">转化率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">35%</div>
                    <p className="text-xs text-muted-foreground">
                      较上期 <span className="text-green-600">+5%</span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">平均评分</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">82.5</div>
                    <p className="text-xs text-muted-foreground">
                      较上期 <span className="text-green-600">+2.3</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>线索趋势</CardTitle>
                    <CardDescription>每日新增线索数量</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ChartContainer
                      config={{
                        count: {
                          label: "总线索",
                          color: "hsl(var(--chart-1))",
                        },
                        highQuality: {
                          label: "高质量线索",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="aspect-[4/3]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={leadsByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="var(--color-count)"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="highQuality"
                            stroke="var(--color-highQuality)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>转化状态</CardTitle>
                    <CardDescription>线索转化情况分布</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="aspect-[4/3] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={conversionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {conversionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>线索来源</CardTitle>
                    <CardDescription>按关键词分类</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="aspect-[4/3] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leadSourceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#60a5fa" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>评分分布</CardTitle>
                    <CardDescription>线索质量评分分布</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="aspect-[4/3] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="score" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4ade80" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </MainLayout>
  )
}
