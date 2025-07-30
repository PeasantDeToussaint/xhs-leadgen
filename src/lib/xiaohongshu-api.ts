// Complete API client with all provided endpoints
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_XIAOHONGSHU_BACKEND_URL || "http://localhost:8000"

export interface XiaohongshuNote {
  note_id: string
  xsec_token: string
  type: "normal" | "video"
  title: string
  liked_count: number
  cover: string
  user_id: string
  user_name: string
  user_xsec_token: string
}

export interface XiaohongshuComment {
  id: string
  note_id: string
  content: string
  user_id: string
  user_name: string
  user_avatar: string
  liked_count: number
  created_time: string
  replies?: XiaohongshuComment[]
}

export interface XiaohongshuUser {
  user_id: string
  user_name: string
  nickname: string
  avatar: string
  followers_count: number
  following_count: number
  notes_count: number
  xsec_token: string
}

class XiaohongshuAPI {
  // CollectNote - 收藏/取消收藏笔记
  async collectNote(note_id: string, collect = true): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/collect-note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note_id,
        collect,
      }),
    })

    if (!response.ok) {
      throw new Error(`收藏操作失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // FollowUser - 关注/取消关注用户
  async followUser(target_user_id: string, follow = true): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/follow-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_user_id,
        follow,
      }),
    })

    if (!response.ok) {
      throw new Error(`关注操作失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetCollectNotes - 获取用户收藏的笔记列表
  async getCollectNotes(user_id: string, count = 5, xsec_token = "", download = false): Promise<XiaohongshuNote[]> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-collect-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        count,
        xsec_token,
        download,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取收藏笔记失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetFeedData - 获取指定笔记的详细数据
  async getFeedData(note_id: string, xsec_token: string): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-feed-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note_id,
        xsec_token,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取笔记数据失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetFileContents - 获取本地文件内容
  async getFileContents(filePath: string): Promise<string> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-file-contents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filePath,
      }),
    })

    if (!response.ok) {
      throw new Error(`读取文件失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetHomeFeeds - 获取首页帖子列表
  async getHomeFeeds(count = 10, category = "homefeed_recommend", download = false): Promise<XiaohongshuNote[]> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-home-feeds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count,
        category,
        download,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取首页数据失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetUserLikedNotes - 获取用户点赞的笔记列表
  async getUserLikedNotes(user_id: string, count = 5, xsec_token = "", download = false): Promise<XiaohongshuNote[]> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-user-liked-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        count,
        xsec_token,
        download,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取用户点赞笔记失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetNoteComments - 获取笔记评论列表
  async getNoteComments(
    note_id: string,
    xsec_token: string,
    count = 10,
    download = false,
  ): Promise<XiaohongshuComment[]> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-note-comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note_id,
        xsec_token,
        count,
        download,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取评论失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetCurrentUserInfo - 获取当前账号详细数据
  async getCurrentUserInfo(): Promise<XiaohongshuUser> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-current-user-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`获取用户信息失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetUserNotifyConnections - 获取用户消息通知(关注分类)
  async getUserNotifyConnections(count = 20, cursor = ""): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-user-notify-connections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count,
        cursor,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取关注通知失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetUserNotifyLikes - 获取用户消息通知(赞和收藏分类)
  async getUserNotifyLikes(count = 20, cursor = ""): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-user-notify-likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count,
        cursor,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取点赞通知失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetUserNotifyMentions - 获取用户消息通知(评论和@分类)
  async getUserNotifyMentions(count = 20, cursor = ""): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-user-notify-mentions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count,
        cursor,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取提及通知失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // GetUserPosts - 获取指定用户的已发布笔记列表
  async getUserPosts(user_id: string, count = 5, xsec_token: string, download = false): Promise<XiaohongshuNote[]> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/get-user-posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        count,
        xsec_token,
        download,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取用户笔记失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // LikeNoteAction - 点赞/取消点赞笔记
  async likeNote(note_id: string, like = true): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/like-note-action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note_id,
        like,
      }),
    })

    if (!response.ok) {
      throw new Error(`点赞操作失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // PostNoteComment - 发表评论
  async postComment(note_id: string, content: string): Promise<any> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/post-note-comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note_id,
        content,
      }),
    })

    if (!response.ok) {
      throw new Error(`发表评论失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // SearchNotes - 搜索笔记
  async searchNotes(
    keyword: string,
    count = 20,
    sort: "general" | "time_descending" | "popularity_descending" = "general",
    noteType: 0 | 1 | 2 = 0,
    download = false,
  ): Promise<XiaohongshuNote[]> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/search-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword,
        count,
        sort,
        noteType,
        download,
      }),
    })

    if (!response.ok) {
      throw new Error(`搜索笔记失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // SearchUsers - 搜索用户
  async searchUsers(keyword: string, count = 5, download = false): Promise<XiaohongshuUser[]> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/search-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword,
        count,
        download,
      }),
    })

    if (!response.ok) {
      throw new Error(`搜索用户失败: ${response.statusText}`)
    }

    return await response.json()
  }

  // Helper method to get available home feed categories
  getHomeFeedCategories() {
    return [
      { id: "homefeed_recommend", name: "推荐" },
      { id: "homefeed.fashion_v3", name: "穿搭" },
      { id: "homefeed.food_v3", name: "美食" },
      { id: "homefeed.cosmetics_v3", name: "彩妆" },
      { id: "homefeed.movie_and_tv_v3", name: "影视" },
      { id: "homefeed.career_v3", name: "职场" },
      { id: "homefeed.love_v3", name: "情感" },
      { id: "homefeed.household_product_v3", name: "家居" },
      { id: "homefeed.gaming_v3", name: "游戏" },
      { id: "homefeed.travel_v3", name: "旅行" },
      { id: "homefeed.fitness_v3", name: "健身" },
    ]
  }

  // Helper method to get search sort options
  getSearchSortOptions() {
    return [
      { value: "general", label: "综合排序" },
      { value: "time_descending", label: "最新排序" },
      { value: "popularity_descending", label: "最热排序" },
    ]
  }

  // Helper method to get note type options
  getNoteTypeOptions() {
    return [
      { value: 0, label: "全部类型" },
      { value: 1, label: "视频笔记" },
      { value: 2, label: "图文笔记" },
    ]
  }
}

export const xiaohongshuAPI = new XiaohongshuAPI()
