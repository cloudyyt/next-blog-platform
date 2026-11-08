"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ImagePlus, Mic, Save, Square, TreePine } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { authFetch } from "@/lib/admin-fetch"
import type {
  InspirationItem,
  InspirationListResponse,
  UploadedInspirationFile,
} from "@/lib/types/inspiration"

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

async function readAudioDuration(file: File) {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = document.createElement("audio")
    audio.preload = "metadata"
    audio.src = url
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0
      URL.revokeObjectURL(url)
      resolve(duration)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(0)
    }
  })
}

export function NotesCapture() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const isAdmin = !authLoading && isAuthenticated && user?.role === "admin"
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [items, setItems] = useState<InspirationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [privacyMode, setPrivacyMode] = useState(true)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const audioInputRef = useRef<HTMLInputElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordSecondsRef = useRef(0)

  const loadItems = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/inspirations?limit=12")
      const payload = await res.json()
      if (!res.ok) {
        setError(payload?.message || "读取失败")
        return
      }
      setItems((payload as InspirationListResponse).items || [])
    } catch {
      setError("网络异常")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace("/admin/login?redirect=/notes")
    }
  }, [authLoading, user?.role, router])

  useEffect(() => {
    if (isAdmin) {
      void loadItems()
    } else {
      setLoading(false)
    }
  }, [isAdmin, loadItems])

  useEffect(() => {
    const saved = window.localStorage.getItem("notes:privacy-mode")
    if (saved === "0") setPrivacyMode(false)
  }, [])

  useEffect(() => {
    window.localStorage.setItem("notes:privacy-mode", privacyMode ? "1" : "0")
  }, [privacyMode])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const parseTags = () =>
    tags
      .split(/[,，#\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)

  const upload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await authFetch("/api/admin/inspirations/upload", {
      method: "POST",
      body: formData,
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload?.message || "上传失败")
    return payload as UploadedInspirationFile
  }, [])

  const createItem = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await authFetch("/api/admin/inspirations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, tags: parseTags(), source: "notes" }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.message || "保存失败")
      return payload as InspirationItem
    },
    // tags 输入在调用时读取，避免闭包过期
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tags],
  )

  const resetComposer = () => {
    setContent("")
    setTags("")
  }

  const saveText = async () => {
    if (!content.trim()) {
      setError("先写下一句想法")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createItem({ type: "text", content })
      resetComposer()
      setMessage("已存入，晚上再整理")
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败")
    } finally {
      setSaving(false)
    }
  }

  const saveImages = async (files: FileList | null) => {
    if (!files?.length) return
    setSaving(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const uploaded = await upload(file)
        await createItem({
          type: "image",
          imageUrl: uploaded.url,
          content: content.trim() || null,
        })
      }
      resetComposer()
      setMessage("图片已存入")
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片保存失败")
    } finally {
      setSaving(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  const saveAudioFile = async (file: File, seconds?: number) => {
    setSaving(true)
    setError(null)
    try {
      const uploaded = await upload(file)
      const duration = seconds ?? (await readAudioDuration(file))
      await createItem({
        type: "audio",
        audioUrl: uploaded.url,
        audioSeconds: duration,
        content: content.trim() || null,
      })
      resetComposer()
      setMessage("录音已存入")
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "录音保存失败")
    } finally {
      setSaving(false)
      if (audioInputRef.current) audioInputRef.current.value = ""
    }
  }

  const startRecording = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      audioInputRef.current?.click()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = ["audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        const type = recorder.mimeType || "audio/webm"
        const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm"
        const blob = new Blob(chunksRef.current, { type })
        const file = new File([blob], `note-${Date.now()}.${extension}`, { type })
        await saveAudioFile(file, recordSecondsRef.current)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
      setRecordSeconds(0)
      recordSecondsRef.current = 0
      timerRef.current = setInterval(() => {
        recordSecondsRef.current += 1
        setRecordSeconds(recordSecondsRef.current)
      }, 1000)
    } catch {
      audioInputRef.current?.click()
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setRecording(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      if (!saving && !recording) void saveText()
    }
  }

  if (!isAdmin) {
    return (
      <div className="admin-next an-notes-page">
        <main className="an-notes-shell">
          <section className="an-notes-card">
            <h1 className="an-notes-title">笔记</h1>
            <p className="an-hint" style={{ marginTop: "var(--an-space-3)" }}>
              正在确认访问权限…
            </p>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-next an-notes-page">
      <main className="an-notes-shell">
        <header className="an-notes-header">
          <div>
            <h1 className="an-notes-title">笔记</h1>
            <p className="an-hint">一句话也可以，写完就走</p>
          </div>
          <div className="an-notes-header-actions">
            {isAdmin && (
              <Link href="/treehole" className="an-button an-button-sm an-button-soft">
                <TreePine aria-hidden />
                树洞
              </Link>
            )}
            <button
              type="button"
              className={`an-button an-button-sm ${privacyMode ? "an-button-soft" : "an-button-primary"}`}
              onClick={() => setPrivacyMode((value) => !value)}
              aria-pressed={privacyMode}
            >
              {privacyMode ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              {privacyMode ? "隐藏" : "可见"}
            </button>
          </div>
        </header>

        <section className="an-notes-card">
          <label className="an-visually-hidden" htmlFor="note-content">记录内容</label>
          <textarea
            id="note-content"
            className="an-textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="此刻想到什么，写下来——一句话就行，写完就走"
            autoFocus
            spellCheck={false}
          />

          <div className="an-notes-actions">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="an-visually-hidden"
              onChange={(event) => void saveImages(event.target.files)}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="an-visually-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void saveAudioFile(file)
              }}
            />

            <button
              type="button"
              className="an-button an-button-soft"
              onClick={() => imageInputRef.current?.click()}
              disabled={saving || recording}
            >
              <ImagePlus aria-hidden /> 图片
            </button>
            {recording ? (
              <button type="button" className="an-button an-button-danger" onClick={stopRecording}>
                <Square aria-hidden /> 停止 {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:
                {String(recordSeconds % 60).padStart(2, "0")}
              </button>
            ) : (
              <button
                type="button"
                className="an-button an-button-soft"
                onClick={() => void startRecording()}
                disabled={saving}
              >
                <Mic aria-hidden /> 录音
              </button>
            )}
            <button
              type="button"
              className="an-button an-button-primary"
              onClick={() => void saveText()}
              disabled={saving || recording || !content.trim()}
            >
              <Save aria-hidden /> {saving ? "保存中" : "存入"}
            </button>
          </div>

          <div className="an-notes-meta">
            <span>图片和录音可以配一句说明，也可以不写</span>
            <span>⌘ / Ctrl + Enter</span>
          </div>

          <div className="an-field" style={{ marginTop: "var(--an-space-3)" }}>
            <label className="an-label" htmlFor="note-tags">标签</label>
            <input
              id="note-tags"
              className="an-input"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="可不打，例如：工作 下班后"
            />
          </div>

          {recording && (
            <div className="an-row" style={{ marginTop: "var(--an-space-3)" }}>
              <span className="an-recording-dot" aria-hidden />
              <span className="an-text-sm an-text-secondary">正在录音，松开手指前可以先想一句备注</span>
            </div>
          )}
          {message && <p className="an-hint" style={{ marginTop: "var(--an-space-3)", color: "var(--an-success)" }}>{message}</p>}
          {error && <p className="an-hint" style={{ marginTop: "var(--an-space-3)", color: "var(--an-danger)" }}>{error}</p>}
        </section>

        <section style={{ marginTop: "var(--an-space-5)" }}>
          <div className="an-day">最近记录</div>
          {loading ? (
            <p className="an-hint">读取中…</p>
          ) : items.length === 0 ? (
            <p className="an-hint">还没有内容。今天第一句，可以从半句话开始。</p>
          ) : (
            <div className={`an-notes-list ${privacyMode ? "an-private" : ""}`} aria-hidden={privacyMode}>
              {items.map((item) => (
                <article key={item.id} className="an-notes-item">
                  <div className="an-row-between">
                    <span className="an-meta">{formatTime(item.createdAt)}</span>
                    <span className="an-status">{item.type === "text" ? "文字" : item.type === "image" ? "图片" : "录音"}</span>
                  </div>
                  {item.content && <p className="an-item-content">{item.content}</p>}
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="an-image-thumb" src={item.imageUrl} alt="" />
                  )}
                  {item.audioUrl && <audio controls preload="none" src={item.audioUrl} />}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
