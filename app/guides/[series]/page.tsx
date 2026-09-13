import { notFound } from "next/navigation"
import { getGuideOverviewData } from "@/lib/guide/data"
import { isRegisteredSeries } from "@/lib/guide/series"
import { AgentGuideLanding } from "./landings/agent-guide-landing"
import { AgentStackLanding } from "./landings/agent-stack-landing"

/**
 * 系列 landing 分发页：/guides/[series]
 *
 * 共享数据骨架（config + 全部章节按篇聚合），按系列分发到各自的 landing：
 * 各书专属区块（A：转型地图/三种读法；B：工具链路线图/实战锚点）按系列定制，
 * 不做全配置化（YAGNI，见 docs_memo/0901 决策五.5）。
 */
export default async function SeriesPage({
  params,
}: {
  params: Promise<{ series: string }>
}) {
  const { series } = await params
  if (!isRegisteredSeries(series)) notFound()

  const { groups, config } = await getGuideOverviewData(series)

  if (series === "agent-guide") {
    return <AgentGuideLanding groups={groups} config={config} />
  }
  if (series === "agent-stack") {
    return <AgentStackLanding groups={groups} config={config} />
  }
  notFound()
}
