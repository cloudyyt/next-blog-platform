"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  Check,
  ExternalLink,
  Inbox,
  Lightbulb,
  NotebookPen,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import { authFetch } from "@/lib/admin-fetch"
import type {
  InspirationItem,
  InspirationItemType,
  InspirationListResponse,
  InspirationTopicSummary,
} from "@/lib/types/inspiration"

type ViewMode = "pool" | "topics"

const statusLabels: Record<string, string> = {
  inbox: "待处理",
  topic: "已入话题",
  draft: "已转草稿",
  incubated: "已孵化",
  archived: "已归档",
}

const typeLabels: Record<InspirationItemType, string> = {
  text: "文字",
  image: "图片",
  audio: "录音",
}

function formatDay(value: string) {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (sameDay(date, today)) return "今天"
  if (sameDay(date, yesterday)) return "昨天"
  return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

async function readError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null)
  return payload?.message || fallback
}

export function InspirationPoolApp() {
  const [items, setItems] = useState<InspirationItem[]>([])
  const [topics, setTopics] = useState<InspirationTopicSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>("pool")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<"all" | InspirationItemType>("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [newTopicTitle, setNewTopicTitle] = useState("")
  const [assignTopicId, setAssignTopicId] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingTags, setEditingTags] = useState("")
  const [working, setWorking] = useState(false)

  const refresh = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    try {
      const res = await authFetch("/api/admin/inspirations?limit=200")
      const payload = await res.json()
      if (!res.ok) {
        setError(await readError(res, "读取失败"))
        return
      }
      const data = payload as InspirationListResponse
      setItems(data.items || [])
      setTopics(data.topics || [])
      setError(null)
    } catch {
      setError("网络异常")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 2600)
    return () => clearTimeout(timer)
  }, [notice])

  const activeTopic = topics.find((topic) => topic.id === activeTopicId) || null

  const filteredItems = useMemo(() => {
    const keyword = search.trim().replace(/^#/, "")
    return items.filter((item) => {
      const matchKeyword = !keyword || item.content?.toLowerCase().includes(keyword.toLowerCase()) || item.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))
      const matchStatus = statusFilter === "all" || item.status === statusFilter
      const matchType = typeFilter === "all" || item.type === typeFilter
      const matchTopic = view === "topics" ? item.topics.some((topic) => topic.id === activeTopicId) : true
      return matchKeyword && matchStatus && matchType && matchTopic
    })
  }, [items, search, statusFilter, typeFilter, view, activeTopicId])

  const groupedItems = useMemo(() => {
    return filteredItems.reduce<Record<string, InspirationItem[]>>((acc, item) => {
      const key = formatDay(item.createdAt)
      acc[key] = acc[key] || []
      acc[key].push(item)
      return acc
    }, {})
  }, [filteredItems])

  const stats = useMemo(() => {
    const now = Date.now()
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    return {
      today: items.filter((item) => new Date(item.createdAt).getTime() >= dayStart.getTime()).length,
      week: items.filter((item) => now - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length,
      inbox: items.filter((item) => item.status === "inbox").length,
      drafts: topics.filter((topic) => topic.draftEntry).length,
    }
  }, [items, topics])

  const selectedItems = items.filter((item) => selectedIds.includes(item.id))
  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id))

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !filteredItems.some((item) => item.id === id)))
    } else {
      setSelectedIds((current) => Array.from(new Set([...current, ...filteredItems.map((item) => item.id)])))
    }
  }

  const patchItem = async (id: string, body: Record<string, unknown>, successMessage: string) => {
    setWorking(true)
    setError(null)
    try {
      const res = await authFetch(`/api/admin/inspirations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await readError(res, "更新失败"))
      await refresh()
      setNotice(successMessage)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败")
      return false
    } finally {
      setWorking(false)
    }
  }

  const createTopic = async () => {
    const title = newTopicTitle.trim()
    if (!title) {
      setError("给话题起一个临时名字")
      return
    }
    setWorking(true)
    setError(null)
    try {
      const res = await authFetch("/api/admin/inspirations/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.message || "创建失败")
      setNewTopicTitle("")
      await refresh()
      setActiveTopicId(payload.id)
      setView("topics")
      setNotice("话题已创建")
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败")
    } finally {
      setWorking(false)
    }
  }

  const assignSelectedToTopic = async (topicId: string) => {
    if (!topicId || selectedItems.length === 0) return
    setWorking(true)
    setError(null)
    try {
      await Promise.all(
        selectedItems.map((item) =>
          authFetch(`/api/admin/inspirations/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topicIds: Array.from(new Set([...item.topics.map((topic) => topic.id), topicId])),
            }),
          }),
        ),
      )
      setSelectedIds([])
      setAssignTopicId("")
      await refresh()
      setNotice("已加入话题")
    } catch {
      setError("加入话题失败")
    } finally {
      setWorking(false)
    }
  }

  const createTopicFromSelection = async () => {
    const title = newTopicTitle.trim()
    if (!title) {
      setError("先输入新话题名")
      return
    }
    setWorking(true)
    setError(null)
    try {
      const res = await authFetch("/api/admin/inspirations/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.message || "创建话题失败")
      await Promise.all(
        selectedItems.map((item) =>
          authFetch(`/api/admin/inspirations/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topicIds: [...item.topics.map((topic) => topic.id), payload.id] }),
          }),
        ),
      )
      setNewTopicTitle("")
      setSelectedIds([])
      await refresh()
      setActiveTopicId(payload.id)
      setView("topics")
      setNotice("已创建话题并加入碎片")
    } catch (err) {
      setError(err instanceof Error ? err.message : "整理失败")
    } finally {
      setWorking(false)
    }
  }

  const archiveSelected = async () => {
    setWorking(true)
    try {
      await Promise.all(
        selectedItems.map((item) =>
          authFetch(`/api/admin/inspirations/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "archived" }),
          }),
        ),
      )
      setSelectedIds([])
      await refresh()
      setNotice("已归档")
    } catch {
      setError("归档失败")
    } finally {
      setWorking(false)
    }
  }

  const deleteSelected = async () => {
    if (!window.confirm(`确定删除 ${selectedItems.length} 条碎片吗？此操作不可恢复。`)) return
    setWorking(true)
    try {
      await Promise.all(
        selectedItems.map((item) => authFetch(`/api/admin/inspirations/${item.id}`, { method: "DELETE" })),
      )
      setSelectedIds([])
      await refresh()
      setNotice("已删除")
    } catch {
      setError("删除失败")
    } finally {
      setWorking(false)
    }
  }

  const removeFromTopic = async (item: InspirationItem) => {
    if (!activeTopicId) return
    await patchItem(
      item.id,
      { topicIds: item.topics.filter((topic) => topic.id !== activeTopicId).map((topic) => topic.id) },
      "已移出话题",
    )
  }

  const saveEditing = async (item: InspirationItem) => {
    const ok = await patchItem(item.id, { content: editingContent, tags: editingTags }, "已保存")
    if (ok) setEditingId(null)
  }

  const createDraft = async (topic: InspirationTopicSummary) => {
    setWorking(true)
    setError(null)
    try {
      const res = await authFetch("/api/admin/inspirations/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.message || "生成草稿失败")
      await refresh()
      setNotice("草稿已生成")
      window.open(`/treehole/write/${payload.entryId}`, "_blank", "noopener,noreferrer")
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成草稿失败")
    } finally {
      setWorking(false)
    }
  }

  const deleteTopic = async (topic: InspirationTopicSummary) => {
    if (!window.confirm(`删除话题“${topic.title}”？碎片会留在灵感池。`)) return
    setWorking(true)
    try {
      const res = await authFetch(`/api/admin/inspirations/topics/${topic.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await readError(res, "删除话题失败"))
      if (activeTopicId === topic.id) setActiveTopicId(null)
      await refresh()
      setNotice("话题已删除")
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除话题失败")
    } finally {
      setWorking(false)
    }
  }

  const renderItem = (item: InspirationItem, inTopicView = false) => {
    const selected = selectedIds.includes(item.id)
    const editing = editingId === item.id

    return (
      <article key={item.id} className={`an-item ${selected ? "is-selected" : ""}`}>
        <header className="an-item-head">
          <div className="an-select-row">
            <input
              className="an-checkbox"
              type="checkbox"
              checked={selected}
              onChange={() => toggleSelected(item.id)}
              aria-label={`选择 ${formatTime(item.createdAt)} 的碎片`}
            />
            <span className="an-meta">{formatTime(item.createdAt)}</span>
            <span className="an-status">{typeLabels[item.type]}</span>
            <span className={`an-status an-status-${item.status}`}>{statusLabels[item.status] || item.status}</span>
          </div>
          <div className="an-chip-row">
            {item.topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className="an-chip an-chip-static"
                onClick={() => {
                  setActiveTopicId(topic.id)
                  setView("topics")
                }}
              >
                {topic.title}
              </button>
            ))}
          </div>
        </header>

        {editing ? (
          <div className="an-stack">
            <textarea
              className="an-textarea"
              value={editingContent}
              onChange={(event) => setEditingContent(event.target.value)}
              aria-label="编辑内容"
            />
            <input
              className="an-input"
              value={editingTags}
              onChange={(event) => setEditingTags(event.target.value)}
              aria-label="编辑标签"
              placeholder="标签，用空格或逗号分隔"
            />
          </div>
        ) : (
          <>
            {item.content && <p className="an-item-content">{item.content}</p>}
            {item.imageUrl && (
              <div className="an-attachment">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="an-image-thumb" src={item.imageUrl} alt={item.content || "灵感图片"} />
                <span>图片素材</span>
              </div>
            )}
            {item.audioUrl && (
              <div className="an-attachment">
                <audio controls preload="none" src={item.audioUrl} />
              </div>
            )}
            {item.tags.length > 0 && (
              <div className="an-chip-row" style={{ marginTop: "var(--an-space-3)" }}>
                {item.tags.map((tag) => (
                  <span key={tag} className="an-chip an-chip-static">#{tag}</span>
                ))}
              </div>
            )}
          </>
        )}

        <div className="an-item-actions">
          {editing ? (
            <>
              <button
                type="button"
                className="an-button an-button-sm an-button-primary"
                onClick={() => void saveEditing(item)}
                disabled={working}
              >
                <Check aria-hidden /> 保存
              </button>
              <button
                type="button"
                className="an-button an-button-sm an-button-quiet"
                onClick={() => setEditingId(null)}
              >
                取消
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="an-button an-button-sm an-button-soft"
                onClick={() => {
                  setEditingId(item.id)
                  setEditingContent(item.content || "")
                  setEditingTags(item.tags.join(" "))
                }}
              >
                编辑
              </button>
              {inTopicView && activeTopicId && (
                <button
                  type="button"
                  className="an-button an-button-sm an-button-soft"
                  onClick={() => void removeFromTopic(item)}
                  disabled={working}
                >
                  移出话题
                </button>
              )}
              <button
                type="button"
                className="an-button an-button-sm an-button-danger"
                onClick={() => void patchItem(item.id, { status: "archived" }, "已归档")}
                disabled={working}
              >
                <Archive aria-hidden /> 归档
              </button>
            </>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="admin-next an-page">
      <div className="an-container an-shell">
        <header className="an-header">
          <div>
            <p className="an-header-kicker">Admin Next · 01</p>
            <h1 className="an-title">灵感池</h1>
            <p className="an-description">
              白天只负责把一闪而过的想法丢进来；晚上把相关碎片聚成话题，再孵化成树洞草稿。
            </p>
          </div>
          <div className="an-header-actions">
            <Link href="/notes" className="an-button an-button-soft" target="_blank">
              <NotebookPen aria-hidden /> 打开捕捉页
            </Link>
            <button
              type="button"
              className="an-button an-button-soft"
              onClick={() => void refresh(true)}
              disabled={refreshing}
            >
              <RefreshCw aria-hidden className={refreshing ? "animate-spin" : undefined} /> 刷新
            </button>
          </div>
        </header>

        <div className="an-grid an-grid-cards-4" aria-label="灵感池统计">
          <div className="an-stat"><div className="an-stat-value">{stats.today}</div><div className="an-stat-label">今天新增</div></div>
          <div className="an-stat"><div className="an-stat-value">{stats.week}</div><div className="an-stat-label">近 7 天</div></div>
          <div className="an-stat"><div className="an-stat-value">{stats.inbox}</div><div className="an-stat-label">待整理</div></div>
          <div className="an-stat"><div className="an-stat-value">{stats.drafts}</div><div className="an-stat-label">已孵化话题</div></div>
        </div>

        <div className="an-row-between an-wrap">
          <div className="an-tabs" role="tablist" aria-label="灵感池视图">
            <button
              className="an-tab"
              role="tab"
              type="button"
              aria-selected={view === "pool"}
              onClick={() => setView("pool")}
            >
              灵感池
            </button>
            <button
              className="an-tab"
              role="tab"
              type="button"
              aria-selected={view === "topics"}
              onClick={() => setView("topics")}
            >
              话题
            </button>
          </div>
          <p className="an-hint">碎片会留在时间线原位；加入话题只是建立一层索引。</p>
        </div>

        {error && <div className="an-alert" role="alert">{error}</div>}
        {notice && (
          <p className="an-hint" style={{ color: "var(--an-success)" }} role="status" aria-live="polite">
            {notice}
          </p>
        )}

        <div className="an-grid an-grid-workspace">
          <section className="an-section">
            <div className="an-card an-card-pad">
              <div className="an-toolbar">
                <div className="an-field">
                  <label className="an-label" htmlFor="inspiration-search">搜索</label>
                  <div className="an-row">
                    <Search aria-hidden className="an-text-tertiary" size={18} />
                    <input
                      id="inspiration-search"
                      className="an-input"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="搜内容或标签"
                    />
                  </div>
                </div>
                <div className="an-row">
                  <label className="an-visually-hidden" htmlFor="status-filter">状态</label>
                  <select
                    id="status-filter"
                    className="an-select"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">全部状态</option>
                    <option value="inbox">待处理</option>
                    <option value="topic">已入话题</option>
                    <option value="draft">已转草稿</option>
                    <option value="incubated">已孵化</option>
                    <option value="archived">已归档</option>
                  </select>
                  <label className="an-visually-hidden" htmlFor="type-filter">类型</label>
                  <select
                    id="type-filter"
                    className="an-select"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
                  >
                    <option value="all">全部类型</option>
                    <option value="text">文字</option>
                    <option value="image">图片</option>
                    <option value="audio">录音</option>
                  </select>
                </div>
              </div>

              <div className="an-row-between an-wrap" style={{ marginTop: "var(--an-space-4)" }}>
                <label className="an-row an-text-sm an-text-secondary">
                  <input className="an-checkbox" type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />
                  选择当前列表
                </label>
                {view === "topics" && activeTopic && (
                  <div className="an-row">
                    <span className="an-status an-status-topic">{activeTopic.itemCount} 条素材</span>
                    <button type="button" className="an-button an-button-sm an-button-primary" onClick={() => void createDraft(activeTopic)} disabled={working || activeTopic.itemCount === 0}>
                      <Sparkles aria-hidden /> 更新 / 生成草稿
                    </button>
                    {activeTopic.draftEntry && (
                      <Link className="an-button an-button-sm an-button-soft" href={`/treehole/write/${activeTopic.draftEntry.id}`}>
                        <ExternalLink aria-hidden /> {activeTopic.draftEntry.published ? "查看已发布" : "打开草稿"}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="an-selection-bar">
                <div>
                  <strong>已选 {selectedItems.length} 条</strong>
                  <p className="an-hint">可以加入已有话题，也可以立刻新建一个选题。</p>
                </div>
                <div className="an-selection-actions">
                  <select
                    className="an-select"
                    value={assignTopicId}
                    onChange={(event) => setAssignTopicId(event.target.value)}
                    aria-label="加入已有话题"
                  >
                    <option value="">加入已有话题…</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>{topic.title}</option>
                    ))}
                  </select>
                  <button type="button" className="an-button an-button-primary" onClick={() => void assignSelectedToTopic(assignTopicId)} disabled={working || !assignTopicId}>
                    加入
                  </button>
                  <input className="an-input" value={newTopicTitle} onChange={(event) => setNewTopicTitle(event.target.value)} placeholder="或输入新话题" aria-label="新话题名称" />
                  <button type="button" className="an-button an-button-soft" onClick={() => void createTopicFromSelection()} disabled={working || !newTopicTitle.trim()}>
                    <Plus aria-hidden /> 新建
                  </button>
                  <button type="button" className="an-button an-button-soft" onClick={() => void archiveSelected()} disabled={working}>
                    <Archive aria-hidden /> 归档
                  </button>
                  <button type="button" className="an-button an-button-danger" onClick={() => void deleteSelected()} disabled={working}>
                    <Trash2 aria-hidden /> 删除
                  </button>
                </div>
              </div>
            )}

            <div className="an-timeline">
              {loading ? (
                <div className="an-card an-card-pad"><p className="an-hint">正在读取灵感池…</p></div>
              ) : filteredItems.length === 0 ? (
                <div className="an-card an-card-muted an-card-pad">
                  <div className="an-row">
                    <Inbox aria-hidden />
                    <div>
                      <p className="an-card-title">这里还没有碎片</p>
                      <p className="an-card-subtitle">白天打开 /notes，一句话也可以先丢进来。</p>
                    </div>
                  </div>
                </div>
              ) : (
                Object.entries(groupedItems).map(([day, dayItems]) => (
                  <section key={day}>
                    <h2 className="an-day">{day}</h2>
                    {dayItems.map((item) => renderItem(item, view === "topics"))}
                  </section>
                ))
              )}
            </div>
          </section>

          <aside className="an-section">
            <div className="an-card an-card-pad">
              <div className="an-row">
                <span className="an-status an-status-topic"><Lightbulb aria-hidden /></span>
                <div>
                  <h2 className="an-card-title">正在生长的话题</h2>
                  <p className="an-card-subtitle">先让素材累积，再决定哪一篇值得写</p>
                </div>
              </div>

              <div className="an-field" style={{ marginTop: "var(--an-space-4)" }}>
                <label className="an-label" htmlFor="topic-title">新话题</label>
                <input
                  id="topic-title"
                  className="an-input"
                  value={newTopicTitle}
                  onChange={(event) => setNewTopicTitle(event.target.value)}
                  placeholder="例如：下班后的耗尽感"
                />
                <button type="button" className="an-button an-button-primary" onClick={() => void createTopic()} disabled={working || !newTopicTitle.trim()}>
                  <Plus aria-hidden /> 创建话题
                </button>
              </div>
            </div>

            <div className="an-topic-list">
              {topics.length === 0 ? (
                <div className="an-card an-card-muted an-card-pad">
                  <p className="an-hint">还没有话题。选几条相关碎片，就能创建第一个选题。</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`an-topic ${activeTopicId === topic.id ? "is-active" : ""}`}
                    onClick={() => {
                      setActiveTopicId(topic.id)
                      setView("topics")
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setActiveTopicId(topic.id)
                        setView("topics")
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={activeTopicId === topic.id}
                  >
                    <div className="an-topic-head">
                      <h3 className="an-topic-title">{topic.title}</h3>
                      <span className="an-status an-status-topic">{topic.itemCount}</span>
                    </div>
                    {topic.description && <p className="an-topic-meta">{topic.description}</p>}
                    <p className="an-topic-meta">
                      {topic.draftEntry ? (topic.draftEntry.published ? "已发布" : "有草稿") : "持续积累中"}
                    </p>
                    <div className="an-item-actions">
                      <button
                        type="button"
                        className="an-button an-button-sm an-button-primary"
                        onClick={(event) => {
                          event.stopPropagation()
                          void createDraft(topic)
                        }}
                        disabled={working || topic.itemCount === 0}
                      >
                        生成草稿
                      </button>
                      <button
                        type="button"
                        className="an-button an-button-sm an-button-danger"
                        onClick={(event) => {
                          event.stopPropagation()
                          void deleteTopic(topic)
                        }}
                        disabled={working}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
