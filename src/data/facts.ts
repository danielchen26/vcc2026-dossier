/* ============================================================================
   全部事实的唯一来源。每条都带溯源标记:
     official — Arc 官方页面 / metric spec / manifest.json
     measured — 本机在官方数据上实测 (2026-08-27, M1 Pro, 无 GPU)
     derived  — 由 official + measured 做算术推出
   ========================================================================= */

export type Prov = "official" | "measured" | "derived" | "gap";

/* ---------------------------------------------------------------- 任务定义 */

export const TASK = [
  { k: "赛制", v: "zero-shot 跨细胞系迁移", n: "2026 年不提供任何新训练集" },
  { k: "给你什么", v: "非靶向对照谱 + 300 个待预测基因名", n: "每 context 18,400 个对照细胞，46 条 NTC guide × 400" },
  { k: "交付物", v: "一个 .vcc 文件", n: "360,000 × 18,533 非负整数计数矩阵，单文件覆盖三个 context" },
  { k: "不交", v: "不交代码、不交模型、不交权重", n: "官方原话：only those results form your entry" },
  { k: "验证轮", v: "context A / B / C", n: "三个匿名细胞系，live leaderboard" },
  { k: "决赛轮", v: "context D / E / F", n: "10-22 放出控制谱，最终排名只看决赛轮" },
  { k: "提交额度", v: "2 次 / 天", n: "UTC 午夜刷新，同时只允许 1 个 in flight" },
  { k: "排名依据", v: "最近一次提交", n: "不是最好那次 —— 别拿垃圾提交收尾" },
];

export const SHAPE = [
  { k: "基因", v: "18,533", u: "个", n: "顺序由 gene_names.csv 固定" },
  { k: "扰动", v: "300", u: "个", n: "CRISPRi 敲低，>80% on-target" },
  { k: "每扰动细胞", v: "400", u: "个", n: "精确值，多一个少一个都拒收" },
  { k: "提交总细胞", v: "360,000", u: "个", n: "300 × 400 × 3 contexts" },
];

export const CAPS = [
  { k: "每细胞计数上限", v: "1,000,000", n: "max_counts_per_cell" },
  { k: "总细胞上限", v: "400,000", n: "本届 panel 用掉 360,000" },
  { k: "存储条目上限", v: "4.75×10⁹", n: "≈13,194 / cell；显式存储的零也计入" },
  { k: "dense 数组", v: "6.67×10⁹", n: "= cap 的 1.40×，本身就超限" },
];

export const TIMELINE = [
  { d: "08-04", e: "注册开放", s: "past" },
  { d: "08-20", e: "挑战开始 · 验证集放出", s: "past" },
  { d: "08-27", e: "本工作簿修订日", s: "now" },
  { d: "10-22", e: "决赛集 (D/E/F) 放出", s: "future" },
  { d: "11-05", e: "最终提交截止", s: "future" },
  { d: "11-下旬", e: "公布获奖", s: "future" },
];

/* ------------------------------------------------------- 官方参考锚点 (b, r) */
/* cell-eval2 0.15.0, rule_version 3, 区间跨 context A/B/C */

