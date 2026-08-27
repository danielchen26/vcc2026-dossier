import { useMemo, useState } from "react";
import psi from "../data/psi.json";
import { useLang } from "../i18n";

/* Numerical Recipes erfcc — 相对误差 < 1.2e-7，足以显示 p ~ 1e-29 */
const COF = [
  -1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
  -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
  4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
  1.30365583558e-6, 1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9,
  5.059343495e-9, -9.91364156e-10, -2.27365122e-10, 9.6467911e-11,
  2.394038e-12, -6.886027e-12, 8.94487e-13, 1.313945e-12, -3.60148e-13,
];

function erfc(x: number) {
  const z = Math.abs(x);
  const t = 2 / (2 + z);
  const ty = 4 * t - 2;
  let d = 0;
  let dd = 0;
  for (let j = COF.length - 1; j > 0; j--) {
    const tmp = d;
    d = ty * d - dd + COF[j];
    dd = tmp;
  }
  const ans = t * Math.exp(-z * z + 0.5 * (COF[0] + ty * d) - dd);
  return x >= 0 ? ans : 2 - ans;
}

const { nCtrl, nZero, meanCpm, nPred, sigmaTie, dCrit, ecdfQ, dial, gene, context } = psi;
const NNZ = nCtrl - nZero;
const F0 = (0.5 * nZero) / nCtrl;
const TARGET = meanCpm * 1.25;
const LFC = Math.log2(1.25);

function Fv(v: number) {
  if (v <= 0) return F0;
  let lo = 0;
  let hi = ecdfQ.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ecdfQ[mid] < v) lo = mid + 1;
    else hi = mid;
  }
  return (nZero + (NNZ * lo) / ecdfQ.length) / nCtrl;
}

function evaluate(t: number) {
  const k = Math.max(1, Math.round(nPred / (1 + t)));
  const s = (TARGET * nPred) / k;
  const psiBar = ((nPred - k) * F0 + k * Fv(s)) / nPred;
  const d = psiBar - 0.5;
  const U = psiBar * nPred * nCtrl;
  const z = (U - (nPred * nCtrl) / 2) / sigmaTie;
  return { k, s, d, z, p: erfc(Math.abs(z) / Math.SQRT2) };
}

const W = 660;
const H = 336;
const PAD = { l: 50, r: 92, t: 16, b: 38 };
const XMAX = 350;
const sx = (v: number) => PAD.l + Math.sqrt(Math.max(v, 0) / XMAX) * (W - PAD.l - PAD.r);
const sy = (f: number) => PAD.t + (1 - f) * (H - PAD.t - PAD.b);

const ECDF_PATH = (() => {
  const pts: string[] = [`M ${sx(0)} ${sy(0)}`, `L ${sx(0)} ${sy(F0 * 2)}`];
  for (let i = 0; i < ecdfQ.length; i += 8) {
    pts.push(`L ${sx(ecdfQ[i]).toFixed(1)} ${sy((nZero + (NNZ * i) / ecdfQ.length) / nCtrl).toFixed(1)}`);
  }
  pts.push(`L ${sx(ecdfQ[ecdfQ.length - 1]).toFixed(1)} ${sy(1)}`);
  return pts.join(" ");
})();

const STRIP_W = 660;
const STRIP_H = 96;
const LOGP_MIN = -32;
const tx = (t: number) => 50 + (t / 3) * (STRIP_W - 50 - 92);
const ty = (lp: number) => 12 + (Math.min(0, Math.max(LOGP_MIN, lp)) / LOGP_MIN) * (STRIP_H - 12 - 22);

const LIVE_STRIP = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * 3;
    pts.push(`${i === 0 ? "M" : "L"} ${tx(t).toFixed(1)} ${ty(Math.log10(Math.max(evaluate(t).p, 1e-40))).toFixed(1)}`);
  }
  return pts.join(" ");
})();

const TICKS = [0, 10, 40, 100, 200, 320];

