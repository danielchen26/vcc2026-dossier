import { useLang } from "../i18n";

const W = 920;
const H = 412;

const C = { w: 7, h: 7, gap: 2.6, cols: 12, rows: 6 };
const GW = C.cols * (C.w + C.gap);
const GH = C.rows * (C.h + C.gap);

const IN_X = 26;
const WAIST_X = 292;
const WAIST_W = 252;
const MET_X = 584;
const MET_W = W - MET_X - 26;

const AX_Y = 366;
const ax = (v: number) => 96 + ((v + 0.05) / 1.3) * 754;

const grid = (oy: number, hot: (i: number, j: number) => boolean) => {
  const out: { x: number; y: number; on: boolean }[] = [];
  for (let j = 0; j < C.rows; j++) {
    for (let i = 0; i < C.cols; i++) {
      out.push({ x: IN_X + i * (C.w + C.gap), y: oy + j * (C.h + C.gap), on: hot(i, j) });
    }
  }
  return out;
};

const TXT = {
  zh: {
    sub: "你交的", subSub: "400 细胞 × 18,533 基因", subNote: "每个待预测基因一组",
    ctrl: "官方的对照", ctrlSub: "18,400 个未扰动细胞", ctrlNote: "整场比赛固定不变",
    waistCap: "只有这两个数通过",
    n1: "① 400 个细胞的平均值", n1s: "→ 涨还是跌 · 涨多少",
    n2: "② 它们在对照里的平均排名", n2s: "→ 算不算「变了」",
    metCap: "六个指标",
    met: ["认得出是哪个扰动", "表达量准不准", "挑对了哪些基因", "涨跌方向对不对", "方向能对到多深", "变化幅度对不对"],
    ruler: "六个指标各自放到同一把尺子上，再取平均",
    zero: "0 = 所有基因都猜平均值", one: "1 = 跟真做一遍实验一样好",
    leader: "全场第一名 0.19", above: "可以超过 1",
    caption: (
      <>
        这张图就是全部论点。左边是你花力气做出来的东西；中间那道<b>腰</b>是评分器真正读进去的东西。
        细胞之间怎么搭配、有没有真实的生物学纹理——<b>一个字节都不过腰</b>。
        而底下那把尺子上，0 分和 1 分都是从真实数据里量出来的，所以「0.19」的准确含义是：
        全场最好的模型，走到了「猜平均值」和「真做一遍实验」之间的五分之一处。
      </>
    ),
  },
  en: {
    sub: "What you submit", subSub: "400 cells × 18,533 genes", subNote: "one block per gene to predict",
    ctrl: "Their controls", ctrlSub: "18,400 unperturbed cells", ctrlNote: "fixed for the whole contest",
    waistCap: "only these two numbers get through",
    n1: "① the average of your 400 cells", n1s: "→ up or down · by how much",
    n2: "② their average rank in the controls", n2s: "→ whether it counts as changed",
    metCap: "six metrics",
    met: ["Tells perturbations apart", "Expression accuracy", "Which genes responded", "Up-or-down accuracy", "How deep directions hold", "Effect size accuracy"],
    ruler: "each metric goes on the same ruler, then they are averaged",
    zero: "0 = predict the average for every gene", one: "1 = as good as a real repeat experiment",
    leader: "field leader 0.19", above: "can exceed 1",
    caption: (
      <>
        This diagram is the entire argument. On the left is everything you work to produce. The <b>waist</b> in
        the middle is what the scorer actually reads. How the cells co-vary, whether they carry real biological
        texture — <b>not one byte of it gets through</b>. And on the ruler below, both 0 and 1 are measured from
        real data, so “0.19” means precisely this: the best model in the field has travelled one fifth of the
        way from “predict the average” to “run the experiment again”.
      </>
    ),
  },
};

