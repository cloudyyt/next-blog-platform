/**
 * Admin API 客户端
 */

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const adminApi = {
  // 标签管理
  tags: {
    list: async () => {
      const response = await fetch("/api/admin/tags", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("获取标签失败")
      return response.json()
    },
    create: async (name: string) => {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "创建标签失败")
      }
      return response.json()
    },
    update: async (id: string, name: string) => {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "更新标签失败")
      }
      return response.json()
    },
    delete: async (id: string) => {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "删除标签失败")
      }
      return response.json()
    },
  },

  // 分类管理
  categories: {
    list: async () => {
      const response = await fetch("/api/admin/categories", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("获取分类失败")
      return response.json()
    },
    create: async (name: string, description?: string) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "创建分类失败")
      }
      return response.json()
    },
    update: async (id: string, name: string, description?: string) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "更新分类失败")
      }
      return response.json()
    },
    delete: async (id: string) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "删除分类失败")
      }
      return response.json()
    },
  },

  // 用户管理
  users: {
    list: async () => {
      const response = await fetch("/api/admin/users", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("获取用户失败")
      return response.json()
    },
    updateRole: async (id: string, role: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "更新用户失败")
      }
      return response.json()
    },
    delete: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "删除用户失败")
      }
      return response.json()
    },
  },

  // 文章管理
  posts: {
    list: async () => {
      const response = await fetch("/api/admin/posts", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("获取文章失败")
      return response.json()
    },
    togglePublish: async (id: string, published: boolean) => {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ published }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "更新文章失败")
      }
      return response.json()
    },
    delete: async (id: string) => {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "删除文章失败")
      }
      return response.json()
    },
  },
}

