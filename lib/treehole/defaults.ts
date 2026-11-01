/**
 * 树洞电子书：第一版高保真占位内容。
 *
 * 这里先以 TS 配置落地书籍结构与占位内容，保证 /treehole 不再依赖旧
 * LifePost 时间线；后续接入 Admin 配置时，将这份数据结构映射到数据库。
 */

export type TreeholeBookElement = "wind" | "cloud" | "spring" | "summer" | "autumn" | "winter" | "rain" | "snow" | "light" | "sea"

export interface TreeholeBookSection {
  slug: string
  element: TreeholeBookElement
  elementLabel: string
  title: string
  tone: string
  moodTags: string
  leadSentence: string
  parallelSentence: string
  readerQuestion: string
  imageUrl?: string
  imageAlt?: string
  state: "published" | "draft"
  plannedTitles: string[]
}

export interface TreeholeBookArticle {
  slug: string
  sectionSlug: string
  title: string
  date: string
  readingTime: string
  description: string
  content: string
}

export interface TreeholeBookNote {
  slug: string
  sectionSlug: string
  date: string
  weather: string
  content: string
}

export const defaultTreeholeBook = {
  title: "因为这就是你的人生",
  author: "zijieLeo",
  subtitle: "天气 · 山海 · 光",
  description:
    "把那些没处放的记录，装进一本会呼吸的书。四季是情绪的章节，不是日历的章节；这里记录具体的事，也记录事情过去以后留下来的形状。",
  heroQuote: "有人被偏爱，就会有人被嫌弃；有人心碎满地，深夜独自疗愈。",
}

export const defaultTreeholeSections: TreeholeBookSection[] = [
  {
    slug: "sprout",
    element: "rain",
    elementLabel: "春霖",
    title: "春霖初落•迟疑•微光将醒",
    tone: "想改变 / 还没敢 / 正在萌芽",
    moodTags: "想改变 / 还没敢 / 正在萌芽",
    leadSentence: "给还想再等一等、但心里已经有动静的人。",
    parallelSentence: "雨来得很轻，疑心很重；芽还没出土，春天已经开始。",
    readerQuestion: "你是不是有点想改变，但先被自己的犹豫按住了？",
    imageAlt: "初春雨后的泥土与新草，远处有微弱晨光",
    imageUrl: "https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443866650-251ac693-treehole-spring-rain.webp",
    state: "published",
    plannedTitles: ["一点星光", "致梅芳", "“新”生活"],
  },
  {
    slug: "cloudy",
    element: "sea",
    elementLabel: "海雾",
    title: "海雾漫岸•迷航•灯塔失焦",
    tone: "迷茫 / 内耗 / 看不清自己",
    moodTags: "低压 / 迷茫 / 内耗",
    leadSentence: "给站在雾里、连自己都暂时看不清的人。",
    parallelSentence: "海在附近，岸也在附近；只有方向暂时不见了。",
    readerQuestion: "你是不是不是不想走，而是暂时不知道该往哪里走？",
    imageAlt: "海雾覆盖海岸线，远处灯塔在雾中失焦",
    imageUrl: "https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443893081-a57a6a6a-treehole-sea-fog.webp",
    state: "published",
    plannedTitles: ["恐怖片", "友达以上，恋人未满", "不过如此"],
  },
  {
    slug: "cold-rain",
    element: "rain",
    elementLabel: "冷雨",
    title: "冷雨叩窗•心碎•灯火失温",
    tone: "心碎 / 被放下 / 深夜未愈",
    moodTags: "心碎 / 被放下 / 深夜未愈",
    leadSentence: "给刚被放下、却还在替对方留灯的人。",
    parallelSentence: "窗外的雨有声音，屋里的解释没有；有人转身很快，有人收灯很慢。",
    readerQuestion: "你是不是还在等一句其实已经有答案的话？",
    imageAlt: "夜晚冷雨打在玻璃上，城市灯光化成蓝橙色光斑",
    imageUrl: "https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443920626-9daef434-treehole-cold-rain.webp",
    state: "published",
    plannedTitles: ["被比较", "被删除", "深夜自我怀疑"],
  },
  {
    slug: "blazing",
    element: "light",
    elementLabel: "烈日",
    title: "烈日翻山•不甘•影子很短",
    tone: "愤怒 / 不甘 / 还有力气",
    moodTags: "热烈 / 愤怒 / 不甘",
    leadSentence: "给心里还有火、又被现实晒得发烫的人。",
    parallelSentence: "光越强，影子越短；话越少，心里越响。",
    readerQuestion: "你是不是不甘心被这样安排，所以还想再翻一次山？",
    imageAlt: "强日光翻过山脊，山路投下短而硬的影子",
    imageUrl: "https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443948060-7f9cc4e5-treehole-blazing-light.webp",
    state: "published",
    plannedTitles: ["我的三国梦", "烟花", "钓鱼佬"],
  },
  {
    slug: "snow",
    element: "snow",
    elementLabel: "落雪",
    title: "落雪封径•无声•与己和解",
    tone: "安静 / 沉淀 / 和解",
    moodTags: "沉默 / 疲惫 / 想先放下",
    leadSentence: "给暂时不想说话、只想把事情放下来的人。",
    parallelSentence: "雪把路盖住，也把争吵盖住；不是所有和解，都需要当场完成。",
    readerQuestion: "你是不是不是好了，只是终于允许自己先停下来？",
    imageAlt: "雪覆盖山径，远处山体被雾雪压低",
    imageUrl: "https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793444278332-ec6f72ca-treehole-silent-snow.webp",
    state: "published",
    plannedTitles: ["月入3000", "荒原上的家", "雪落无声"],
  },
  {
    slug: "wind",
    element: "wind",
    elementLabel: "长风",
    title: "长风渡海•漂泊•无岸也行",
    tone: "漂泊 / 自由 / 想离开",
    moodTags: "想逃 / 自由 / 漂泊",
    leadSentence: "给想去远方、但被现实拉住衣角的人。",
    parallelSentence: "风没有承诺方向，海没有承诺岸；人还是要往前走一段。",
    readerQuestion: "你是不是想离开的不是地方，而是现在的自己？",
    imageAlt: "长风掠过海岸草甸，远处海面有轻微波光",
    imageUrl: "https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793444288697-98115577-treehole-endless-wind.webp",
    state: "published",
    plannedTitles: ["跳出去", "a big big world", "白月光和匠人", "迷路"],
  },
]