export const METRICS = [
  { id: "pds", name: "扰动可辨识度", cid: "pds_cosine",
    what: "预测效应是否更接近它自己的真实效应，而非别的扰动的",
    b: 0.5, bTxt: "0.500", r: 0.955, rTxt: "0.927–0.984", span: "0.43–0.48",
    perfect: "1.03–1.17", clamp: "无", cohort: "300" },
  { id: "mse", name: "表达准确度", cid: "expr_mse_unbiased_capped_norm",
    what: "预测与真实表达谱的平方距离，扣掉有限细胞数带来的采样噪声后，再除以真实效应的大小",
    b: 0.989, bTxt: "0.986–0.992", r: 0.036, rTxt: "0.028–0.045", span: "0.95–0.96",
    perfect: "1.000", clamp: "[0, 1]", cohort: "panel 比值" },
  { id: "nmae", name: "DE 幅度准确度", cid: "de_wilcoxon_lfc_nmae",
    what: "参考显著基因上 log2 倍数变化的归一化平均绝对误差",
    b: 1.0013, bTxt: "1.0009–1.0017", r: 0.4, rTxt: "0.369–0.431", span: "0.57–0.63",
    perfect: "1.58–1.75", clamp: "下限 −6", cohort: "209–261" },
  { id: "fid", name: "DE 方向保真度", cid: "de_wilcoxon_direction_fidelity_yield_raw",
    what: "你判为显著的基因里，方向与真实一致的比例；按产出量折扣，少报要罚",
    b: 0.513, bTxt: "0.505–0.522", r: 0.813, rTxt: "0.795–0.832", span: "0.28–0.33",
    perfect: "1.51–1.72", clamp: "无", cohort: "295–300" },
  { id: "reach", name: "DE 方向纵深", cid: "de_wilcoxon_direction_reach_raw",
    what: "按你自己的置信度排序后，方向保持纯净能走多深",
    b: 0.072, bTxt: "0.047–0.097", r: 0.968, rTxt: "0.958–0.978", span: "0.86–0.93",
    perfect: "1.02–1.05", clamp: "无", cohort: "290–300" },
  { id: "jac", name: "DE 显著集重叠", cid: "de_wilcoxon_sig_jaccard",
    what: "两侧显著基因集的 Jaccard；除以并集，所以多报也罚",
    b: 0.029, bTxt: "0.021–0.037", r: 0.399, rTxt: "0.375–0.423", span: "0.34–0.39",
    perfect: "2.48–2.85", clamp: "无", cohort: "300" },
];

export const ANCHOR: Record<string, { b: number; r: number }> = Object.fromEntries(
  METRICS.map((m) => [m.id, { b: m.b, r: m.r }]),
);

export const scaled = (id: string, raw: number) =>
  (raw - ANCHOR[id].b) / (ANCHOR[id].r - ANCHOR[id].b);

/* ------------------------------------------------------------- 排行榜快照 */
/* 2026-08-26 抓取，315 队。每格 [scaled, raw]。列序解码已用算术验证：
   六个 scaled 的无权平均 = overall (1.139/6 = 0.18983 ≈ 0.1899)。 */

export const LB_ORDER = ["pds", "mse", "jac", "nmae", "fid", "reach"] as const;

export const LEADERBOARD = [
  { rank: 1, team: "Aginglab.com", org: "AgingLab", model: "GeroAI_v11", overall: 0.1899, subs: 6,
    m: { pds: [0.708, 0.82], mse: [0.041, 0.959], jac: [-0.004, 0.029], nmae: [0.178, 0.892], fid: [0.003, 0.514], reach: [0.213, 0.267] } },
  { rank: 2, team: "Ibrahim Mansour", org: "", model: "CellSim", overall: 0.1708, subs: 13,
    m: { pds: [0.709, 0.82], mse: [0.161, 0.835], jac: [-0.005, 0.028], nmae: [0.088, 0.947], fid: [-0.043, 0.5], reach: [0.115, 0.18] } },
  { rank: 3, team: "Jurassic Park", org: "光州科学技术院", model: "jp13", overall: 0.1667, subs: 13,
    m: { pds: [0.644, 0.791], mse: [0.0, 1.917], jac: [0.008, 0.033], nmae: [0.157, 0.905], fid: [-0.003, 0.512], reach: [0.194, 0.251] } },
  { rank: 4, team: "GISL", org: "哥伦比亚大学", model: "GISL v8", overall: 0.156, subs: 8,
    m: { pds: [0.638, 0.788], mse: [0.0, 5.165], jac: [0.01, 0.034], nmae: [0.108, 0.936], fid: [0.0, 0.513], reach: [0.18, 0.238] } },
  { rank: 5, team: "Vivai", org: "", model: "vivai-m24", overall: 0.1549, subs: 13,
    m: { pds: [0.709, 0.82], mse: [0.0, 4.172], jac: [0.002, 0.031], nmae: [0.133, 0.92], fid: [-0.026, 0.505], reach: [0.111, 0.177] } },
];

export const N_TEAMS = 315;
export const TOP_OVERALL = 0.1899;

