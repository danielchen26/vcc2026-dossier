import type { ReactNode } from "react";
import type { Lang } from "./i18n";


type Copy = {
  nav: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroThesis: ReactNode;
  heroMeta: [string, string][];
  dialTitle: string;
  dialLede: ReactNode;
  dialChip: string;
  s: Record<string, { t: string; k?: string }>;
  p: Record<string, ReactNode>;
  h: Record<string, string>;
  cols: { opt: string[]; cmp: string[] };
  foot: ReactNode;
};

const NAV_ZH = ["要交什么", "分数在哪", "我们的发现", "两种做法对比", "我们的方法", "怎么证明", "值多少分", "要多少算力", "会踩的坑", "接下来"];
const NAV_EN = ["The deliverable", "Where the points are", "What we found", "Ours vs theirs", "Our method", "How we know", "What it's worth", "What it costs", "Traps", "What's next"];

const zh: Copy = {
  nav: NAV_ZH,
  heroEyebrow: "ARC INSTITUTE · VIRTUAL CELL CHALLENGE 2026",
  heroTitle: "评分器每个基因只看两个数字。",
  heroThesis: (
    <>
      所有人都在用 GPU 生成「看起来很真」的单细胞。我们先把评分规则完整算了一遍，
      发现它<b>根本不看细胞长什么样</b>——每个基因只读两个数。
      知道这件事之后，评分可以在笔记本上自己算（快 41 倍），提交文件也可以精确地
      <b>设计</b>成想要的样子。<b>占总分三分之二的那四个指标，315 支队伍集体是空的。</b>
    </>
  ),
  heroMeta: [
    ["自己打分的加速", "41×"],
    ["与官方结果", "完全一致"],
    ["构造器精度", "250 / 250"],
    ["生成整份提交", "4 分钟 · 无 GPU"],
  ],
  dialTitle: "动手试一下",
  dialLede: (
    <>
      下面这张图是我们最关键的发现，做成了可以拖的。
      平均值一直锁死不动，你只改「这 400 个细胞之间怎么分配表达量」——
      统计检验的结论就会从「铁定变了」翻到「没变」再翻回「铁定变了」。
    </>
  ),
  dialChip: "真实官方数据驱动",
  s: {
    task: { t: "你到底要交什么", k: "不是模型，不是权重，不是代码。" },
    field: { t: "分数都藏在哪", k: "315 支队伍，第一名总分 0.1899。" },
    reduction: { t: "我们发现了什么", k: "这是「不用 GPU」的全部根据。" },
    compare: { t: "我们的做法，和大家的做法", k: "14 个方面逐一对比。右边每一条都有证据。" },
    method: { t: "方法：分成两步", k: "第一步预测答案，第二步精确写出答案。第二步已经做完了。" },
    verify: { t: "怎么证明它是对的", k: "全部在官方数据上、这台笔记本上、没有 GPU。" },
    payoff: { t: "这值多少分", k: "用官方公布的基准算，不是估计。" },
    budget: { t: "要多少算力", k: "一台 M1 Pro，16 GB 内存，没有 CUDA。" },
    traps: { t: "会静默扣分的坑", k: "它们都不报错，只会让结果看起来像「模型不行」。" },
    next: { t: "接下来做什么", k: "整条流水线现在只缺第一步。" },
  },
  p: {
    taskLede: (
      <>
        这个区别是整件事的支点。官方原话是 <em>only those results form your entry</em>——
        参赛者自己跑模型，<b>只有那个矩阵构成参赛作品</b>；只有获奖者需要事后补一份文字说明。
        所以这不是「训练一个虚拟细胞模型」的比赛，是<b>「造一个能通过一套固定统计检验的表格」</b>的比赛。
      </>
    ),
    fieldDecodeP: (
      <>
        排行榜每格印了两个数。我们用官方公布的基准把它们对上了：<b>前面那个是换算后的分数，后面那个是原始值</b>，
        而且六个换算后的分数取平均，正好等于总分。这一步是后面所有分析的前提。
      </>
    ),
    fieldWhyP1: (
      <>
        评分时，把你交的 400 个细胞和官方 18,400 个对照细胞放在一起，逐个基因做统计检验。
        问题在于这个检验<b>极其敏感</b>：
      </>
    ),
    fieldWhyP2: (
      <>
        <b>「这个基因平均排在对照的第几百分位」只要移动 2.78 个百分点，就会被判成「变了」。</b>
        很多模型输出的 400 个细胞几乎一模一样（都接近平均值），细胞之间没有差异，
        于是几乎整个基因组都被推过这条线——大规模乱报。这就是榜首那两项等于 0 的原因。
      </>
    ),
    redLede: (
      <>
        评分时用来做对比的那 18,400 个对照细胞，<b>在整场比赛里是同一组，从不变化</b>。
        对一个固定的对照组，这个统计检验有一个可以直接加总的写法。
      </>
    ),
    redPsiP: <>它跟 <code>scipy.stats.mannwhitneyu</code> 的结果<b>完全相等</b>，包括「400 个细胞全一样」这种极端情况：</>,
    redConclusion: <><b>于是六个指标全部只经过每个基因的两个数字。</b></>,
    redNote: (
      <>
        <b>没有一个指标去看你的细胞之间怎么搭配。</b>
        所以「生成逼真的单细胞」这件事，对分数<b>一分都不加</b>——它只是一个必须满足的格式要求。
        全场投入算力最多的地方，恰好是不产生分数的地方。
      </>
    ),
    redTieP: <>计数数据里有大量的 0，就有大量并列值，检验的标准差要按并列情况调小：</>,
    redTieNote: <>这让判定标准严了 2.8%。这是我们跟官方最后 1–2 个基因差距的<em>唯一</em>原因。</>,
    redDecoupP: (
      <>
        下面这张表是上面那个滑块的精确数值版，用的是真实基因 <code>SELENOT</code>。
        平均值全程锁死，也就是「涨 25%」这个结论从头到尾没变过：
      </>
    ),
    redDecoupNote: (
      <>
        注意 <b>t = 3.00</b> 那行：平均值<em>仍然是涨的</em>，但检验读到的偏移变成了负的，
        而且判为「铁定变了」。原因是这个检验看的是<b>排名</b>，而涨跌倍数看的是<b>平均值</b>——两者可以指向相反方向。
      </>
    ),
    redDecoupWrap: (
      <>
        所以在每个基因上，我们有<b>三个可以分别设定的旋钮</b>：要不要报「这个基因变了」、
        报涨还是报跌、报涨多少。这就是下一节能分成两步的原因。
      </>
    ),
    cmpLede: (
      <>
        大家的默认路线是「训一个更大的生成式单细胞模型」。这条路线在「认得出是哪个扰动」上确实有效——
        榜首拿到 0.708。但它把另外四个指标完全交给了运气。
        我们不去跟它抢那一项；我们去拿它放掉的那三分之二。
      </>
    ),
    cmpFairH: "他们做对了什么",
    cmpFairP: (
      <>
        「认得出是哪个扰动」考的是：不同基因被敲低之后的反应模式，能不能互相区分。
        这需要真实的生物学信号，而大模型确实提供了（榜首原始分 0.820，基线是 0.500）。
        <b>我们的第二步在这个指标上帮不上任何忙</b>，它必须靠第一步的预测质量去挣。
        诚实的结论是：两条路线互补，不互斥。
      </>
    ),
    cmpNotHackH: "为什么这不是钻规则漏洞",
    cmpNotHackP: (
      <>
        第二步不改变任何生物学主张。它做的事情是：把第一步的预测
        （哪些基因变了、涨还是跌、涨多少）<b>不打折扣地</b>翻译成评分器要求的 400 个整数细胞。
        传统做法在这一步有巨大而且自己不知道的损耗——把本来正确的预测糟蹋成掷硬币。
        我们只是把这个损耗清零。<b>分数最后还是完全取决于第一步预测得多准。</b>
      </>
    ),
    methodMathH: "第二步在数学上是什么",
    methodMathP1: <>给定一个目标平均值和一个目标「检验读数」，在整数格子上找 400 个数：</>,
    methodMathP2: (
      <>
        平均值固定的前提下，「检验读数」能取到的范围是一个<b>区间</b>：一头是把表达量平摊到 400 个细胞，
        另一头是集中到少数细胞、其余为 0。而它随分布形状<b>单调变化</b>，所以这是一个一维单调方程，
        二分 24 步就解出来了。约束只有三条：整数、每个细胞总量不超过一百万、整个矩阵存的数不超过上限。
      </>
    ),
    methodThreeH: "三个顺带得到的结论",
    methodLosslessH: "「不打折扣」是什么意思",
    methodLosslessP: <>假设第一步预测得完全准，把构造出来的矩阵送进评分公式，得到的正好是「完美复现真实数据」的理论上限：</>,
    methodNullH: "「没变」的基因不用建模",
    methodNullP: (
      <>
        最省事也最正确的办法是<b>直接抄真实对照细胞</b>：「没变」这件事自动成立，
        稀疏程度和噪声结构天然正确，乱报实测是 <b>0</b>。
        设计精力只花在预测会变的那 250 个基因上，剩下 9,700 个一行代码都不用写。
      </>
    ),
    methodOptH: "工程上做了哪些优化",
    verifyManifestH: "官方文件里的一句证明",
    verifyManifestP1: <>上一轮我们把「发的对照细胞就是打分用的那组」标记为「待验证」。官方的 manifest 直接给了答案：</>,
    verifyManifestP2: <>所以对照分布、5 ppm 的筛选门、多重检验的基因全集，全部可以在本地精确重建。</>,
    verifyParityH: "跟官方打分器逐个基因对照",
    verifyCtxH: "三个细胞系差多少",
    verifyCtxP: (
      <>
        它们的基础表达谱两两相关只有 0.69–0.79。这是<b>跨组织</b>的细胞系，不是近亲。
        所以「细胞系之间的迁移」是真问题——第一步没法靠「假装三个细胞系一样」蒙过去。
      </>
    ),
    payHiH: "如果那两项也一起做好",
    payHiP: (
      <>
        注意「表达量准不准」是六项里唯一有上限的（钳在 1），其余五项没有上限，
        所以强的提交可以超过 1。<b>不要把分数当百分比读。</b>
      </>
    ),
    budgetCutH: "为什么不需要下 61 GB 数据",
    budgetNote: (
      <>
        <b>挡路的不是算法，是磁盘。</b>整份提交 17.1 GB，装不进 16 GB 内存——
        办法是按基因一块块追加写出，不是降低质量。公开数据集本身仍然需要约 200 GB 落地空间。
      </>
    ),
    nextLede: (
      <>
        第二步保证了一件事：<b>只要能预测出「哪些基因变了、涨还是跌、涨多少」，分数就是确定的</b>——
        中间没有任何损耗。而这个预测问题的规模是 300 个基因 × 3 个细胞系，训练素材不到 2 GB。
        这是经典统计的尺寸，不是深度学习的尺寸。
      </>
    ),
    artifactsH: "已经写好的代码",
  },
  h: {
    shape: "一轮要交的规模", caps: "格式上的硬限制", timeline: "时间线",
    decode: "排行榜怎么读（已用算术验证）", whyEmpty: "为什么那四项是空的",
    psiName: "把检验改写成「查表」", anchors: "官方公布的 0 分和 1 分在哪",
    tie: "并列校正不能省", decouple: "两个旋钮是独立的",
    lbTable: "前五名明细", checks: "官方数据包逐项核对",
    payTable: "挑对基因的收益", budget: "实测预算", parity: "对照结果",
  },
  cols: {
    opt: ["优化", "做法", "收益"],
    cmp: ["方面", "大家的做法", "我们的做法", "证据"],
  },
  foot: (
    <>
      本页所有数字，要么来自 Arc 官方页面和评分规范，要么是在官方 controls.zip 上本机实测。
      算出来的部分已标注。1.0 是地标不是上限，分数不是百分比。
    </>
  ),
};

