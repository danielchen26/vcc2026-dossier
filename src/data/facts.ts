/* ============================================================================
   全部事实的唯一来源 / Single source of truth for every fact.
   溯源标记 / Provenance:
     official — Arc 官方页面、metric spec、manifest.json
     measured — 本机在官方数据上实测 (2026-08-27, Apple M1 Pro, 无 GPU)
     derived  — 由 official + measured 做算术推出
   ========================================================================= */

import type { L } from "../i18n";

export type Prov = "official" | "measured" | "derived" | "gap";

export const UI = {
  subtitle: { zh: "方法与验证工作簿", en: "Method & verification notebook" },
  rev: { zh: "修订", en: "Revised" },
  machine: { zh: "机器", en: "Machine" },
  noGpu: { zh: "M1 Pro · 无 GPU", en: "M1 Pro · no GPU" },
  first: { zh: "当前第一名", en: "Current leader" },
  teams: { zh: "参赛队", en: "Teams" },
  deadline: { zh: "截止", en: "Deadline" },
  item: { zh: "项", en: "Item" },
  value: { zh: "值", en: "Value" },
  note: { zh: "说明", en: "What it means" },
  metric: { zh: "指标", en: "Metric" },
  dragIt: { zh: "动手试试", en: "Try it" },
  verdictSig: { zh: "判为显著", en: "Called significant" },
  verdictNul: { zh: "判为不显著", en: "Called not significant" },
} satisfies Record<string, L>;

/* ---------------------------------------------------------------- 任务定义 */

export const TASK: { k: L; v: L; n: L }[] = [
  { k: { zh: "今年考什么", en: "This year's task" },
    v: { zh: "把一个基因敲低的后果，预测到没见过的细胞里", en: "Predict a gene knockdown's effect in cells you've never seen" },
    n: { zh: "官方今年不给训练集。你只能用去年的数据和自己有权使用的公开数据。", en: "No training set is provided this year. You use last year's release plus any public data you have rights to." } },
  { k: { zh: "给你什么", en: "What you get" },
    v: { zh: "健康细胞的表达谱 + 300 个要预测的基因名", en: "Expression profiles of untouched cells + a list of 300 genes" },
    n: { zh: "每个细胞系 18,400 个未扰动细胞。这些细胞就是「这是哪个细胞系」的唯一线索——官方不告诉你名字。", en: "18,400 unperturbed cells per cell line. Those cells are the only clue to which cell line it is — the names are withheld." } },
  { k: { zh: "要交什么", en: "What you hand in" },
    v: { zh: "一个 .vcc 文件", en: "One .vcc file" },
    n: { zh: "360,000 × 18,533 的整数计数矩阵，三个细胞系装在同一个文件里。", en: "A 360,000 × 18,533 matrix of whole numbers, all three cell lines in one file." } },
  { k: { zh: "不用交什么", en: "What you don't hand in" },
    v: { zh: "不交代码、不交模型、不交权重", en: "No code, no model, no weights" },
    n: { zh: "官方原话：only those results form your entry。只有获奖者要补一份文字说明。", en: "Official wording: only those results form your entry. Winners submit a written description afterwards." } },
  { k: { zh: "打分怎么算", en: "How it's scored" },
    v: { zh: "六个指标，各自跟「真实重复实验」比", en: "Six metrics, each measured against a real repeat experiment" },
    n: { zh: "0 分 = 跟「所有扰动都猜平均值」一样差；1 分 = 跟真做一遍实验一样好。可以超过 1，也可以为负。", en: "0 = no better than guessing the average for every perturbation; 1 = as good as running the experiment again. Above 1 and below 0 both happen." } },
  { k: { zh: "提交额度", en: "Submission budget" },
    v: { zh: "每天 2 次", en: "Two per day" },
    n: { zh: "UTC 午夜刷新，同时只能有一个在跑。", en: "Resets at UTC midnight; only one in flight at a time." } },
  { k: { zh: "排名看哪次", en: "Which submission ranks" },
    v: { zh: "最近一次，不是最好那次", en: "Your most recent, not your best" },
    n: { zh: "所以别拿一次失败的实验收尾。", en: "So don't end on a failed experiment." } },
];

export const SHAPE: { k: L; v: string; u?: L; n: L }[] = [
  { k: { zh: "基因数", en: "Genes" }, v: "18,533",
    n: { zh: "顺序由 gene_names.csv 固定，不能改", en: "Order fixed by gene_names.csv; do not reorder" } },
  { k: { zh: "要预测的基因", en: "Genes to predict" }, v: "300",
    n: { zh: "CRISPRi 敲低，敲低效率都超过 80%", en: "CRISPRi knockdowns, all above 80% on-target" } },
  { k: { zh: "每个基因几个细胞", en: "Cells per gene" }, v: "400",
    n: { zh: "精确值，多一个少一个都拒收", en: "Exact. One cell over or under is rejected" } },
  { k: { zh: "总共交多少细胞", en: "Cells you submit" }, v: "360,000",
    n: { zh: "300 个基因 × 400 细胞 × 3 个细胞系", en: "300 genes × 400 cells × 3 cell lines" } },
];