/* --------------------------------------------------------- 包内容实测核对 */

export const BUNDLE = {
  file: "controls.zip",
  bytes: 662_118_680,
  sha256: "329a22bc29cac4f43ad0b846b9bb1a383f7a945c83a8cb0450c465f6dc5cc4b5",
  members: [
    { n: "context_A.h5ad", mb: 225.0 },
    { n: "context_B.h5ad", mb: 211.0 },
    { n: "context_C.h5ad", mb: 226.1 },
    { n: "gene_names.csv", mb: 0.1 },
    { n: "pert_counts.csv", mb: 0.02 },
    { n: "manifest.json", mb: 0.001 },
  ],
};

export const CHECKS = [
  { k: "X 形状", v: "18,400 × 18,533 CSR float32", ok: true, spec: "✓" },
  { k: "var 索引顺序", v: "与 gene_names.csv 逐位相同（三个 context 均是）", ok: true, spec: "✓" },
  { k: "counts", v: "全整数，min 1，max 977", ok: true, spec: "✓ raw counts" },
  { k: "每细胞 UMI", v: "中位 20,109 · 均值 21,134 · [3,275, 52,420]", ok: true, spec: '✓ "median ~20,000"' },
  { k: "每细胞 nnz", v: "中位 6,147 · 均值 5,973", ok: true, spec: "—" },
  { k: "ntc_id", v: "46 条 guide × 恰好 400 细胞", ok: true, spec: "✓" },
  { k: "pert_counts.csv", v: "300 行 · 无重复 · 全部 ∈ gene_names", ok: true, spec: "✓" },
];

export const MANIFEST_PROOF = {
  field: "ground_truth_cells",
  value: 138_400,
  decomp: "300 × 400 + 18,400",
  claim: "发布给参赛者的 18,400 个对照细胞，就是打分时用的参考比较组。",
};

/* ------------------------------------------------- 三个 context 的实测差异 */

export const CONTEXTS = [
  { c: "A", gate: 9929, pct: 0.536, gt1: 11199, nz: 16135 },
  { c: "B", gate: 9626, pct: 0.519, gt1: 11121, nz: 15680 },
  { c: "C", gate: 10124, pct: 0.546, gt1: 11654, nz: 16216 },
];
export const GATE_INTER = 7991;
export const GATE_UNION = 11961;
export const BASAL_CORR = [
  { p: "A–B", r: 0.742 },
  { p: "A–C", r: 0.6854 },
  { p: "B–C", r: 0.7927 },
];

/* --------------------------------------------------------- psi 恒等式验证 */

export const PSI_CHECK = [
  { case: "null draw", scipy: "3,862,696.0", psi: "3,862,696.0", ok: true },
  { case: "shifted", scipy: "4,735,458.5", psi: "4,735,458.5", ok: true },
  { case: "degenerate（点质量）", scipy: "4,771,000.0", psi: "4,771,000.0", ok: true },
];

export const SIGMA = {
  plain: 107_384,
  tie: 104_477,
  dCritPlain: 0.0286,
  dCritTie: 0.0278,
};

/* --------------------------------------------- 与官方打分器的逐基因对齐 */

export const PARITY = [
  { p: "ABCD1", off: 251, mineTie: 251, minePlain: 249, sym: 0, lfcMax: "1.007e-5" },
  { p: "ACLY", off: 250, mineTie: 250, minePlain: 249, sym: 0, lfcMax: "1.008e-5" },
  { p: "ADNP", off: 251, mineTie: 251, minePlain: 250, sym: 0, lfcMax: "1.019e-5" },
];

export const PARITY_META = {
  gateOfficial: 9929,
  gateMine: 9929,
  rows: 29_787,
  padjDiff: "0.0000",
  officialJac: 0.249377,
  officialFid: [0.49004, 0.466135, 0.517928],
  officialReach: 0.0,
  version: "cell-eval2 0.16.0 · preset vcc2026 · backend scanpy · device cpu",
};

export const SPEED = {
  officialBoth: 626.7,
  officialOne: 296.85,
  mine: 7.66,
  ratio: 41,
  panelOfficialH: 52,
  panelMine1: 60,
  panelMine10: 6,
};