const en: Copy = {
  nav: NAV_EN,
  heroEyebrow: "ARC INSTITUTE · VIRTUAL CELL CHALLENGE 2026",
  heroTitle: "The scorer only ever reads two numbers per gene.",
  heroThesis: (
    <>
      Everyone is burning GPUs to generate single cells that look real. We worked the scoring rule out
      end to end and found that it <b>never looks at what the cells look like</b> — just two numbers per gene.
      Once you know that, you can compute the score yourself on a laptop (41× faster), and you can
      <b> design</b> a submission that hits any target exactly. <b>Four of the six metrics — two thirds of the
      total — are sitting untouched by all 315 teams.</b>
    </>
  ),
  heroMeta: [
    ["Scoring speedup", "41×"],
    ["Against the official scorer", "identical"],
    ["Builder accuracy", "250 / 250"],
    ["Full submission", "4 min · no GPU"],
  ],
  dialTitle: "Try it yourself",
  dialLede: (
    <>
      This is our central finding, made draggable. The average is locked and never moves. All you change
      is how the expression is spread across the 400 cells — and the statistical test flips from
      “definitely changed” to “unchanged” and back to “definitely changed”.
    </>
  ),
  dialChip: "driven by real official data",
  s: {
    task: { t: "What you actually hand in", k: "Not a model, not weights, not code." },
    field: { t: "Where the points are", k: "315 teams. The leader's total is 0.1899." },
    reduction: { t: "What we found", k: "This is the whole reason no GPU is needed." },
    compare: { t: "Our approach vs everyone else's", k: "Fourteen aspects, side by side. Every claim on the right has evidence." },
    method: { t: "The method: two stages", k: "Predict the answer, then write it out exactly. Stage two is finished." },
    verify: { t: "How we know it's right", k: "All of it on the official data, on this laptop, with no GPU." },
    payoff: { t: "What it's worth", k: "Computed from the organisers' own reference points, not estimated." },
    budget: { t: "What it costs to run", k: "One M1 Pro, 16 GB, no CUDA." },
    traps: { t: "Traps that cost points silently", k: "None of them raise an error. They just make good work look like a weak model." },
    next: { t: "What's next", k: "The pipeline is complete except for stage one." },
  },
  p: {
    taskLede: (
      <>
        This distinction is the hinge of the whole thing. The official wording is
        <em> only those results form your entry</em> — you run your own model, and <b>only the matrix is
        your entry</b>. Winners write a description afterwards. So this is not a contest about training a
        virtual cell model. It is a contest about <b>building a table that passes a fixed statistical test.</b>
      </>
    ),
    fieldDecodeP: (
      <>
        Each cell on the leaderboard prints two numbers. We reconciled them against the organisers'
        published reference points: <b>the first is the rescaled score, the second is the raw value</b>, and
        the six rescaled scores average exactly to the total. Everything that follows rests on this.
      </>
    ),
    fieldWhyP1: (
      <>
        To score you, your 400 cells are pooled with the organisers' 18,400 control cells and a
        statistical test is run gene by gene. The problem is that this test is <b>extremely sensitive</b>:
      </>
    ),
    fieldWhyP2: (
      <>
        <b>Move a gene's average percentile within the controls by just 2.78 points and it is called
        “changed”.</b> Many models emit 400 near-identical cells, all close to the average, so there is
        almost no variation between them — and nearly the whole genome gets pushed across that line.
        Mass over-calling. That is why the leader scores zero on two metrics.
      </>
    ),
    redLede: (
      <>
        The 18,400 control cells used for comparison are <b>the same group for the entire competition and
        never change</b>. For a fixed comparison group, this test has a form you can simply add up.
      </>
    ),
    redPsiP: <>It is <b>exactly equal</b> to what <code>scipy.stats.mannwhitneyu</code> returns, including the degenerate case where all 400 cells are identical:</>,
    redConclusion: <><b>So all six metrics pass through only two numbers per gene.</b></>,
    redNote: (
      <>
        <b>Not one metric looks at how your cells co-vary.</b> Generating realistic-looking single cells is
        therefore worth <b>zero points</b> — it is purely a formatting requirement. The place where the field
        spends most of its compute is precisely the place that earns nothing.
      </>
    ),
    redTieP: <>Count data is full of zeros, hence full of ties, and the test's standard deviation must shrink accordingly:</>,
    redTieNote: <>That tightens the threshold by 2.8%. It was the <em>only</em> cause of our last 1–2 gene disagreement with the official scorer.</>,
    redDecoupP: (
      <>
        The table below is the exact numerical version of the slider above, on the real gene
        <code> SELENOT</code>. The average is locked throughout, so the conclusion “up 25%” never changes:
      </>
    ),
    redDecoupNote: (
      <>
        Look at <b>t = 3.00</b>: the average is <em>still up</em>, yet the shift the test reads has gone
        negative and the gene is called “definitely changed”. The test reads <b>ranks</b>; the fold change
        reads the <b>average</b>. They can point in opposite directions.
      </>
    ),
    redDecoupWrap: (
      <>
        So on every gene we have <b>three independently settable dials</b>: whether to flag it as changed,
        whether to call it up or down, and by how much. That is what makes the two-stage split in the next
        section possible.
      </>
    ),
    cmpLede: (
      <>
        The default route is “train a bigger generative single-cell model”. That route genuinely works on
        one metric — telling perturbations apart, where the leader reaches 0.708. But it leaves the other
        four entirely to luck. We are not competing for that one metric. We are going after the two thirds
        it gives away.
      </>
    ),
    cmpFairH: "What the conventional route gets right",
    cmpFairP: (
      <>
        Telling perturbations apart asks whether the response patterns of different knocked-down genes can
        be distinguished from each other. That needs real biological signal, and large models do supply it
        (leader's raw 0.820 against a 0.500 baseline). <b>Our stage two contributes nothing to that metric</b>;
        it has to be earned by the quality of stage one. The honest conclusion is that the two routes are
        complementary, not mutually exclusive.
      </>
    ),
    cmpNotHackH: "Why this isn't gaming the rules",
    cmpNotHackP: (
      <>
        Stage two makes no biological claim at all. What it does is translate stage one's prediction —
        which genes changed, up or down, by how much — into the 400 whole-number cells the scorer wants,
        <b> without losing anything</b>. The conventional route has a large and unrecognised loss at exactly
        this step: it degrades correct predictions into coin flips. We simply zero that loss out.
        <b> The score still depends entirely on how good stage one is.</b>
      </>
    ),
    methodMathH: "What stage two is, mathematically",
    methodMathP1: <>Given a target average and a target test reading, find 400 whole numbers such that:</>,
    methodMathP2: (
      <>
        With the average fixed, the reachable range of the test reading is an <b>interval</b>: at one end the
        expression is spread evenly across all 400 cells, at the other it is concentrated in a few cells with
        the rest at zero. And it moves <b>monotonically</b> with the shape, so this is a one-dimensional
        monotone equation — twenty-four bisection steps solve it. Only three constraints: whole numbers, no
        cell above one million total, and the whole matrix under the storage cap.
      </>
    ),
    methodThreeH: "Three things that fall out of this",
    methodLosslessH: "What “without losing anything” means",
    methodLosslessP: <>Assume stage one is perfect, push the constructed matrix through the scoring formula, and you get exactly the theoretical ceiling for reproducing the real data:</>,
    methodNullH: "Unchanged genes need no model",
    methodNullP: (
      <>
        The easiest and most correct option is to <b>copy the real control cells directly</b>. “Unchanged”
        then holds by construction, sparsity and noise structure are right for free, and false flags
        measured <b>zero</b>. Design effort goes only into the ~250 genes we predict will change; the other
        9,700 need no code at all.
      </>
    ),
    methodOptH: "The engineering optimisations",
    verifyManifestH: "One line in the official file settles it",
    verifyManifestP1: <>Last round we flagged “the control cells they hand out are the ones used for scoring” as unverified. The official manifest answers it directly:</>,
    verifyManifestP2: <>So the control distribution, the 5 ppm filter, and the gene universe for multiple-testing correction can all be rebuilt locally, exactly.</>,
    verifyParityH: "Gene-by-gene against the official scorer",
    verifyCtxH: "How different are the three cell lines",
    verifyCtxP: (
      <>
        Their baseline profiles correlate only 0.69–0.79 pairwise. These are <b>cross-tissue</b> cell lines,
        not close relatives. Transfer between cell lines is a real problem — stage one cannot get away with
        pretending the three are the same.
      </>
    ),
    payHiH: "If those two metrics are done well too",
    payHiP: (
      <>
        Note that expression accuracy is the only one of the six with a ceiling (clamped at 1); the other
        five are unbounded above, so a strong submission can exceed 1.
        <b> Do not read the score as a percentage.</b>
      </>
    ),
    budgetCutH: "Why you don't need to download 61 GB",
    budgetNote: (
      <>
        <b>The blocker is disk, not the algorithm.</b> A full submission is 17.1 GB and won't fit in 16 GB of
        memory — the answer is to append it gene by gene, not to lower the quality. The public datasets
        themselves still need around 200 GB of space.
      </>
    ),
    nextLede: (
      <>
        Stage two guarantees one thing: <b>if you can predict which genes changed, up or down, and by how
        much, the score is determined</b> — nothing is lost in between. And that prediction problem is
        300 genes × 3 cell lines with under 2 GB of training material. That is a classical-statistics size,
        not a deep-learning size.
      </>
    ),
    artifactsH: "Code already written",
  },
  h: {
    shape: "One round, by the numbers", caps: "Hard format limits", timeline: "Timeline",
    decode: "How to read the leaderboard (checked by arithmetic)", whyEmpty: "Why those four are empty",
    psiName: "Rewriting the test as a lookup", anchors: "Where the organisers put 0 and 1",
    tie: "Tie correction is not optional", decouple: "The two dials are independent",
    lbTable: "Top five in detail", checks: "The official bundle, item by item",
    payTable: "Payoff from recovering responders", budget: "Measured budget", parity: "Results side by side",
  },
  cols: {
    opt: ["Optimisation", "What we do", "Payoff"],
    cmp: ["Aspect", "The usual approach", "Ours", "Evidence"],
  },
  foot: (
    <>
      Every number on this page is either from the Arc official pages and scoring specification, or measured
      on this machine against the official controls.zip. Arithmetic is labelled as such. 1.0 is a landmark,
      not a maximum, and the score is not a percentage.
    </>
  ),
};

export const COPY: Record<Lang, Copy> = { zh, en };

/* 数学块在两种语言下相同，集中放这里 */
export const MATH = {
  psi: String.raw`\psi_g(v)=\#\{c:\,x_{cg}<v\}+\tfrac12\#\{c:\,x_{cg}=v\}
    \qquad\Longrightarrow\qquad U_g=\sum_{i=1}^{400}\psi_g(v_i)`,
  dCrit: String.raw`d_{\text{crit}}=\frac{1.96\,\sigma}{n_1 n_2}=0.0278`,
  sigmaTie: String.raw`\sigma_{\text{tie}}=\sqrt{\frac{n_1n_2}{12}\left[(N+1)-\frac{\sum_t (t^3-t)}{N(N-1)}\right]}`,
  manifest: String.raw`138{,}400 \;=\; 300\times400 \;+\; 18{,}400`,
  design: String.raw`\operatorname{mean}_i v_i=\hat m_g,
    \qquad \sum_{i=1}^{400}\psi_g(v_i)=U_g^{\text{target}},
    \qquad v_i\in\mathbb{Z}_{\ge 0}`,
  stage1: String.raw`(x^{\text{basal}}_c,\, g)\;\mapsto\;(\hat R,\ \widehat{\mathrm{lfc}},\ \text{rank})`,
  scale: String.raw`s=(u-b)/(r-b)`,
  jacH: String.raw`\mathrm{jac}=h/(2-h)`,
};