export const defaultTreeholeArticles: TreeholeBookArticle[] = [
  {
    slug: "escape",
    sectionSlug: "wind",
    title: "逃避",
    date: "2025-05-28",
    readingTime: "约 6 分钟",
    description:
      "改变不了，所以想逃避。想逃到星露谷，逃到青鸾峰，逃到爱琴海；实现不了，这些念想便成了白月光。",
    content: `
所有的一切似乎都成了定局，看似每天都不一样，实则大体相似。于是会想起那段话：“你究竟是活了一万天，还是一天活了一万次？”

我就在母体里，我真的能逃出去吗？很难。一层一层条件筛选，家庭背景、人脉关系、经济能力、个人能力……逃出去了，真的就会是美丽新世界吗？电影里的母体外，可是一个了无人烟、冰天雪地的世界。

《楚门的世界》里，楚门最后发现了大家的剧本化，决心划船，直面梦魇，在大海的边境撞到了一面墙。导演说：“这里确实是假的，但是外面的世界同样虚伪，你待在这里是最好的。”而现实里，我们很难遇到那样的守望者，不会有人专门守在悬崖边上，怕他迷路跌倒。

不争气的我，想着如果自己是楚门，我确实就想留在桃源岛，了此残生。动漫《火影忍者》里，带土和斑想创造的无限月读世界，我也是想去的。我不会自比主角团；如果一定要代入其中一个角色，我觉得是干柿鬼鲛——反正世界充斥着虚伪，不如期待一个承诺过的新世界，即便是无限幻境，也比当下更好。

> 改变不了，所以想逃避。想逃避到星露谷里，逃避到《仙剑四》的青鸾峰里，逃避到希腊爱琴海里……实现不了，这些念想便成为了白月光。

从现实世界抽身出来的那一刹那，白月光显得梦幻不真实。也许这就是白月光最大的意义：再怎么躺平摆烂，再怎么对身边事无动于衷，一个人总要有点念想，有点期待，有点支撑。

当然，这些都建立在一个早出晚归的普通上班族的基础上。纵使百般无奈，也得挣得碎银几两讨点生活。自己摆烂躺平无可厚非，但至少还要为了母亲——她二十年如一日承受的艰辛，绝对不是为了孩子在幻想乌托邦的。
`,
  },
  {
    slug: "support",
    sectionSlug: "wind",
    title: "支撑",
    date: "2025-05-28",
    readingTime: "约 3 分钟",
    description:
      "在最心如死灰的时候，一些词仍能慢慢燃起一点希望。它们像琥珀，凝聚着一段段纯粹专注的时光。",
    content: `
在最心如死灰的时候，想到一些词还是能慢慢燃起一点希望的：新海诚、仙剑轩辕剑、幻想三国志、星露谷……它们并不只是游戏动漫本身，它们像是琥珀一样，凝聚着我一段段沉浸纯粹专注的时光。

真正感受到自己成长的时候，一定是明白人终究是孤独的那一刻。父母、朋友、配偶、亲戚，没有谁能真正陪伴自己一辈子，内心里总会有自己一个人的战役。

再温馨甜美的感情也填满不了人的空虚。裂缝不会完全愈合，我知道这很悲观；但我从来没有否认那一位怀揣着真挚感情、跨过山海、愿意一针一线为你缝上伤痕的人。

> 有限的时间里，要好好珍惜。
`,
  },
  {
    slug: "heartbreak",
    sectionSlug: "cold-rain",
    title: "心碎",
    date: "2025-05-31",
    readingTime: "约 12 分钟",
    description:
      "不知道从什么时候起，多了一件害怕的事——陷入被比较和选择的处境中。人类情感上的复杂，才是更令人恐惧的存在。",
    content: `
不知道从什么时候起，多了一件害怕的事，比任何恐怖片都令我害怕——陷入被比较和选择的处境中。或许这就是我不怕看恐怖片的原因：有形的恐惧化身在我内心掀不起一丝波澜，人类本身情感上的复杂，才是更令人恐惧的存在。

我想这就是重点：人心都是肉做的，自然，怕被嫌弃，怕自己没人喜欢，怕别人可怜自己。

有一段时间固定晚上聊天的网友，在某个节点之后，毫无征兆地把你拉黑删除了。昨天还在夸你玩《你画我猜》时那个成语画得好，过两天就直接不能联系了。曾经一起玩游戏的朋友，平时几乎不打扰，只是偶尔需要一条验证码；几个月后再看，你又被删除了。你想不明白，却也不再追问。

> 谎言总是温柔的，比如“你总是我心里比较特别的那一个”。实际上，那也许只是寻找主菜和配菜果腹过渡的交替过程。

不同的乘客搭往不同的列车，驶向不同的终点。而你自始至终就没有那张上车的车票，你只是一个站台服务区，列车开久了靠站歇息而已。他们一直都知道自己要去哪里；吃饱喝足后，后视镜中的站台，只是拍张照发朋友圈纪念的存在。

在我的描述口吻中，大家容易受我影响，似乎她们都是奇女子。其实不对，她们都只是人之常情，而我才是真正“奇”的那一个：患得患失，敏感内耗。高度敏感和想象力强到一定程度，内耗可以足够严重，点燃自己只欠一根导火索。

有那么一瞬间，你想起“人是目的，而不是手段”，它顿时变得具象化起来。有人被偏爱，就会有人被嫌弃；有人踏破铁鞋无觅处，就会有人苦苦寻觅后竹篮打水一场空；有人满心欢喜，沐浴在爱与阳光下，就会有人心碎满地，深夜独自疗伤治愈。

心碎的时刻多了，心碎的阈值也就提高了，未尝不是一件坏事。至少，心碎足够安心、足够踏实。恐怖片呈现的恐惧是有形的，甚至带点玄幻猎奇；它们会轻轻拽着心往高处走，但毫无疑问，它们不会让人心碎。
`,
  },
  {
    slug: "because-this-is-my-life",
    sectionSlug: "snow",
    title: "因为这就是我的人生",
    date: "2025-06-24",
    readingTime: "约 15 分钟",
    description:
      "生闷气改变不了当下的处境。写下这篇，是为了在下次陷入抱怨情绪时，提醒自己跳出来。",
    content: `
最近看到好几条常年生闷气导致脑出血、血管堵塞的新闻，看到的时候确实心脏骤停：是不是我自己也会有这么一天？

写下这篇有两个目的：一是骂爽；二是下次又陷入生闷气的抱怨情绪时，提醒自己冷静下来，跳出这个桎梏。纸上得来终觉浅，实践起来真的太难了。生闷气改变不了一丁点当下的处境。有些人只会一年比一年糟糕，唯一能改变的只有自己。

> 指望他人永远都是被动的，不如自己主动改变、主动出击。

《越狱》里男主最后的墓志铭是：be the change you want to see in the world. 《荒野生存》里，老人一眼洞穿男主，说：“孩子，你总要学会原谅的。”男主礼貌性笑了一下，第二天仍旧离开，继续北上。他选择不回头，也不原谅。

我们常说未经他人苦，莫劝他人善。如果一切正常，没人会特意这么选。只想对那些劝人的人多说一句：不是每个身在困境里挣扎的人，都有像你那样优秀的条件。从井底仰望，看到的不过是一副副站着说话不腰疼的嘴脸。

《海边的曼彻斯特》告诉我们，有些事真的走不出来。特别是那些最日常不过的事发生了变故，会感觉头顶上一直有一根门梁，禁锢着自己。无数次想不明白：为什么有人能活成这个样子？再展开，怨气就会越来越重。只能单手撑住眉头，闭上眼，心里默念：

> 因为这就是我的人生。认了吧。

他冷漠，我就要有情有义；他毫无担当，我就要负重前行；他爱装糊涂，我就要慧眼如炬；他想把上一辈的歪风邪气变本加厉地延续，我就要竭尽全力，让这种恶劣风气终止在此。
`,
  },
]

export const defaultTreeholeNotes: TreeholeBookNote[] = [
  {
    slug: "alone-on-the-subway",
    sectionSlug: "cloudy",
    date: "2025-05-30",
    weather: "风",
    content:
      "早晚高峰沙丁鱼罐头般的地铁里，对线陌生人。很多人还是不懂得先下后上。后面我对这些寄希望于他人素质的事再也不抱希望了，唯一抱希望的是：希望自己匹配的运气好一点。",
  },
]