const TXT = {
  zh: {
    nullBand: (d: string) => `没差别的范围 ±${d}`,
    ecdf: `真实对照细胞的分布 · ${nCtrl.toLocaleString()} 个`,
    pinned: (v: string) => `平均值锁在 ${v}`,
    zeros: (n: number) => `${n} 个细胞是 0`,
    high: (n: number, v: string) => `${n} 个细胞是 ${v}`,
    psiBar: "检验读到的位置",
    axisX: "表达量（百万分率，√ 刻度）",
    verdictSig: "判为「变了」",
    verdictNul: "判为「没变」",
    pinnedNote: (v: string, l: string) => (
      <>平均值一直是 <b>{v}</b>，也就是「涨 25%」（log₂ = <b>+{l}</b>）。滑块只改这 400 个细胞之间怎么分配，不改平均值。</>
    ),
    rows: [["形状参数 t", "t"], ["有信号的细胞", "k"], ["每个有信号的细胞", "s"], ["检验读到的偏移", "d"], ["标准化后的偏移", "z"]] as const,
    pLabel: "p 值（统计检验）",
    ctlLabel: "拖动改变分布形状",
    caption: (
      <>
        蓝线是浏览器<b>实时算</b>的，用的是真实对照细胞的分布（基因 {gene}，细胞系 {context}，2048 个分位点）。
        <span style={{ color: "var(--stamp)" }}>橄榄色的点</span>是我们在完整 18,400 个对照细胞上、
        带并列校正算出来的<b>精确值</b>。两者重合，说明这个网页里的算术跟官方打分器是一致的。
      </>
    ),
  },
  en: {
    nullBand: (d: string) => `no-difference band ±${d}`,
    ecdf: `distribution of the real control cells · ${nCtrl.toLocaleString()}`,
    pinned: (v: string) => `average locked at ${v}`,
    zeros: (n: number) => `${n} cells at 0`,
    high: (n: number, v: string) => `${n} cells at ${v}`,
    psiBar: "where the test reads",
    axisX: "expression (parts per million, √ scale)",
    verdictSig: "called “changed”",
    verdictNul: "called “unchanged”",
    pinnedNote: (v: string, l: string) => (
      <>The average stays at <b>{v}</b> throughout — a 25% increase (log₂ = <b>+{l}</b>). The slider only changes how that total is spread across the 400 cells.</>
    ),
    rows: [["shape parameter t", "t"], ["cells with signal", "k"], ["value in each", "s"], ["shift the test reads", "d"], ["standardised shift", "z"]] as const,
    pLabel: "p-value (statistical test)",
    ctlLabel: "drag to change the shape",
    caption: (
      <>
        The blue line is computed <b>live in your browser</b> from the real control cells (gene {gene},
        cell line {context}, 2048 quantiles). The <span style={{ color: "var(--stamp)" }}>olive dots</span> are
        the <b>exact values</b> we measured on all 18,400 control cells with tie correction. They coincide,
        which is what shows the arithmetic on this page matches the official scorer.
      </>
    ),
  },
};

