import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/**
 * iOS / Safari 主屏幕图标：与 app/icon.svg 同一视觉（鼠尾草绿底 + 文章行 + 琥珀点）
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 40,
          background: "linear-gradient(145deg, #4a7c62 0%, #2f4f3c 100%)",
          borderRadius: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              height: 14,
              width: "55%",
              background: "#f7f4ed",
              borderRadius: 8,
              opacity: 0.95,
            }}
          />
          <div
            style={{
              height: 14,
              width: "88%",
              background: "#f7f4ed",
              borderRadius: 8,
              opacity: 0.88,
            }}
          />
          <div
            style={{
              height: 14,
              width: "48%",
              background: "#f7f4ed",
              borderRadius: 8,
              opacity: 0.8,
            }}
          />
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "#d4a04a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginLeft: 16,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: "rgba(247, 244, 237, 0.92)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
