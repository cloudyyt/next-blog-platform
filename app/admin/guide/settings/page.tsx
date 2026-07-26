import { GuideSeriesConfigForm } from "@/components/admin/guide-series-config-form"
import { getGuideSeriesConfig } from "@/lib/guide/data"
import type { GuideSeriesConfig } from "@/lib/types/guide"

/**
 * /admin/guide/settings — 系列配置页
 * server component：从 GuideSeriesConfig singleton 读取作为初始值
 */
export default async function GuideSettingsPage() {
  const config = await getGuideSeriesConfig()

  // singleton 理论上总存在（seed 已建）；缺失时给安全默认值，不阻塞编辑
  const initial: GuideSeriesConfig = config ?? {
    title: "前端工程师转型 Agent 开发指南",
    subtitle: null,
    coverImage: null,
    badge: "连载中",
    cta: null,
    valueCard1: null,
    valueCard2: null,
    valueCard4: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    groups: [],
  }

  return <GuideSeriesConfigForm initial={initial} />
}