/* ------------------------------------------------------- Stage 2 验证结果 */

export const STAGE2 = {
  intended: 250,
  realized: 250,
  hit: 250,
  recall: 1.0,
  precision: 1.0,
  fp: 0,
  direction: 1.0,
  lfcErr: 0.00061,
  padjResponders: "4.27e-10",
  padjNullMin: "1.000",
  tDesign: 0.28,
  tDe: 3.98,
  tLoad: 12.8,
  nnzCell: 5998,
};

export const LOSSLESS = [
  { id: "jac", raw: 1.0, sc: 2.62 },
  { id: "fid", raw: 1.0, sc: 1.62 },
  { id: "nmae", raw: 0.001, sc: 1.66 },
];

/* ------------------------------------------------------------- 收益算术 */

export const PAYOFF_SIGN = [
  { a: 0.55, overall: 0.1169 },
  { a: 0.65, overall: 0.1725 },
  { a: 0.75, overall: 0.228 },
  { a: 0.85, overall: 0.2836 },
];

export const PAYOFF_H = [
  { h: 0.1, jac: 0.064, fid: 0.24, reach: 0.009, nmae: 0.085, overall: 0.1888 },
  { h: 0.2, jac: 0.222, fid: 0.357, reach: 0.098, nmae: 0.168, overall: 0.2633 },
  { h: 0.3, jac: 0.399, fid: 0.473, reach: 0.187, nmae: 0.252, overall: 0.341 },
  { h: 0.4, jac: 0.597, fid: 0.59, reach: 0.277, nmae: 0.335, overall: 0.4223 },
  { h: 0.5, jac: 0.823, fid: 0.707, reach: 0.366, nmae: 0.418, overall: 0.508 },
];

export const PAYOFF_FULL = { h: 0.4, overall: 0.4881,
  parts: { pds: 0.88, mse: 0.25, jac: 0.6, nmae: 0.33, fid: 0.59, reach: 0.28 } };

/* --------------------------------------------------------------- 预算 */

export const BUDGET = [
  { k: "psi 表", v: "434 MB / context", n: "2 秒构建" },
  { k: "ControlRef 加载", v: "12.8 s / context", n: "含 CSR 读入与 ECDF 排序" },
  { k: "提交矩阵密度", v: "2.16×10⁹ 条目", n: "= cap 的 45%，nnz/cell ≈ 5,998" },
  { k: "提交矩阵内存", v: "17.1 GB raw", n: "按扰动块流式写，每块 19 MB，常驻 <100 MB" },
  { k: "全 panel 构造", v: "4 分钟", n: "900 × 0.28 s" },
  { k: "全 panel 自评", v: "6 分钟", n: "十核并行" },
];

export const MACHINE = {
  cpu: "Apple M1 Pro · 10 核",
  ram: "16 GB",
  gpu: "无 CUDA",
  disk: "65 GB 空闲",
};

export const PSEUDOBULK_CUT = [
  { d: "Replogle 2022 K562 全基因组", raw: "61.3 GB", pb: "731 MB", x: "83×",
    n: "≈9,867 扰动 × 18,533 float32" },
  { d: "Replogle 2022 RPE1", raw: "8.1 GB", pb: "152 MB", x: "53×", n: "≈2,057 扰动" },
  { d: "Nadig 2025 HepG2 + Jurkat", raw: "13.9 GB", pb: "~200 MB", x: "70×", n: "DepMap common essential" },
  { d: "Jiang 2025 六个癌系", raw: "—", pb: "~300 MB", x: "—", n: "离线跨 context 基准，与本届任务同构" },
];

/* -------------------------------------------------- 传统做法 vs 我们的方法 */

