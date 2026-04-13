import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

/**
 * 浏览器标签页图标（favicon）。
 * 与 app/apple-icon.tsx 同一视觉语言：鼠尾草绿底 + 文章行 + 琥珀点。
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #4a7c62 0%, #2f4f3c 100%)",
          borderRadius: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 文章行 */}
        <div
          style={{
            position: "absolute",
            left: 7,
            right: 11,
            top: 9,
            height: 3,
            background: "rgba(247, 244, 237, 0.92)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 7,
            right: 11,
            top: 14,
            height: 3,
            background: "rgba(247, 244, 237, 0.86)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 7,
            width: 12,
            top: 19,
            height: 3,
            background: "rgba(247, 244, 237, 0.78)",
            borderRadius: 2,
          }}
        />

        {/* 琥珀点 */}
        <div
          style={{
            position: "absolute",
            right: 6,
            bottom: 6,
            width: 9,
            height: 9,
            borderRadius: 999,
            background: "#d4a04a",
            boxShadow: "0 1px 0 rgba(0,0,0,0.25)",
          }}
        />
      </div>
    ),
    { ...size }
  )
}

