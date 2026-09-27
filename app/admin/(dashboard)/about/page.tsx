import { AboutPageAdmin } from "@/components/admin/about-page-admin"
import { getAboutConfig } from "@/lib/about/data"
import { DEFAULT_ABOUT_CONFIG } from "@/lib/types/about"

/**
 * 关于页管理（server）
 * 读 AboutConfig 单例，缺失时用默认值 fallback，传 initial 给客户端。
 * 碎碎念列表由客户端组件自行 fetch（admin 接口）。
 */
export default async function AdminAboutPage() {
  const config = (await getAboutConfig()) ?? DEFAULT_ABOUT_CONFIG

  return <AboutPageAdmin initialConfig={config} />
}
