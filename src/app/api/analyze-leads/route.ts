import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { mockApiResponses } from "@/lib/mock-data"

const BACKEND_BASE_URL = process.env.XIAOHONGSHU_BACKEND_URL || "http://localhost:8000"
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true" || !process.env.XIAOHONGSHU_BACKEND_URL

// Schema for the LLM response
const LeadAnalysisSchema = z.object({
  leads: z.array(
    z.object({
      // Backend user data
      user_id: z.string(),
      user_name: z.string(),
      user_avatar: z.string().optional(),

      // Backend comment data
      id: z.string(),
      content: z.string(),
      liked_count: z.number(),
      created_time: z.string(),

      // Backend note data
      note_id: z.string(),
      note_title: z.string(),
      note_url: z.string(),
      note_type: z.enum(["normal", "video"]),
      note_cover: z.string().optional(),
      note_liked_count: z.number().optional(),

      // AI analysis
      aiAnalysis: z.string(),
      leadScore: z.number().min(0).max(100),
      tags: z.array(z.string()),
      engagement: z.enum(["新用户", "活跃用户", "中等活跃", "高活跃"]),
      intentLevel: z.enum(["低", "中", "高", "极高"]),
      contactPotential: z.enum(["低", "中", "高"]),
    }),
  ),
  summary: z.object({
    totalAnalyzed: z.number(),
    highQualityLeads: z.number(),
    averageScore: z.number(),
    topKeywords: z.array(z.string()),
    scrapingStatus: z.string(),
    notesAnalyzed: z.number(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, count = 20 } = body

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 })
    }

    console.log(`Starting analysis for keyword: ${keyword}`)

    // Use mock data if backend is not available or USE_MOCK_DATA is true
    if (USE_MOCK_DATA) {
      console.log("Using mock data for demonstration")

      try {
        const mockResult = await mockApiResponses.analyzeLeads(keyword)

        return NextResponse.json({
          leads: mockResult.leads,
          summary: {
            ...mockResult.summary,
            scrapingStatus: `演示模式：分析了 ${mockResult.summary.notesAnalyzed} 个模拟笔记，${mockResult.summary.totalAnalyzed} 条模拟评论`,
          },
        })
      } catch (mockError) {
        console.error("Mock data error:", mockError)
        return NextResponse.json(
          {
            error: "演示数据加载失败",
            details: mockError instanceof Error ? mockError.message : "未知错误",
          },
          { status: 500 },
        )
      }
    }

    // Real API logic (existing code)
    const allComments: any[] = []
    let notesAnalyzed = 0

    try {
      // 1. Search for notes using backend API
      console.log("Searching for notes...")
      const notesResponse = await fetch(`${BACKEND_BASE_URL}/api/search-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword,
          count,
          sort: "popularity_descending",
          noteType: 0,
          download: false,
        }),
      })

      if (!notesResponse.ok) {
        throw new Error(`Search notes failed: ${notesResponse.statusText}`)
      }

      const notes = await notesResponse.json()
      console.log(`Found ${notes.length} notes`)
      notesAnalyzed = notes.length

      if (notes.length === 0) {
        return NextResponse.json({
          leads: [],
          summary: {
            totalAnalyzed: 0,
            highQualityLeads: 0,
            averageScore: 0,
            topKeywords: [keyword],
            scrapingStatus: "未找到相关笔记",
            notesAnalyzed: 0,
          },
        })
      }

      // 2. Get comments for top notes
      const topNotes = notes.slice(0, 5) // Limit to top 5 notes

      for (const note of topNotes) {
        try {
          console.log(`Getting comments for note: ${note.note_id}`)

          const commentsResponse = await fetch(`${BACKEND_BASE_URL}/api/get-note-comments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              note_id: note.note_id,
              xsec_token: note.xsec_token,
              count: 20,
              download: false,
            }),
          })

          if (!commentsResponse.ok) {
            console.error(`Failed to get comments for note ${note.note_id}`)
            continue
          }

          const comments = await commentsResponse.json()

          // Add note info to comments
          const commentsWithNoteInfo = comments.map((comment: any) => ({
            ...comment,
            note_title: note.title,
            note_url: `https://www.xiaohongshu.com/explore/${note.note_id}`,
            note_id: note.note_id,
          }))

          allComments.push(...commentsWithNoteInfo)

          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to get comments for note ${note.note_id}:`, error)
          continue
        }
      }

      console.log(`Collected ${allComments.length} comments from ${topNotes.length} notes`)

      if (allComments.length === 0) {
        return NextResponse.json({
          leads: [],
          summary: {
            totalAnalyzed: 0,
            highQualityLeads: 0,
            averageScore: 0,
            topKeywords: [keyword],
            scrapingStatus: "笔记无评论数据",
            notesAnalyzed,
          },
        })
      }

      // 3. Prepare data for AI analysis using actual backend field names
      const commentsData = allComments.map((comment, index) => ({
        index: index + 1,
        // Backend comment fields
        id: comment.id,
        user_id: comment.user_id,
        user_name: comment.user_name,
        user_avatar: comment.user_avatar,
        content: comment.content,
        liked_count: comment.liked_count || 0,
        created_time: comment.created_time,

        // Backend note fields
        note_id: comment.note_id,
        note_title: comment.note_title,
        note_url: comment.note_url,
        note_type: comment.note_type || "normal",
        note_cover: comment.note_cover,
        note_liked_count: comment.note_liked_count || 0,
      }))

      console.log(`Sending ${commentsData.length} comments to AI for analysis`)

      // 4. AI analysis
      const result = await generateObject({
        model: openai("gpt-4o"),
        schema: LeadAnalysisSchema,
        prompt: `
          你是一个专业的销售线索分析师，专门分析小红书真实评论数据来发现潜在的保险客户。

          关键词: "${keyword}"
          数据来源: 小红书官方API
          
          以下是从小红书API获取的真实用户评论数据：
          ${commentsData
            .map(
              (c) => `
${c.index}. 用户: ${c.user_name} (ID: ${c.user_id})
   评论ID: ${c.id}
   评论内容: "${c.content}"
   评论点赞数: ${c.liked_count}
   发布时间: ${c.created_time}
   
   笔记标题: "${c.note_title}"
   笔记类型: ${c.note_type === "video" ? "视频" : "图文"}
   笔记链接: ${c.note_url}
   笔记点赞数: ${c.note_liked_count}
   笔记ID: ${c.note_id}
`,
            )
            .join("\n")}

          请分析每条评论，识别出有购买意向的潜在客户。重点关注：

          1. 详细的AI分析，说明为什么这个用户是潜在客户：
             - 需求明确程度和紧迫性
             - 购买时机和决策阶段
             - 预算能力和支付意愿
             - 信息获取和比较行为
             - 社交影响力和传播潜力

          2. 基于以下标准的线索评分(0-100分)：
             - 明确表达需求或兴趣 (25分)
             - 主动寻求建议或推荐 (20分)
             - 有具体的使用场景或预算 (20分)
             - 显示购买能力或紧迫性 (15分)
             - 用户活跃度和社交影响力 (10分)
             - 评论质量和互动程度 (10分)

          3. 相关标签，帮助销售人员快速了解客户特征
          4. 购买意向等级评估 (低/中/高/极高)
          5. 联系潜力评估 (基于用户开放程度和活跃度)

          筛选标准：
          - 只返回评分60分以上的潜在客户
          - 过滤掉明显的广告、推广或无关内容
          - 排除已经购买或明确表示不感兴趣的用户
          - 优先识别有明确需求和预算的用户

          分析要专业、准确，帮助保险销售人员识别高质量线索。
        `,
      })

      // 5. Preserve backend field structure in results
      const enhancedLeads = result.object.leads.map((lead) => {
        const originalComment = commentsData.find((c) => c.content === lead.content)
        return {
          ...lead,
          // Ensure all backend fields are preserved
          id: originalComment?.id || "",
          user_id: originalComment?.user_id || "",
          user_name: originalComment?.user_name || "",
          user_avatar: originalComment?.user_avatar,
          liked_count: originalComment?.liked_count || 0,
          created_time: originalComment?.created_time || "",
          note_id: originalComment?.note_id || "",
          note_title: originalComment?.note_title || "",
          note_url: originalComment?.note_url || "",
          note_type: originalComment?.note_type || "normal",
          note_cover: originalComment?.note_cover,
          note_liked_count: originalComment?.note_liked_count || 0,
        }
      })

      const finalResult = {
        leads: enhancedLeads,
        summary: {
          ...result.object.summary,
          scrapingStatus: `成功分析 ${notesAnalyzed} 个笔记，${allComments.length} 条真实评论`,
          notesAnalyzed,
        },
      }

      console.log(`AI analysis completed: ${finalResult.leads.length} leads identified`)

      return NextResponse.json(finalResult)
    } catch (apiError) {
      console.error("Xiaohongshu API error:", apiError)

      // Fallback to mock data if API fails
      console.log("API failed, falling back to mock data")
      const mockResult = await mockApiResponses.analyzeLeads(keyword)

      return NextResponse.json({
        leads: mockResult.leads,
        summary: {
          ...mockResult.summary,
          scrapingStatus: `API暂时不可用，使用演示数据：${mockResult.summary.notesAnalyzed} 个模拟笔记，${mockResult.summary.totalAnalyzed} 条模拟评论`,
        },
      })
    }
  } catch (error) {
    console.error("Error in lead analysis:", error)

    // Final fallback to mock data
    try {
      const body = await request.json()
      const { keyword } = body
      const mockResult = await mockApiResponses.analyzeLeads(keyword)

      return NextResponse.json({
        leads: mockResult.leads,
        summary: {
          ...mockResult.summary,
          scrapingStatus: `系统错误，使用演示数据：${mockResult.summary.notesAnalyzed} 个模拟笔记，${mockResult.summary.totalAnalyzed} 条模拟评论`,
        },
      })
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "系统暂时不可用",
          details: error instanceof Error ? error.message : "未知错误",
        },
        { status: 500 },
      )
    }
  }
}