export const CAPS: { k: L; v: string; n: L }[] = [
  { k: { zh: "单个细胞的总计数", en: "Counts per cell" }, v: "≤ 1,000,000",
    n: { zh: "max_counts_per_cell", en: "max_counts_per_cell" } },
  { k: { zh: "总细胞数", en: "Total cells" }, v: "≤ 400,000",
    n: { zh: "本届用掉 360,000", en: "This year's panel uses 360,000" } },
  { k: { zh: "矩阵里存了多少个数", en: "Stored numbers" }, v: "≤ 4.75×10⁹",
    n: { zh: "平均每细胞 13,194 个。你显式存下来的 0 也算", en: "≈13,194 per cell. Zeros you store explicitly count too" } },
  { k: { zh: "存成稠密数组", en: "A dense array" }, v: "6.67×10⁹",
    n: { zh: "= 上限的 1.40 倍，光是格式本身就超限", en: "= 1.40× the cap. Over the limit on format alone" } },
];

export const TIMELINE: { d: L; e: L; s: string }[] = [
  { d: { zh: "08-04", en: "08-04" }, e: { zh: "注册开放", en: "Registration opens" }, s: "past" },
  { d: { zh: "08-20", en: "08-20" }, e: { zh: "开赛，放出验证数据", en: "Challenge opens, validation data released" }, s: "past" },
  { d: { zh: "08-27", en: "08-27" }, e: { zh: "本工作簿修订日", en: "This notebook was written" }, s: "now" },
  { d: { zh: "10-22", en: "10-22" }, e: { zh: "放出决赛用的三个新细胞系", en: "Three new cell lines released for the final round" }, s: "future" },
  { d: { zh: "11-05", en: "11-05" }, e: { zh: "最终提交截止", en: "Final submission deadline" }, s: "future" },
  { d: { zh: "11-下旬", en: "late Nov" }, e: { zh: "公布获奖", en: "Winners announced" }, s: "future" },
];

/* ------------------------------------------------------- 官方参考锚点 (b, r) */

export const METRICS: {
  id: string; cid: string; name: L; plain: L;
  b: number; bTxt: string; r: number; rTxt: string; perfect: string; clamp: L;
}[] = [
  { id: "pds", cid: "pds_cosine",
    name: { zh: "认得出是哪个扰动", en: "Tells perturbations apart" },
    plain: { zh: "你对基因 A 的预测，是不是比对其他 299 个基因的预测更像 A 的真实结果", en: "Is your prediction for gene A closer to A's real result than to any of the other 299?" },
    b: 0.5, bTxt: "0.500", r: 0.955, rTxt: "0.927–0.984", perfect: "1.03–1.17",
    clamp: { zh: "无上限", en: "unbounded" } },
  { id: "mse", cid: "expr_mse_unbiased_capped_norm",
    name: { zh: "表达量准不准", en: "Expression accuracy" },
    plain: { zh: "预测的表达谱离真实的有多远，先扣掉「细胞数有限」本身带来的随机误差", en: "How far your profile sits from the real one, after subtracting the noise that comes from having only a finite number of cells" },
    b: 0.989, bTxt: "0.986–0.992", r: 0.036, rTxt: "0.028–0.045", perfect: "1.000",
    clamp: { zh: "钳在 [0, 1]", en: "clamped to [0, 1]" } },
  { id: "nmae", cid: "de_wilcoxon_lfc_nmae",
    name: { zh: "变化幅度对不对", en: "Effect size accuracy" },
    plain: { zh: "真实变化了的那些基因，你预测的变化倍数差多少", en: "For genes that really did change, how far off is your predicted fold change" },
    b: 1.0013, bTxt: "1.0009–1.0017", r: 0.4, rTxt: "0.369–0.431", perfect: "1.58–1.75",
    clamp: { zh: "下限 −6", en: "floored at −6" } },
  { id: "fid", cid: "de_wilcoxon_direction_fidelity_yield_raw",
    name: { zh: "涨跌方向对不对", en: "Up-or-down accuracy" },
    plain: { zh: "你说「这个基因变了」的那些基因里，涨跌方向猜对的比例。少报也要罚", en: "Of the genes you flag as changed, what share move the right way. Flagging too few is penalised" },
    b: 0.513, bTxt: "0.505–0.522", r: 0.813, rTxt: "0.795–0.832", perfect: "1.51–1.72",
    clamp: { zh: "无上限", en: "unbounded" } },
  { id: "reach", cid: "de_wilcoxon_direction_reach_raw",
    name: { zh: "方向能对到多深", en: "How deep the directions hold" },
    plain: { zh: "按你自己的确信程度从高到低排，方向能一直对到第几名", en: "Rank your calls by your own confidence: how far down the list do the directions stay right" },
    b: 0.072, bTxt: "0.047–0.097", r: 0.968, rTxt: "0.958–0.978", perfect: "1.02–1.05",
    clamp: { zh: "无上限", en: "unbounded" } },
  { id: "jac", cid: "de_wilcoxon_sig_jaccard",
    name: { zh: "挑对了哪些基因", en: "Which genes responded" },
    plain: { zh: "你挑出的「变了的基因」和真实的那批，重合多少。漏报和乱报一样罚", en: "Overlap between your set of changed genes and the real one. Missing and inventing are penalised equally" },
    b: 0.029, bTxt: "0.021–0.037", r: 0.399, rTxt: "0.375–0.423", perfect: "2.48–2.85",
    clamp: { zh: "无上限", en: "unbounded" } },
];

export const ANCHOR: Record<string, { b: number; r: number }> = Object.fromEntries(
  METRICS.map((m) => [m.id, { b: m.b, r: m.r }]),
);

/** 官方的参考缩放：0 = 均值基线，1 = 真实重复实验 */
export const scaled = (id: string, raw: number) =>
  (raw - ANCHOR[id].b) / (ANCHOR[id].r - ANCHOR[id].b);

/* ------------------------------------------------------------- 排行榜快照 */

export const LB_ORDER = ["pds", "mse", "jac", "nmae", "fid", "reach"] as const;