export const COMPARE: {
  axis: string; sub: string; them: string; us: string; prov: Prov; ev?: string;
}[] = [
  {
    axis: "问题框架", sub: "framing",
    them: "训练一个生成式单细胞模型（foundation model / VAE / transformer），端到端吐出细胞，把打分当作外部裁判。",
    us: "打分函数是闭式统计泛函 → 两级分解：估计（预测答案）⊕ 构造（精确实现答案）。这是逆问题与离散设计，不是表示学习。",
    prov: "derived",
  },
  {
    axis: "打分器", sub: "scorer",
    them: "把 cell-eval2 当黑盒，靠线上 2 次/天的反馈调参；一次全量 CPU 评估 52 小时，笔记本上不可迭代。",
    us: "用 ψ 算子精确复刻，与官方逐基因一致；41× 加速，全 panel 自评 6 分钟，本地无限次迭代。",
    prov: "measured", ev: "对称差 0",
  },
  {
    axis: "细胞真实感", sub: "realism",
    them: "花大量算力让生成的单细胞“看起来像真的”（NB 采样、扩散、VAE 解码）。",
    us: "证明六个指标只经过每基因两个充分统计量（一阶矩、平均对照分位数）。细胞级联合分布对分数零贡献 —— 真实感只是格式约束。",
    prov: "measured", ev: "ψ 恒等式 3/3",
  },
  {
    axis: "显著性", sub: "significance",
    them: "显著性是模型输出的副产品，不可控。输出接近均值的复制品 → 组内方差≈0 → Wilcoxon 判几乎全基因组显著 → 过报。",
    us: "显著性由平均对照分位数 ψ̄ 单调决定，对非零比例二分 24 步即可精确命中目标。可以逐基因指定进不进显著集。",
    prov: "measured", ev: "250/250",
  },
  {
    axis: "方向", sub: "direction",
    them: "方向来自生成噪声。全场 fid raw ≈ 0.514 = 掷硬币，与基线 0.505–0.522 无区别。",
    us: "方向由一阶矩独立设定，与显著性完全解耦 —— 实测 t=3.0 时均值向上（lfc=+0.32）而 d<0、p=5×10⁻²⁰。两个坐标可独立指定。",
    prov: "measured", ev: "解耦已验证",
  },
  {
    axis: "效应幅度", sub: "effect size",
    them: "不做收缩校准。全场 nmae raw 0.892，仅略优于“预测零变化”的 1.0013。",
    us: "nmae 关于全局收缩系数 λ 凸且分段线性 → 3 次线上提交包围即可解析定出最优 λ。",
    prov: "derived",
  },
  {
    axis: "显著集大小", sub: "call-set size",
    them: "不控制 |R̂|。fid 罚少报、jac 罚多报，两侧同时漏分。",
    us: "解析最优点是 |R̂| = |R|，此时 jac = h/(2−h)。而 |R| 本身可用 1 次提交套出：令 R̂ = 全部 gate 基因，回读 jac 即得 |R|/9,929。",
    prov: "derived",
  },
  {
    axis: "库大小", sub: "library size",
    them: "模拟真实测序深度（~20k UMI），把它当物理约束。",
    us: "证明 L 是自由变量 —— DE 按每细胞归一到 10⁶、pseudobulk 归一到 5×10⁴，两级都尺度无关。取 L = 10⁶ 使 counts ≡ CPM，免费拿到 1-CPM 分辨率。",
    prov: "derived",
  },
  {
    axis: "稀疏度", sub: "density",
    them: "dense 数组 = cap 的 1.40×，本身就超限被拒；均值基线 11,800 nnz/cell 只剩 10% 余量。官方 FAQ 记录过 25 MB 文件被拒、3.3 GB 文件通过。",
    us: "自举真实对照细胞的支撑集 → 5,998 nnz/cell = cap 的 45%。关键洞察：每细胞稀疏 ≠ pseudobulk 稀疏，400 个稀疏细胞的并集仍覆盖全部有表达基因，pds/mse 不受损。",
    prov: "measured", ev: "45% cap",
  },
  {
    axis: "成分性", sub: "compositional",
    them: "直接把 delta 加到均值谱上，忽略 CPM 是成分数据 → 行和约束无解，或吃到一个隐性全局平移。",
    us: "显式重归一到 10⁶，并量化了平移量（测试中 log₂Z = +0.0154）。Stage 1 的 lfc 因此必须定义在归一化之后。",
    prov: "measured", ev: "log₂Z 已量化",
  },
  {
    axis: "null 背景", sub: "null calibration",
    them: "背景细胞从模型采样 → p 值不校准，假阳性淹没真信号。",
    us: "背景直接自举真实对照细胞 → ψ̄ 自动 ≈ 0.5，假阳性实测为 0。只在预测会响应的那 ~250 个基因上花设计。",
    prov: "measured", ev: "FP = 0",
  },
  {
    axis: "训练数据", sub: "data scale",
    them: "下载 61 GB 原始细胞去训 foundation model。",
    us: "指标只看 pseudobulk 与逐基因矩量 → 只需 per-perturbation pseudobulk，61.3 GB → 731 MB（83× 压缩），流式提取，磁盘占用≈0。",
    prov: "derived",
  },
  {
    axis: "算力", sub: "compute",
    them: "A100 / H100，foundation model 微调；State 预训练 checkpoint 对商业实体还需申请许可。",
    us: "M1 Pro 笔记本，16 GB，无 CUDA。全 panel 构造 4 分钟，自评 6 分钟。",
    prov: "measured", ev: "已跑通",
  },
  {
    axis: "迭代循环", sub: "iteration",
    them: "线上 2 次/天，每次约一小时延迟，全程总额度 ~142 次。",
    us: "本地全 panel 自评 6 分钟，无限次；线上额度只用于套取未知量（|R|、λ）与最终提交。",
    prov: "derived",
  },
];

