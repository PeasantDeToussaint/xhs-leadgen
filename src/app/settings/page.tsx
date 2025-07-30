"use client"

import { useState } from "react"
import { Check, Copy, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MainLayout } from "@/components/layout/main-layout"
import { PageContainer } from "@/components/layout/page-container"

export default function SettingsPage() {
  const [copied, setCopied] = useState(false)
  const [apiKey, setApiKey] = useState("sk_test_•••••••••••••••••••••••••••••")

  const copyApiKey = () => {
    navigator.clipboard.writeText("sk_test_your_actual_api_key_here")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <MainLayout>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">系统设置</h1>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              保存设置
            </Button>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">基本设置</TabsTrigger>
              <TabsTrigger value="api">API 配置</TabsTrigger>
              <TabsTrigger value="notifications">通知设置</TabsTrigger>
              <TabsTrigger value="team">团队管理</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>设置您的账户基本信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">公司名称</Label>
                      <Input id="company-name" defaultValue="LeadCrush 科技有限公司" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">管理员邮箱</Label>
                      <Input id="admin-email" type="email" defaultValue="admin@leadcrush.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-description">公司简介</Label>
                    <Textarea
                      id="company-description"
                      defaultValue="LeadCrush 是一家专注于小红书营销和线索挖掘的科技公司，帮助企业发现和管理高质量潜在客户。"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>系统偏好</CardTitle>
                  <CardDescription>自定义系统行为和显示方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">自动刷新数据</h4>
                        <p className="text-sm text-muted-foreground">定期自动刷新仪表盘数据</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">新线索通知</h4>
                        <p className="text-sm text-muted-foreground">发现新的高质量线索时通知</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">数据导出格式</h4>
                        <p className="text-sm text-muted-foreground">选择默认的数据导出格式</p>
                      </div>
                      <Select defaultValue="excel">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="选择格式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>线索评分设置</CardTitle>
                  <CardDescription>自定义线索评分标准和阈值</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>高质量线索阈值</Label>
                    <RadioGroup defaultValue="80" className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="70" id="threshold-70" />
                        <Label htmlFor="threshold-70">70分</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="80" id="threshold-80" />
                        <Label htmlFor="threshold-80">80分</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="90" id="threshold-90" />
                        <Label htmlFor="threshold-90">90分</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>评分因素权重</Label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="weight-intent" className="text-sm">
                          购买意向 (当前: 25%)
                        </Label>
                        <Input id="weight-intent" type="range" min="10" max="40" defaultValue="25" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight-budget" className="text-sm">
                          预算明确度 (当前: 20%)
                        </Label>
                        <Input id="weight-budget" type="range" min="10" max="40" defaultValue="20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight-urgency" className="text-sm">
                          紧迫程度 (当前: 15%)
                        </Label>
                        <Input id="weight-urgency" type="range" min="10" max="30" defaultValue="15" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight-engagement" className="text-sm">
                          互动程度 (当前: 10%)
                        </Label>
                        <Input id="weight-engagement" type="range" min="5" max="20" defaultValue="10" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">恢复默认值</Button>
                  <Button>保存评分设置</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API 密钥</CardTitle>
                  <CardDescription>管理您的 API 访问密钥</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API 密钥</Label>
                    <div className="flex">
                      <Input
                        id="api-key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="rounded-r-none"
                        readOnly
                      />
                      <Button
                        variant="outline"
                        className="rounded-l-none border-l-0 bg-transparent"
                        onClick={copyApiKey}
                        disabled={copied}
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            复制
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">请妥善保管您的 API 密钥，不要分享给他人。</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">API 访问限制</h4>
                        <p className="text-sm text-muted-foreground">限制 API 的访问来源</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="pt-2">
                      <Label htmlFor="allowed-domains">允许的域名</Label>
                      <Textarea
                        id="allowed-domains"
                        placeholder="每行输入一个域名，例如: example.com"
                        className="mt-1"
                        defaultValue="leadcrush.com
app.leadcrush.com"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">重置 API 密钥</Button>
                  <Button>保存 API 设置</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>小红书 API 配置</CardTitle>
                  <CardDescription>配置小红书 API 连接参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="xiaohongshu-api-url">API 地址</Label>
                      <Input
                        id="xiaohongshu-api-url"
                        defaultValue="https://api.xiaohongshu.com/v1"
                        placeholder="https://api.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xiaohongshu-api-key">API 密钥</Label>
                      <Input
                        id="xiaohongshu-api-key"
                        type="password"
                        defaultValue="••••••••••••••••"
                        placeholder="输入 API 密钥"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="xiaohongshu-api-secret">API Secret</Label>
                    <Input
                      id="xiaohongshu-api-secret"
                      type="password"
                      defaultValue="••••••••••••••••••••••••••••••••"
                      placeholder="输入 API Secret"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">API 代理</h4>
                        <p className="text-sm text-muted-foreground">使用代理服务器访问 API</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">测试连接</Button>
                  <Button>保存 API 配置</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </MainLayout>
  )
}
