import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { xiaohongshuScraper } from "@/lib/xhsscraper"

// Schema for the LLM response
const LeadAnalysisSchema = z.object({
  leads: z.array(
    z.object({
      username: z.string(),
      nickname: z.string(),
      comment: z.string(),
      postTitle: z.string(),
      postUrl: z.string(),
      aiAnalysis: z.string(),
      leadScore: z.number().min(0).max(100),
      tags: z.array(z.string()),
      engagement: z.enum(["新用户", "活跃用户", "中等活跃", "高活跃"]),
      intentLevel: z.enum(["低", "中", "高", "极高"]),
      contactPotential: z.enum(["低", "中", "高"]),
      followersCount: z.number().optional(),
    }),
  ),
  summary: z.object({
    totalAnalyzed: z.number(),
    highQualityLeads: z.number(),
    averageScore: z.number(),
    topKeywords: z.array(z.string()),
    scrapingStatus: z.string(),
  }),
})

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json()

    if (!keyword) {
      return Response.json({ error: "Keyword is required" }, { status: 400 })
    }

    console.log(`Starting web scraping for keyword: ${keyword}`)

    // Scrape Xiaohongshu data
    const scrapingResult = await xiaohongshuScraper.scrapeSearch(keyword)

    console.log(`Scraping completed: ${scrapingResult.posts.length} posts, ${scrapingResult.comments.length} comments`)

    if (!scrapingResult.comments || scrapingResult.comments.length === 0) {
      return Response.json({
        leads: [],
        summary: {
          totalAnalyzed: 0,
          highQualityLeads: 0,
          averageScore: 0,
          topKeywords: [],
          scrapingStatus: "未找到相关评论数据",
        },
      })
    }

    // Prepare data for LLM analysis
    const commentsData = scrapingResult.comments.map((comment, index) => {
      const post = scrapingResult.posts.find((p) => p.id === comment.postId)
      return {
        index: index + 1,
        username: comment.author.username,
        nickname: comment.author.nickname,
        comment: comment.content,
        postTitle: post?.title || "未知帖子",
        postUrl: post?.url || "",
        likes: comment.likes,
        replies: comment.replies,
        createdAt: comment.createdAt,
        authorFollowers: post?.author.followers || 0,
      }
    })

    console.log(`Sending ${commentsData.length} comments to AI for analysis`)

    // Use LLM to analyze scraped comments
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: LeadAnalysisSchema,
      prompt: `
        你是一个专业的销售线索分析师，专门分析从小红书网页抓取的评论数据来发现潜在的保险客户。

        关键词: "${keyword}"
        数据来源: 小红书网页抓取
        
        以下是通过网页抓取获取的真实小红书评论数据：
        ${commentsData
          .map(
            (c) => `
        ${c.index}. 用户: ${c.username} (昵称: ${c.nickname})
           评论: "${c.comment}"
           帖子标题: "${c.postTitle}"
           帖子链接: ${c.postUrl}
           点赞数: ${c.likes}
           回复数: ${c.replies}
           发布时间: ${c.createdAt}
           作者粉丝数: ${c.authorFollowers}
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

        6. 提供整体分析摘要，包括：
           - 总分析评论数
           - 高质量线索数量 (评分80分以上)
           - 平均评分
           - 热门关键词
           - 抓取状态说明

        筛选标准：
        - 只返回评分60分以上的潜在客户
        - 过滤掉明显的广告、推广或无关内容
        - 排除已经购买或明确表示不感兴趣的用户
        - 优先识别有明确需求和预算的用户

        分析要专业、准确，帮助保险销售人员识别从网页抓取数据中发现的高质量线索。
      `,
    })

    // Add scraping status to summary
    const finalResult = {
      ...result.object,
      summary: {
        ...result.object.summary,
        scrapingStatus: `成功抓取 ${scrapingResult.posts.length} 个帖子，${scrapingResult.comments.length} 条评论`,
      },
    }

    console.log(`AI analysis completed: ${finalResult.leads.length} leads identified`)

    return Response.json(finalResult)
  } catch (error) {
    console.error("Error in lead analysis:", error)
    return Response.json(
      {
        error: "Failed to analyze leads",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