/* ----------------------------------------------------------- 工程优化清单 */

export const OPTIMIZATIONS = [
  { t: "固定比较组 ⟹ ECDF 可预计算",
    d: "参考对照组在整个 panel 上是同一组 18,400 个细胞。把它的逐基因中位秩 ECDF 预排序一次，之后每个基因的检验退化为 400 次 searchsorted，复杂度从每次重排 O((n₁+n₂)log(n₁+n₂)) 降到 O(n₁ log n₂)。",
    win: "41× 端到端加速的主因" },
  { t: "Wilcoxon 的充分统计量约化",
    d: "U_g = Σᵢ ψ_g(vᵢ)，与 scipy.mannwhitneyu 逐位相等（含点质量退化情形）。因此整个 DE 表是每基因两个标量的函数。",
    win: "把打分变成可解析优化的目标" },
  { t: "并列校正",
    d: "零计数产生巨量并列组，σ 需按 Σ(t³−t) 校正：104,477 vs 未校正 107,384，z 大 2.8%。这是最后 1–2 个基因差距的唯一来源。",
    win: "对称差 1–2 → 0" },
  { t: "BH 阶梯方向",
    d: "padj 是 min_{j≥i}(m/j · p₍ⱼ₎)，须用 minimum.accumulate 反向扫描。写成 maximum 会让所有 padj 趋近 1、发现数为 0 —— 一个不会报错的静默 bug。",
    win: "0 → 250 个发现" },
  { t: "Hamilton 最大余数法",
    d: "逐行取整并使行和恰为 10⁶，单基因偏差 <1 CPM。这保证 counts ≡ CPM，打分器的归一化成为恒等映射。",
    win: "消除归一化引入的误差" },
  { t: "ψ̄ 对非零比例单调 ⟹ 二分",
    d: "固定一阶矩下，把质量从“全部细胞等值”挪向“少数细胞高值 + 其余为零”，ψ̄ 严格单调下降。24 步二分即命中目标分位数。",
    win: "0.28 s / 扰动" },
  { t: "自举真实对照作 null 背景",
    d: "不需要拟合过散模型：直接抽真实对照细胞，ψ̄ 自动 ≈0.5，稀疏度与均值-方差关系天然正确。设计成本只花在预测会响应的基因上。",
    win: "假阳性 0，nnz 天然合规" },
  { t: "按扰动块流式写 h5ad",
    d: "整份提交 17.1 GB 装不进 16 GB 内存。每个 (扰动, context) 块是 400 × 5,998 ≈ 19 MB，追加写入可变长 CSR 数据集，常驻内存 <100 MB。",
    win: "16 GB 机器可交 17 GB 矩阵" },
  { t: "pseudobulk 降维",
    d: "pds/mse 只读 pseudobulk，DE 只读逐基因矩量 —— 训练素材也只需 per-perturbation pseudobulk，不需要原始细胞。",
    win: "61.3 GB → 731 MB" },
];