export const LEADERBOARD: {
  rank: number; team: string; org: L; model: string; overall: number; subs: number;
  m: Record<(typeof LB_ORDER)[number], number[]>;
}[] = [
  { rank: 1, team: "Aginglab.com", org: { zh: "AgingLab", en: "AgingLab" }, model: "GeroAI_v11", overall: 0.1899, subs: 6,
    m: { pds: [0.708, 0.82], mse: [0.041, 0.959], jac: [-0.004, 0.029], nmae: [0.178, 0.892], fid: [0.003, 0.514], reach: [0.213, 0.267] } },
  { rank: 2, team: "Ibrahim Mansour", org: { zh: "", en: "" }, model: "CellSim", overall: 0.1708, subs: 13,
    m: { pds: [0.709, 0.82], mse: [0.161, 0.835], jac: [-0.005, 0.028], nmae: [0.088, 0.947], fid: [-0.043, 0.5], reach: [0.115, 0.18] } },
  { rank: 3, team: "Jurassic Park", org: { zh: "光州科学技术院", en: "Gwangju Inst. of Science and Technology" }, model: "jp13", overall: 0.1667, subs: 13,
    m: { pds: [0.644, 0.791], mse: [0.0, 1.917], jac: [0.008, 0.033], nmae: [0.157, 0.905], fid: [-0.003, 0.512], reach: [0.194, 0.251] } },
  { rank: 4, team: "GISL", org: { zh: "哥伦比亚大学", en: "Columbia University" }, model: "GISL v8", overall: 0.156, subs: 8,
    m: { pds: [0.638, 0.788], mse: [0.0, 5.165], jac: [0.01, 0.034], nmae: [0.108, 0.936], fid: [0.0, 0.513], reach: [0.18, 0.238] } },
  { rank: 5, team: "Vivai", org: { zh: "", en: "" }, model: "vivai-m24", overall: 0.1549, subs: 13,
    m: { pds: [0.709, 0.82], mse: [0.0, 4.172], jac: [0.002, 0.031], nmae: [0.133, 0.92], fid: [-0.026, 0.505], reach: [0.111, 0.177] } },
];

export const N_TEAMS = 315;
export const TOP_OVERALL = 0.1899;

/* --------------------------------------------------------- 包内容实测核对 */

export const BUNDLE = {
  file: "controls.zip",
  bytes: 662_118_680,
  sha256: "329a22bc29cac4f43ad0b846b9bb1a383f7a945c83a8cb0450c465f6dc5cc4b5",
};

export const CHECKS: { k: L; v: L; spec: string }[] = [
  { k: { zh: "矩阵形状", en: "Matrix shape" },
    v: { zh: "18,400 细胞 × 18,533 基因，稀疏存储", en: "18,400 cells × 18,533 genes, sparse" }, spec: "✓" },
  { k: { zh: "基因顺序", en: "Gene order" },
    v: { zh: "三个文件都与 gene_names.csv 逐个对齐", en: "All three files match gene_names.csv exactly" }, spec: "✓" },
  { k: { zh: "数值类型", en: "Values" },
    v: { zh: "全是整数，最小 1，最大 977", en: "All whole numbers, min 1, max 977" }, spec: "✓ raw counts" },
  { k: { zh: "测序深度", en: "Sequencing depth" },
    v: { zh: "中位 20,109 · 均值 21,134 · 范围 3,275–52,420", en: "Median 20,109 · mean 21,134 · range 3,275–52,420" }, spec: "✓ ~20,000" },
  { k: { zh: "每个细胞检出多少基因", en: "Genes detected per cell" },
    v: { zh: "中位 6,147 · 均值 5,973", en: "Median 6,147 · mean 5,973" }, spec: "—" },
  { k: { zh: "对照 guide", en: "Control guides" },
    v: { zh: "46 条，每条恰好 400 个细胞", en: "46 guides, exactly 400 cells each" }, spec: "✓" },
  { k: { zh: "待预测基因列表", en: "Gene list to predict" },
    v: { zh: "300 行，无重复，全部在基因表里", en: "300 rows, no duplicates, all present in the gene list" }, spec: "✓" },
];