export function PsiDial() {
  const lang = useLang();
  const c = TXT[lang];
  const [t, setT] = useState(1.05);
  const st = useMemo(() => evaluate(t), [t]);
  const sig = st.p < 0.05;
  const pTxt = st.p < 1e-4 ? st.p.toExponential(2) : st.p.toFixed(4);
  const vals = [t.toFixed(2), `${st.k} / ${nPred}`, `${st.s.toFixed(1)} ppm`,
    (st.d >= 0 ? "+" : "") + st.d.toFixed(4), (st.z >= 0 ? "+" : "") + st.z.toFixed(2)];

  return (
    <div className="dial">
      <div className="dial-top">
        <div className="dial-plot">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`t=${t.toFixed(2)}, p=${pTxt}`}>
            <rect x={PAD.l} y={sy(0.5 + dCrit)} width={W - PAD.l - PAD.r}
              height={sy(0.5 - dCrit) - sy(0.5 + dCrit)} fill="#6b7a3a" opacity="0.13" />
            <line x1={PAD.l} y1={sy(0.5)} x2={W - PAD.r} y2={sy(0.5)}
              stroke="#6b7a3a" strokeWidth="1" strokeDasharray="2 3" />
            <text x={PAD.l + 6} y={sy(0.5 - dCrit) + 12} className="lb" fill="#6b7a3a"
              stroke="#fbfcfa" strokeWidth="3.2" paintOrder="stroke">{c.nullBand(dCrit.toFixed(4))}</text>

            <line x1={PAD.l} y1={sy(0)} x2={W - PAD.r} y2={sy(0)} stroke="#c7cdc1" />
            <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={sy(0)} stroke="#c7cdc1" />
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <g key={f}>
                <line x1={PAD.l - 4} y1={sy(f)} x2={PAD.l} y2={sy(f)} stroke="#c7cdc1" />
                <text x={PAD.l - 8} y={sy(f) + 3.5} textAnchor="end" className="lb">{f.toFixed(2)}</text>
              </g>
            ))}
            {TICKS.map((v) => (
              <g key={v}>
                <line x1={sx(v)} y1={sy(0)} x2={sx(v)} y2={sy(0) + 4} stroke="#c7cdc1" />
                <text x={sx(v)} y={sy(0) + 16} textAnchor="middle" className="lb">{v}</text>
              </g>
            ))}
            <text x={W - PAD.r} y={sy(0) + 31} textAnchor="end" className="lb">{c.axisX}</text>

            <path d={ECDF_PATH} fill="none" stroke="#1b4f9c" strokeWidth="1.7" />
            <text x={sx(ecdfQ[Math.floor(ecdfQ.length * 0.72)]) + 4} y={sy(0.92)}
              className="lb" fill="#1b4f9c" stroke="#fbfcfa" strokeWidth="3.2" paintOrder="stroke">{c.ecdf}</text>

            <line x1={sx(TARGET)} y1={PAD.t} x2={sx(TARGET)} y2={sy(0)}
              stroke="#6b7a3a" strokeWidth="1.2" strokeDasharray="4 3" />
            <text x={sx(TARGET) + 5} y={PAD.t + 10} className="lb" fill="#6b7a3a"
              stroke="#fbfcfa" strokeWidth="3.2" paintOrder="stroke">{c.pinned(`${TARGET.toFixed(2)} ppm`)}</text>

            {[
              { v: 0, n: nPred - st.k, lab: c.zeros(nPred - st.k) },
              { v: st.s, n: st.k, lab: c.high(st.k, st.s.toFixed(1)) },
            ].map((bar) => {
              const top = sy((bar.n / nPred) * 0.94);
              // 标签始终在 psi 读数线上方至少 18px, 避免与它和 null 带标签重叠
              const yLab = Math.max(PAD.t + 10, Math.min(top - 6, sy(0.5 + st.d) - 18));
              return (
                <g key={bar.v}>
                  <rect x={sx(bar.v) - 5} y={top} width="10" height={sy(0) - top} fill="#b23a2b" opacity="0.82" />
                  <text x={sx(bar.v) + 9} y={yLab} className="lb" fill="#b23a2b"
                    stroke="#fbfcfa" strokeWidth="3.2" paintOrder="stroke">{bar.lab}</text>
                </g>
              );
            })}

            <line x1={PAD.l} y1={sy(0.5 + st.d)} x2={W - PAD.r} y2={sy(0.5 + st.d)} stroke="#b23a2b" strokeWidth="2" />
            <circle cx={W - PAD.r} cy={sy(0.5 + st.d)} r="3.5" fill="#b23a2b" />
            <text x={W - PAD.r + 6} y={sy(0.5 + st.d) - 5} textAnchor="end" className="lb" fill="#b23a2b"
              stroke="#fbfcfa" strokeWidth="3.2" paintOrder="stroke">{c.psiBar}</text>
            <text x={W - PAD.r + 6} y={sy(0.5 + st.d) + 9} className="lb" fill="#b23a2b"
              stroke="#fbfcfa" strokeWidth="3.2" paintOrder="stroke">{(0.5 + st.d).toFixed(4)}</text>
          </svg>
        </div>

        <div className="dial-read">
          <div className={sig ? "verdict sig" : "verdict nul"}>{sig ? c.verdictSig : c.verdictNul}</div>
          <div className="pinned">{c.pinnedNote(`${TARGET.toFixed(2)} ppm`, LFC.toFixed(4))}</div>
          {c.rows.map(([label, sym], i) => (
            <div className="rr" key={sym}>
              <span className="k">{label}</span>
              <span className="v">{vals[i]}</span>
            </div>
          ))}
          <div className="rr">
            <span className="k">{c.pLabel}</span>
            <span className="v" style={{ color: sig ? "var(--pos)" : "var(--neg)" }}>{pTxt}</span>
          </div>
        </div>
      </div>

      <div className="dial-ctl">
        <label htmlFor="tdial">{c.ctlLabel}</label>
        <input id="tdial" type="range" min={0} max={3} step={0.01} value={t}
          onChange={(e) => setT(Number(e.target.value))} />
        <span className="tval">{t.toFixed(2)}</span>
        <div className="presets">
          {[0, 0.6, 1.05, 1.3, 2.2, 3].map((v) => (
            <button key={v} type="button" onClick={() => setT(v)}>t={v}</button>
          ))}
        </div>
      </div>

      <div className="dial-ctl" style={{ paddingTop: 0, flexDirection: "column", alignItems: "stretch", gap: 6 }}>
        <svg viewBox={`0 0 ${STRIP_W} ${STRIP_H}`} role="img" aria-label="p-value versus shape parameter">
          <line x1={50} y1={ty(Math.log10(0.05))} x2={STRIP_W - 92} y2={ty(Math.log10(0.05))}
            stroke="#6b7a3a" strokeWidth="1" strokeDasharray="3 3" />
          <text x={STRIP_W - 88} y={ty(Math.log10(0.05)) + 3.5} className="lb" fill="#6b7a3a">p = 0.05</text>
          <line x1={50} y1={ty(0)} x2={STRIP_W - 92} y2={ty(0)} stroke="#c7cdc1" />
          {[0, -10, -20, -30].map((lp) => (
            <text key={lp} x={44} y={ty(lp) + 3.5} textAnchor="end" className="lb">
              {lp === 0 ? "1" : `1e${lp}`}
            </text>
          ))}
          <path d={LIVE_STRIP} fill="none" stroke="#1b4f9c" strokeWidth="1.6" />
          {dial.map((r) => (
            <circle key={r.t} cx={tx(r.t)} cy={ty(Math.log10(r.p))} r="3" fill="#6b7a3a" stroke="#fbfcfa" strokeWidth="1" />
          ))}
          <line x1={tx(t)} y1={8} x2={tx(t)} y2={STRIP_H - 20} stroke="#b23a2b" strokeWidth="1.5" />
          {[0, 1, 2, 3].map((v) => (
            <text key={v} x={tx(v)} y={STRIP_H - 6} textAnchor="middle" className="lb">t={v}</text>
          ))}
        </svg>
        <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: 0, maxWidth: "none" }}>{c.caption}</p>
      </div>
    </div>
  );
}

export const DIAL_TABLE = dial;
export const DIAL_GENE = { gene, context, meanCpm, nZero, nCtrl, target: TARGET, lfc: LFC };