/* ---------------------------------------------------------------- 陷阱 */

export const TRAPS = [
  { t: "context 标签错位", d: "concat 顺序想错、或重新赋标签，所有指标退化到随机，看起来像“模型弱”。官方点名这是最贵的错误 —— 分数里没有任何信息告诉你标签串了。", who: "official" },
  { t: "BH 用了 maximum.accumulate", d: "发现数直接归零，不报错。我在本次工作中撞过。", who: "measured" },
  { t: "忘了并列校正", d: "每个扰动少判 1–2 个基因，jac 与 fid 系统性偏低，看起来像模型略差。", who: "measured" },
  { t: "CPM 未重归一", d: "目标 profile 的列均值之和必须等于 10⁶，否则行和约束无解（我第一次直接抛 ValueError）。", who: "measured" },
  { t: "本地打分缺 non-targeting 行", d: "cell_eval2.io.validate_pair 要求两侧扰动标签集完全相同（含对照标签），而正式提交必须去掉它们 —— 服务器端注入。", who: "measured" },
  { t: "交了 log-normalized 数据", d: "2026 起打分在 counts 空间，小数直接拒收。不要 normalize_total / log1p。", who: "official" },
  { t: "dense 存储", d: "6.67×10⁹ 条目 = cap 的 1.40×，无论内容如何都超限。必须 csr_matrix。", who: "official" },
  { t: "拿验证分比决赛分", d: "不同细胞系、不同 panel，pds 还是 panel 内排名。决赛分更低不代表模型变差。", who: "official" },
];

/* ------------------------------------------------------------- 路线图 */

export const ROADMAP = [
  { n: 1, t: "符号预测", why: "最高收益/成本比",
    d: "全场 fid raw = 0.514 = 掷硬币。把方向做对到 0.75 即为第一名（overall 0.228，1.20×）。素材：Replogle K562 全基因组 CRISPRi 中 300 个 target 的实测响应方向 —— 敲低响应的符号跨细胞系迁移性远高于幅度。",
    status: "next" },
  { n: 2, t: "|R_p| 的标量回归", why: "解锁 fid/jac 联合最优点",
    d: "令 R̂ = 全部 gate 基因，则 jac_p = |R_p|/9,929，回读 raw 值即得参考显著集的平均大小。一次线上提交换一个关键未知量。",
    status: "queued" },
  { n: 3, t: "收缩系数 λ", why: "解析可解",
    d: "nmae 关于 λ 凸且分段线性，3 次提交包围即可定出最优值。注意 λ 在验证轮与决赛轮之间的迁移性需要检验。",
    status: "queued" },
  { n: 4, t: "context 调制模型", why: "Stage 1 的主体",
    d: "把响应分解为跨系共享分量与 context 调制项：δ(g,c) ≈ δ_shared(g) ⊙ m(g, x_basal(c))。低秩回归 / 经验贝叶斯收缩 / 最优传输对齐，都是 10⁴×1.85×10⁴ 量级的经典线性代数，CPU 足够。",
    status: "queued" },
];

export const ARTIFACTS = [
  { f: "research/vcc_local.py", d: "ControlRef 类：ψ 表构建、de_table() 精确复刻、design() Stage-2 构造器。docstring 里记了完整验证结果。" },
  { f: "research/smoke.py", d: "干净进程冒烟测试，产出 250/250 那段输出。" },
  { f: "research/parity.py", d: "调 cell-eval2 preset vcc2026 跑官方六指标。" },
  { f: "research/dump_de.py", d: "导出官方 DE 表（29,787 行）供逐基因回归对比。" },
];

export const REV = "2026-08-27";
export const TOOLS = "vcc-cli 0.1.0 · cell-eval2 0.16.0 · numpy 2.5.2 · scipy 1.18.1 · anndata 0.13.3";