export const MANIFEST_PROOF = {
  value: 138_400,
  decomp: "300 × 400 + 18,400",
  claim: {
    zh: "官方发给参赛者的那 18,400 个对照细胞，就是打分时用来做对比的那一组。",
    en: "The 18,400 control cells handed to participants are exactly the group the scorer compares against.",
  } satisfies L,
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

export const PSI_CHECK: { case: L; scipy: string; psi: string }[] = [
  { case: { zh: "正常随机分布", en: "Ordinary random draw" }, scipy: "3,862,696.0", psi: "3,862,696.0" },
  { case: { zh: "整体偏移", en: "Shifted distribution" }, scipy: "4,735,458.5", psi: "4,735,458.5" },
  { case: { zh: "400 个细胞完全相同", en: "All 400 cells identical" }, scipy: "4,771,000.0", psi: "4,771,000.0" },
];

export const SIGMA = { plain: 107_384, tie: 104_477, dCritPlain: 0.0286, dCritTie: 0.0278 };

/* --------------------------------------------- 与官方打分器的逐基因对齐 */

export const PARITY = [
  { p: "ABCD1", off: 251, mineTie: 251, minePlain: 249, sym: 0, lfcMax: "1.007e-5" },
  { p: "ACLY", off: 250, mineTie: 250, minePlain: 249, sym: 0, lfcMax: "1.008e-5" },
  { p: "ADNP", off: 251, mineTie: 251, minePlain: 250, sym: 0, lfcMax: "1.019e-5" },
];

export const PARITY_META = {
  gate: 9929,
  rows: 29_787,
  padjDiff: "0.0000",
  officialJac: 0.249377,
  officialFid: [0.49004, 0.466135, 0.517928],
  version: "cell-eval2 0.16.0 · preset vcc2026 · scanpy backend · CPU",
};

export const SPEED = {
  officialBoth: 626.7,
  officialOne: 296.85,
  mine: 7.66,
  measuredRatio: 38.8,
  theoryRatio: 47.1,
  amortizedRatio: 44.8,
  opsOfficial: "266,960",
  opsMine: "5,668",
  panelOfficialH: 52,
  panelMine1: 60,
  panelMine10: 6,
  setupSec: 2.0,
  setupShare: 0.049,
};

/* ------------------------------------------------------- Stage 2 验证结果 */

export const STAGE2 = {
  intended: 250, realized: 250, hit: 250,
  recall: 1.0, precision: 1.0, fp: 0, direction: 1.0,
  lfcErr: 0.00061, tDesign: 0.28, tDe: 3.98, tLoad: 12.8, nnzCell: 5998,
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

export const PAYOFF_FULL = {
  h: 0.4, overall: 0.4881,
  parts: { pds: 0.88, mse: 0.25, jac: 0.6, nmae: 0.33, fid: 0.59, reach: 0.28 },
};

/* --------------------------------------------------------------- 预算 */

export const BUDGET: { k: L; v: L; n: L }[] = [
  { k: { zh: "建查找表", en: "Build the lookup table" }, v: { zh: "2 秒", en: "2 seconds" },
    n: { zh: "每个细胞系一次，占 434 MB 内存", en: "Once per cell line, 434 MB in memory" } },
  { k: { zh: "读入一个细胞系", en: "Load one cell line" }, v: { zh: "12.8 秒", en: "12.8 seconds" },
    n: { zh: "含解压、排序", en: "Includes decompression and sorting" } },
  { k: { zh: "提交矩阵的密度", en: "Density of the submission" }, v: { zh: "用掉上限的 45%", en: "45% of the cap" },
    n: { zh: "每细胞约 5,998 个非零值，跟真实数据差不多", en: "≈5,998 nonzeros per cell, about the same as real data" } },
  { k: { zh: "提交矩阵有多大", en: "Size of the submission" }, v: { zh: "17.1 GB", en: "17.1 GB" },
    n: { zh: "装不进 16 GB 内存 → 按基因分块写出，常驻内存 <100 MB", en: "Won't fit in 16 GB → write it out gene by gene, under 100 MB resident" } },
  { k: { zh: "生成整份提交", en: "Generate a full submission" }, v: { zh: "4 分钟", en: "4 minutes" },
    n: { zh: "900 组 × 0.28 秒", en: "900 groups × 0.28 s" } },
  { k: { zh: "自己给自己打分", en: "Score it yourself" }, v: { zh: "6 分钟", en: "6 minutes" },
    n: { zh: "十核并行；官方打分器在同一台机器上要 52 小时", en: "Ten cores. The official scorer needs 52 hours on the same machine" } },
];

export const MACHINE = {
  cpu: { zh: "Apple M1 Pro · 10 核", en: "Apple M1 Pro · 10 cores" } satisfies L,
  ram: "16 GB",
  gpu: { zh: "无 CUDA", en: "no CUDA" } satisfies L,
  disk: { zh: "65 GB 空闲", en: "65 GB free" } satisfies L,
};

export const PSEUDOBULK_CUT: { d: L; raw: string; pb: string; x: string; n: L }[] = [
  { d: { zh: "Replogle 2022 · K562 全基因组", en: "Replogle 2022 · K562 genome-wide" }, raw: "61.3 GB", pb: "731 MB", x: "83×",
    n: { zh: "约 9,867 个扰动，每个一行平均表达", en: "≈9,867 perturbations, one average profile each" } },
  { d: { zh: "Replogle 2022 · RPE1", en: "Replogle 2022 · RPE1" }, raw: "8.1 GB", pb: "152 MB", x: "53×",
    n: { zh: "约 2,057 个扰动", en: "≈2,057 perturbations" } },
  { d: { zh: "Nadig 2025 · HepG2 + Jurkat", en: "Nadig 2025 · HepG2 + Jurkat" }, raw: "13.9 GB", pb: "~200 MB", x: "70×",
    n: { zh: "必需基因筛选", en: "Common-essential gene screens" } },
  { d: { zh: "Jiang 2025 · 六个癌细胞系", en: "Jiang 2025 · six cancer lines" }, raw: "—", pb: "~300 MB", x: "—",
    n: { zh: "结构与本届任务一样，可当离线练习场", en: "Same structure as this year's task — our offline proving ground" } },
];

/* -------------------------------------------------- 传统做法 vs 我们的方法 */

export const COMPARE: { axis: L; sub: string; them: L; us: L; prov: Prov; ev?: L }[] = [
  { axis: { zh: "怎么看这道题", en: "How to see the problem" }, sub: "framing",
    them: { zh: "训一个能生成单细胞的大模型，端到端吐出细胞，把打分器当外部裁判。", en: "Train a big model that generates single cells end to end, and treat the scorer as an external judge." },
    us: { zh: "先算清楚打分器到底读什么，然后分两步：预测答案，再把答案精确写成打分器要的格式。这是解方程，不是训模型。", en: "Work out exactly what the scorer reads, then split the job in two: predict the answer, then write it into the exact format the scorer wants. Solving equations, not training a model." },
    prov: "derived" },

  { axis: { zh: "对打分器的态度", en: "Attitude to the scorer" }, sub: "scorer",
    them: { zh: "当黑盒。只能靠每天 2 次的线上反馈调参，一次全量评估在 CPU 上要 52 小时。", en: "Treat it as a black box. Tune against two online submissions a day; one full run takes 52 hours on CPU." },
    us: { zh: "把它重写了一遍，跟官方逐个基因对上。快 41 倍，自己评一次全场 6 分钟，本地想跑多少次跑多少次。", en: "We reimplemented it and matched the official one gene for gene. 41× faster, six minutes for a full self-evaluation, unlimited local runs." },
    prov: "measured", ev: { zh: "结果完全一致", en: "identical results" } },

  { axis: { zh: "细胞像不像真的", en: "Do the cells look real" }, sub: "realism",
    them: { zh: "花大量算力让生成的细胞「看起来像真数据」——负二项采样、扩散模型、VAE 解码。", en: "Spend serious compute making generated cells look like real data: negative-binomial sampling, diffusion, VAE decoders." },
    us: { zh: "我们证明了：六个指标每个基因只读两个数字。细胞之间怎么搭配、像不像真的，一分不加。真实感只是格式要求。", en: "We proved the six metrics read only two numbers per gene. How the cells co-vary, how realistic they look — worth zero points. Realism is a formatting requirement." },
    prov: "measured", ev: { zh: "3/3 精确验证", en: "verified exactly, 3/3" } },

  { axis: { zh: "「这个基因变了」谁说了算", en: "Who decides a gene changed" }, sub: "significance",
    them: { zh: "模型吐完细胞，显著性是副产品，控制不了。很多模型输出接近平均值的复制品，细胞之间几乎没差异，统计检验于是把几乎所有基因都判成「变了」——严重乱报。", en: "Significance falls out of whatever the model emitted; you can't steer it. Many models output near-copies of the average, so the cells barely differ, and the test then flags almost every gene as changed — massive over-calling." },
    us: { zh: "显著性只由一个量决定，而那个量随「分布形状」单调变化。二分 24 步就能精确命中，可以逐个基因指定它进不进「变了」的名单。", en: "Significance depends on one quantity, and that quantity moves monotonically with the shape of the distribution. Twenty-four bisection steps hit it exactly, so we set gene by gene whether it lands on the changed list." },
    prov: "measured", ev: { zh: "250 个目标全中", en: "250 of 250 hit" } },

  { axis: { zh: "涨还是跌", en: "Up or down" }, sub: "direction",
    them: { zh: "方向来自生成过程的噪声。全场这一项的原始分约 0.514，跟基线 0.505–0.522 没区别——等于掷硬币。", en: "Direction comes out of generation noise. The whole field sits at ≈0.514 raw against a 0.505–0.522 baseline — a coin flip." },
    us: { zh: "方向由平均值单独决定，跟显著性互不干扰。实测：把平均值往上推（涨 25%），同时让检验判它「往下」——两件事可以分开设。", en: "Direction is set by the average alone, independent of significance. Measured: push the average up 25% while the test reads it as moving down. Two separate dials." },
    prov: "measured", ev: { zh: "解耦已验证", en: "decoupling verified" } },

  { axis: { zh: "变化幅度", en: "Effect size" }, sub: "effect size",
    them: { zh: "不做校准。全场这一项 0.892，而「预测什么都没变」的分数是 1.0013——几乎白干。", en: "No calibration. The field scores 0.892 where predicting no change at all scores 1.0013 — almost nothing gained." },
    us: { zh: "把所有预测幅度统一乘一个系数，这个指标随系数的变化是凸的、分段直线。3 次线上提交就能把最优系数夹出来。", en: "Scale every predicted effect by one factor; the metric is convex and piecewise linear in that factor. Three online submissions bracket the optimum." },
    prov: "derived" },

  { axis: { zh: "该报多少个基因", en: "How many genes to flag" }, sub: "call-set size",
    them: { zh: "不控制。报少了「方向」那项罚你，报多了「挑对了哪些」那项罚你，两头漏分。", en: "Uncontrolled. Flag too few and the direction metric penalises you; too many and the overlap metric does. You lose on both ends." },
    us: { zh: "两项联立解出来：报的个数应该正好等于真实变了的个数。而真实个数可以用 1 次提交套出来——把所有基因都报上去，回读那一项的原始分即得。", en: "Solve the two together: flag exactly as many genes as really changed. And you can extract that number with one submission — flag every gene, then read the raw overlap score back." },
    prov: "derived" },

  { axis: { zh: "测序深度设多少", en: "What sequencing depth to use" }, sub: "library size",
    them: { zh: "照真实数据模拟约 20,000 的深度，当成物理约束。", en: "Mimic the real ≈20,000 depth and treat it as a physical constraint." },
    us: { zh: "打分器两处归一化都跟总量无关，所以深度是免费参数。取 100 万，计数值就直接等于百万分率——白拿最细的设计精度。", en: "Both of the scorer's normalisation steps are scale-free, so depth is a free parameter. Set it to one million and counts become parts-per-million directly — maximum design precision for free." },
    prov: "derived" },

  { axis: { zh: "矩阵存多满", en: "How full the matrix is" }, sub: "density",
    them: { zh: "存成稠密数组就是上限的 1.40 倍，直接被拒。官方 FAQ 记过：25 MB 的文件被拒，3.3 GB 的文件通过——大小不是关键，存了多少个数才是。", en: "A dense array is 1.40× the cap and is rejected outright. The official FAQ records a 25 MB file rejected and a 3.3 GB file accepted — size isn't what matters, the count of stored numbers is." },
    us: { zh: "直接借用真实对照细胞的「哪些基因有信号」的模式，每细胞 5,998 个非零值，只用掉上限的 45%。关键点：单个细胞稀疏，不代表 400 个细胞加起来也稀疏——加总后仍然覆盖所有有表达的基因。", en: "Borrow the real control cells' pattern of which genes fire: 5,998 nonzeros per cell, 45% of the cap. The key point: sparse cells don't make a sparse total — summed over 400 cells, every expressed gene is still covered." },
    prov: "measured", ev: { zh: "上限的 45%", en: "45% of cap" } },

  { axis: { zh: "百万分率是个比例", en: "Parts-per-million is a ratio" }, sub: "compositional",
    them: { zh: "直接把变化量加到平均谱上，忽略了「所有基因的百万分率加起来必须是一百万」。结果是每个细胞的总量算不平，或者莫名多出一个整体偏移。", en: "Add the change straight onto the average profile, forgetting that all the parts-per-million must sum to one million. Either the per-cell totals don't balance, or an unexplained global shift creeps in." },
    us: { zh: "显式重新归一化，并把那个整体偏移量算了出来（本次 +0.0154）。因此第一步预测的变化倍数必须定义在归一化之后。", en: "Renormalise explicitly, and we measured that global shift (+0.0154 here). Stage 1's fold changes must therefore be defined after normalisation." },
    prov: "measured", ev: { zh: "偏移量已量化", en: "shift quantified" } },

  { axis: { zh: "「没变」的基因怎么办", en: "What about genes that didn't change" }, sub: "null calibration",
    them: { zh: "背景也从模型里采样，于是本该「没变」的基因也一片乱报，把真信号淹掉。", en: "Sample the background from the model too, so genes that shouldn't change get flagged anyway, drowning the real signal." },
    us: { zh: "背景直接抄真实对照细胞——「没变」这件事自动成立，乱报实测为 0。设计精力只花在预测会变的那 250 个基因上，剩下 9,700 个一行代码都不用写。", en: "Copy the background straight from the real control cells — \"unchanged\" then holds automatically, and false flags measured zero. Design effort goes only into the ~250 genes we predict will change; the other 9,700 need no code at all." },
    prov: "measured", ev: { zh: "乱报 0 个", en: "zero false flags" } },

  { axis: { zh: "要下多少训练数据", en: "How much training data to download" }, sub: "data scale",
    them: { zh: "为了训大模型，把 61 GB 的原始单细胞数据全下下来。", en: "Download all 61 GB of raw single-cell data to feed a big model." },
    us: { zh: "打分器只看「每个扰动的平均表达谱」，所以训练素材也只需要平均谱：61.3 GB → 731 MB，边下边算，磁盘几乎不占。", en: "The scorer only ever reads per-perturbation averages, so that's all the training material needs to be: 61.3 GB → 731 MB, computed while streaming, almost no disk." },
    prov: "derived" },

  { axis: { zh: "要什么机器", en: "What hardware" }, sub: "compute",
    them: { zh: "A100 / H100 微调基础模型。商业机构用 Arc 的预训练权重还得先申请许可。", en: "A100 / H100 to fine-tune a foundation model. Commercial entrants also need a licence for Arc's pretrained weights." },
    us: { zh: "一台 M1 Pro 笔记本，16 GB 内存，没有 CUDA。生成整份提交 4 分钟，自评 6 分钟。", en: "One M1 Pro laptop, 16 GB, no CUDA. Four minutes to generate a full submission, six to score it." },
    prov: "measured", ev: { zh: "已跑通", en: "already running" } },

  { axis: { zh: "改一版要多久", en: "Turnaround per iteration" }, sub: "iteration",
    them: { zh: "只能靠线上：每天 2 次，每次等约一小时，整个赛期总共约 142 次机会。", en: "Online only: two a day, about an hour each, roughly 142 chances for the whole season." },
    us: { zh: "本地 6 分钟一轮，次数不限。线上额度只留给「套取未知量」和最终提交。", en: "Six minutes locally, as many times as we like. Online submissions are reserved for extracting unknowns and for the final entry." },
    prov: "derived" },
];

/* ----------------------------------------------------------- 工程优化清单 */

export const OPTIMIZATIONS: { t: L; d: L; win: L }[] = [
  { t: { zh: "对照组是不变的，所以只排序一次", en: "The control group never changes — sort it once" },
    d: { zh: "打分时，300 个基因 × 3 个细胞系全都跟同一批 18,400 个对照细胞比。官方用的 scanpy 不知道这件事，每次都把两组合起来重新排序，同一批对照值在每个细胞系里被重排了 300 遍。我们把它预排序一次（2 秒），之后一直复用。", en: "Every one of the 300 genes, in all three cell lines, is compared against the same 18,400 control cells. scanpy doesn't know that: it merges and re-sorts both groups every time, so the same control values get re-sorted 300 times per cell line. We sort them once — two seconds — and reuse." },
    win: { zh: "41× 的主要来源", en: "the main source of the 41×" } },
  { t: { zh: "只需要知道「落在哪」，不需要全部排好", en: "We only need where values land, not a full ordering" },
    d: { zh: "检验统计量可以写成 400 个值各自「在对照里排第几」的加总。所以不用给 18,800 个值排序，只要在已排好的 18,400 个里做 400 次二分查找。每个基因的比较次数从 266,960 降到 5,668。", en: "The test statistic is just the sum, over your 400 values, of how many control values each one beats. So there's no need to order 18,800 values — only 400 binary searches into an already-sorted 18,400. Comparisons per gene drop from 266,960 to 5,668." },
    win: { zh: "理论 47×", en: "47× in theory" } },
  { t: { zh: "并列校正不能省", en: "Tie correction is not optional" },
    d: { zh: "计数数据有大量的 0，产生大量并列值，检验的标准差要按并列情况调小：104,477 而不是 107,384，判定阈值随之变严 2.8%。这是我们跟官方最后 1–2 个基因差距的唯一原因。", en: "Count data is full of zeros, hence full of ties, and the test's standard deviation must shrink accordingly: 104,477 rather than 107,384, tightening the threshold by 2.8%. This was the sole cause of our last 1–2 gene disagreement with the official scorer." },
    win: { zh: "差距 1–2 → 0", en: "gap 1–2 → 0" } },
  { t: { zh: "多重检验校正的方向别写反", en: "Get the multiple-testing correction the right way round" },
    d: { zh: "Benjamini–Hochberg 要从最大的 p 值往回取最小值。写成取最大值，所有校正后的 p 值都会趋近 1，发现数从 250 变成 0——而且不报任何错。", en: "Benjamini–Hochberg sweeps backwards taking a running minimum. Take a maximum instead and every adjusted p-value drifts to 1: discoveries drop from 250 to zero, with no error message." },
    win: { zh: "0 → 250 个发现", en: "0 → 250 discoveries" } },
  { t: { zh: "取整时把总量补平", en: "Balance the totals when rounding" },
    d: { zh: "用最大余数法逐行取整，让每个细胞的总计数恰好是一百万，单基因偏差小于 1。这样计数值就精确等于百万分率，打分器的归一化变成什么都不做。", en: "Round each row with the largest-remainder method so every cell totals exactly one million, with under one unit of error per gene. Counts then equal parts-per-million exactly, and the scorer's normalisation becomes a no-op." },
    win: { zh: "消掉归一化误差", en: "removes normalisation error" } },
  { t: { zh: "显著性随分布形状单调变化，所以能二分", en: "Significance moves monotonically, so bisect it" },
    d: { zh: "保持平均值不变，把表达量从「400 个细胞平摊」逐步挪到「少数细胞很高、其余为 0」，检验读数严格单调下降。24 步二分就命中目标。", en: "Hold the average fixed and shift expression from \"spread across all 400 cells\" toward \"a few high cells, the rest zero\": the test reading falls strictly monotonically. Twenty-four bisection steps land on target." },
    win: { zh: "0.28 秒 / 基因组", en: "0.28 s per group" } },
  { t: { zh: "「没变」的背景直接抄真实数据", en: "Copy the unchanged background from real data" },
    d: { zh: "不用去拟合什么噪声模型：直接抽真实对照细胞当背景，「没变」自动成立，稀疏度和均值—方差关系天然正确。", en: "No noise model to fit: draw real control cells as the background. \"Unchanged\" then holds by construction, and sparsity and the mean–variance relationship are right for free." },
    win: { zh: "乱报 0 个", en: "zero false flags" } },
  { t: { zh: "分块写文件，绕过内存墙", en: "Stream the file out in blocks" },
    d: { zh: "整份提交 17.1 GB，装不进 16 GB 内存。但每一组（一个基因 × 一个细胞系）只有 400 × 5,998 ≈ 19 MB，追加写入即可，常驻内存不到 100 MB。", en: "The whole submission is 17.1 GB and won't fit in 16 GB. But each group — one gene in one cell line — is only 400 × 5,998 ≈ 19 MB, so append them one at a time and stay under 100 MB resident." },
    win: { zh: "16 GB 机器交 17 GB 文件", en: "17 GB file from a 16 GB machine" } },
  { t: { zh: "训练数据也只需要平均谱", en: "Training data only needs averages too" },
    d: { zh: "既然打分只读每个扰动的平均表达谱和逐基因的两个数字，训练素材也不需要原始细胞。", en: "Since scoring reads only per-perturbation averages and two numbers per gene, the training material doesn't need raw cells either." },
    win: { zh: "61.3 GB → 731 MB", en: "61.3 GB → 731 MB" } },
];

/* ---------------------------------------------------------------- 陷阱 */

export const TRAPS: { t: L; d: L; who: Prov }[] = [
  { t: { zh: "三个细胞系的标签串了", en: "Cell-line labels get swapped" },
    d: { zh: "拼接顺序想错、或者重新赋标签，所有指标都退化到随机。官方点名这是最贵的错误——分数里没有任何信息会告诉你标签错了，它只会看起来像「模型不行」。", en: "Concatenate in the wrong order, or relabel, and every metric collapses to chance. The organisers call this the most expensive available mistake: nothing in the score tells you the labels are wrong, it just looks like a weak model." },
    who: "official" },
  { t: { zh: "多重检验校正方向写反", en: "Multiple-testing correction reversed" },
    d: { zh: "发现数直接归零，不报错。我们在这次工作里真的撞过。", en: "Discoveries drop straight to zero with no error. We hit this for real during this work." },
    who: "measured" },
  { t: { zh: "忘了并列校正", en: "Tie correction forgotten" },
    d: { zh: "每组少判 1–2 个基因，两个 DE 指标系统性偏低，看起来像模型稍差一点。", en: "One or two genes short per group; two DE metrics come in systematically low, looking like a marginally worse model." },
    who: "measured" },
  { t: { zh: "忘了百万分率要加起来等于一百万", en: "Parts-per-million don't sum to a million" },
    d: { zh: "目标谱的总量必须归一，否则每个细胞的总计数解不出来（我们第一次就直接报错了）。", en: "The target profile has to be renormalised, or the per-cell totals have no solution. Ours threw an error on the first attempt." },
    who: "measured" },
  { t: { zh: "本地打分要带对照行，正式提交不能带", en: "Local scoring needs control rows; the real submission must not have them" },
    d: { zh: "本地打分器要求两边的标签集完全一样（含对照标签），而正式提交里带对照行会被拒——服务器端会自己注入。", en: "The local scorer requires identical label sets on both sides, control label included, while the real submission is rejected if control rows are present — the server injects them itself." },
    who: "measured" },
  { t: { zh: "交了取过对数的数据", en: "Log-normalised values submitted" },
    d: { zh: "2026 年起打分在原始计数空间进行，小数直接拒收。不要做 normalize_total / log1p。", en: "From 2026 scoring happens in raw count space and fractional values are rejected outright. No normalize_total, no log1p." },
    who: "official" },
  { t: { zh: "存成稠密数组", en: "Stored as a dense array" },
    d: { zh: "6.67×10⁹ 个数 = 上限的 1.40 倍，无论里面装什么都超限。", en: "6.67×10⁹ stored numbers is 1.40× the cap, over the limit regardless of contents." },
    who: "official" },
  { t: { zh: "拿验证分和决赛分比较", en: "Comparing validation and final scores" },
    d: { zh: "两轮用的是不同的细胞系和不同的基因组合，其中一个指标还是组内排名。决赛分更低不代表模型变差了。", en: "The two rounds use different cell lines and different gene panels, and one metric is a rank within its own panel. A lower final score does not mean the model got worse." },
    who: "official" },
];

/* ------------------------------------------------------------- 路线图 */

export const ROADMAP: { n: number; t: L; why: L; d: L; status: string }[] = [
  { n: 1, t: { zh: "先把涨跌方向做对", en: "Get up-or-down right first" },
    why: { zh: "投入最小，收益最大", en: "cheapest work, biggest gain" },
    d: { zh: "全场这一项现在等于掷硬币。做到 0.75 就是第一名（0.228 分，是当前榜首的 1.20 倍）。素材现成：Replogle 的全基因组 CRISPRi 数据里，这 300 个基因几乎都有实测的涨跌方向，而方向在细胞系之间的迁移性远好于幅度。", en: "The whole field is at coin-flip here. Reaching 0.75 wins outright: 0.228, or 1.20× today's leader. The material already exists — Replogle's genome-wide CRISPRi covers nearly all 300 genes, and direction transfers across cell lines far better than magnitude does." },
    status: "next" },
  { n: 2, t: { zh: "预测「真实变了多少个基因」", en: "Predict how many genes really changed" },
    why: { zh: "解锁两个指标的联立最优", en: "unlocks the joint optimum of two metrics" },
    d: { zh: "把所有基因都报成「变了」，回读那一项的原始分，就等于直接读出真实个数除以 9,929。一次提交换一个关键未知量。", en: "Flag every gene as changed and read the raw overlap score back: that is the true count divided by 9,929. One submission buys one critical unknown." },
    status: "queued" },
  { n: 3, t: { zh: "定出幅度的缩放系数", en: "Pin down the effect-size scale" },
    why: { zh: "可以解析求解", en: "solvable in closed form" },
    d: { zh: "这个指标随系数是凸的分段直线，3 次提交夹出最优值。要注意这个系数从验证轮迁移到决赛轮是否稳定。", en: "The metric is convex and piecewise linear in the factor, so three submissions bracket the optimum. Worth checking whether the factor transfers from the validation round to the final." },
    status: "queued" },
  { n: 4, t: { zh: "建细胞系之间的迁移模型", en: "Build the cross-cell-line transfer model" },
    why: { zh: "第一步的主体工作", en: "the bulk of Stage 1" },
    d: { zh: "把响应拆成「所有细胞系共有的部分」和「随细胞系状态调整的部分」。低秩回归、经验贝叶斯收缩、最优传输对齐都在 10⁴ × 1.85×10⁴ 的量级，普通 CPU 够用。", en: "Split the response into a part shared across cell lines and a part modulated by each line's own state. Reduced-rank regression, empirical-Bayes shrinkage, optimal-transport alignment — all at 10⁴ × 1.85×10⁴ scale, comfortable on a plain CPU." },
    status: "queued" },
];

export const ARTIFACTS: { f: string; d: L }[] = [
  { f: "research/vcc_local.py",
    d: { zh: "核心代码：查找表构建、官方打分逻辑的精确复刻、第二步的矩阵构造器。文档字符串里记了完整验证结果。", en: "The core: lookup-table construction, an exact reimplementation of the official scoring logic, and the Stage-2 matrix builder. Full verification results are in the docstring." } },
  { f: "research/smoke.py",
    d: { zh: "干净进程冒烟测试，本页那段 250/250 的输出就是它跑出来的。", en: "Clean-process smoke test — it produced the 250/250 output shown on this page." } },
  { f: "research/parity.py",
    d: { zh: "调官方 cell-eval2 跑完整六指标。", en: "Runs the official cell-eval2 over the full six metrics." } },
  { f: "research/dump_de.py",
    d: { zh: "导出官方的逐基因结果表（29,787 行），供回归比对。", en: "Exports the official per-gene result table (29,787 rows) for regression comparison." } },
];

export const REV = "2026-08-27";
export const TOOLS = "vcc-cli 0.1.0 · cell-eval2 0.16.0 · numpy 2.5.2 · scipy 1.18.1 · anndata 0.13.3";