export function Pipeline() {
  const lang = useLang();
  const c = TXT[lang];

  return (
    <figure className="chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={lang === "zh"
          ? "打分流程：你的提交与官方对照汇合，只有每个基因两个数字进入六个指标，再放到 0 到 1 的尺子上"
          : "Scoring flow: your submission meets their controls; only two numbers per gene reach the six metrics, which are then placed on a 0-to-1 ruler"}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff7a5c" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ff7a5c" stopOpacity="0.04" />
          </linearGradient>
          <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#6b7590" />
          </marker>
        </defs>

        {/* 左上：你的提交 */}
        <text x={IN_X} y={14} className="lb strong" fill="#ff7a5c">{c.sub}</text>
        <text x={IN_X} y={30} className="lb">{c.subSub}</text>
        {grid(42, (i, j) => (i * 5 + j * 3) % 7 < 3).map((r, k) => (
          <rect key={k} x={r.x} y={r.y} width={C.w} height={C.h} rx="1.5"
            fill="#ff7a5c" opacity={r.on ? 0.62 : 0.14} />
        ))}
        <text x={IN_X} y={42 + GH + 15} className="lb dim">{c.subNote}</text>

        {/* 左下：官方对照 */}
        <text x={IN_X} y={168} className="lb strong" fill="#4cc2ff">{c.ctrl}</text>
        <text x={IN_X} y={184} className="lb">{c.ctrlSub}</text>
        {grid(196, (i, j) => (i * 3 + j * 7) % 5 < 2).map((r, k) => (
          <rect key={k} x={r.x} y={r.y} width={C.w} height={C.h} rx="1.5"
            fill="#4cc2ff" opacity={r.on ? 0.62 : 0.14} />
        ))}
        <text x={IN_X} y={196 + GH + 15} className="lb dim">{c.ctrlNote}</text>

        {/* 汇合 */}
        <path d={`M ${IN_X + GW + 14} ${42 + GH / 2} C 200 ${42 + GH / 2}, 210 118, ${WAIST_X - 14} 118`}
          stroke="#6b7590" strokeWidth="1.2" fill="none" markerEnd="url(#arw)" />
        <path d={`M ${IN_X + GW + 14} ${196 + GH / 2} C 200 ${196 + GH / 2}, 210 172, ${WAIST_X - 14} 172`}
          stroke="#6b7590" strokeWidth="1.2" fill="none" markerEnd="url(#arw)" />

        {/* 腰 */}
        <text x={WAIST_X} y={84} className="lb" fill="#ff7a5c" letterSpacing="0.1em">{c.waistCap.toUpperCase()}</text>
        <rect x={WAIST_X} y={96} width={WAIST_W} height={102} rx="11" fill="url(#wg)" stroke="#ff7a5c" strokeOpacity="0.5" />
        <text x={WAIST_X + 16} y={120} className="lb strong">{c.n1}</text>
        <text x={WAIST_X + 16} y={135} className="lb dim">{c.n1s}</text>
        <line x1={WAIST_X + 16} y1={147} x2={WAIST_X + WAIST_W - 16} y2={147} stroke="#ffffff1a" />
        <text x={WAIST_X + 16} y={168} className="lb strong">{c.n2}</text>
        <text x={WAIST_X + 16} y={183} className="lb dim">{c.n2s}</text>

        {/* 右：六个指标 */}
        <text x={MET_X} y={84} className="lb" fill="#5fe3b0" letterSpacing="0.1em">{c.metCap.toUpperCase()}</text>
        <path d={`M ${WAIST_X + WAIST_W + 12} 147 L ${MET_X - 14} 147`}
          stroke="#6b7590" strokeWidth="1.2" fill="none" markerEnd="url(#arw)" />
        {c.met.map((m, i) => {
          const cool = i < 2;
          return (
            <g key={m}>
              <rect x={MET_X} y={96 + i * 25} width={MET_W} height={20} rx="5"
                fill={cool ? "#4cc2ff14" : "#5fe3b010"} stroke={cool ? "#4cc2ff33" : "#5fe3b028"} />
              <text x={MET_X + 11} y={110 + i * 25} className="lb strong" fontSize="10.5">{m}</text>
            </g>
          );
        })}

        {/* 分隔 */}
        <line x1={IN_X} y1={300} x2={W - 26} y2={300} stroke="#ffffff12" />

        {/* 尺子 */}
        <text x={IN_X} y={326} className="lb" letterSpacing="0.1em">{c.ruler.toUpperCase()}</text>
        <line x1={ax(-0.05)} y1={AX_Y} x2={ax(1.25)} y2={AX_Y} stroke="#ffffff20" strokeWidth="1" />
        <line x1={ax(1)} y1={AX_Y} x2={ax(1.25)} y2={AX_Y} stroke="#5fe3b0" strokeWidth="1" strokeDasharray="2 4" />
        <line x1={ax(0)} y1={AX_Y} x2={ax(1)} y2={AX_Y} stroke="#ffffff3a" strokeWidth="1.5" />

        <line x1={ax(0)} y1={AX_Y - 9} x2={ax(0)} y2={AX_Y + 9} stroke="#4cc2ff" strokeWidth="2" />
        <text x={ax(0)} y={AX_Y + 26} className="lb" fill="#4cc2ff">{c.zero}</text>
        <line x1={ax(1)} y1={AX_Y - 9} x2={ax(1)} y2={AX_Y + 9} stroke="#5fe3b0" strokeWidth="2" />
        <text x={ax(1)} y={AX_Y + 26} textAnchor="end" className="lb" fill="#5fe3b0">{c.one}</text>
        <text x={ax(1.06)} y={AX_Y - 12} className="lb dim">{c.above}</text>

        <circle cx={ax(0.19)} cy={AX_Y} r="5.5" fill="#ff7a5c" />
        <text x={ax(0.19)} y={AX_Y - 14} textAnchor="middle" className="lb strong" fill="#ff7a5c">{c.leader}</text>
      </svg>
      <figcaption>{c.caption}</figcaption>
    </figure>
  );
}
