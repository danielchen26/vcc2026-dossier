import { LEADERBOARD, METRICS, PAYOFF_H, PAYOFF_SIGN, TOP_OVERALL } from "../data/facts";

/* ---------------------------------------------- 排行榜: 按指标看全场的塌陷 */

const LW = 660;
const ROW = 40;
const LPAD = { l: 132, r: 60, t: 26 };
const LH = LPAD.t + METRICS.length * ROW + 16;
const lx = (v: number) => LPAD.l + ((v + 0.15) / 1.25) * (LW - LPAD.l - LPAD.r);

export function LeaderboardChart() {
  return (
    <figure className="chart" style={{ margin: 0 }}>
      <div className="legend">
        <span><i style={{ background: "#b23a2b" }} />前 5 名各队的 scaled 值</span>
        <span><i style={{ background: "#1b4f9c" }} />0 = context 均值基线</span>
        <span><i style={{ background: "#6b7a3a" }} />1 = 真实重复实验</span>
      </div>
      <svg viewBox={`0 0 ${LW} ${LH}`} role="img"
        aria-label="前五名在六个指标上的 scaled 分数分布">
        <line x1={lx(0)} y1={LPAD.t - 12} x2={lx(0)} y2={LH - 14} stroke="#1b4f9c" strokeWidth="1.4" />
        <line x1={lx(1)} y1={LPAD.t - 12} x2={lx(1)} y2={LH - 14} stroke="#6b7a3a" strokeWidth="1.4" />
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <text key={v} x={lx(v)} y={LPAD.t - 16} textAnchor="middle" className="lb">{v}</text>
        ))}
        {METRICS.map((m, i) => {
          const y = LPAD.t + i * ROW + ROW / 2;
          const vals = LEADERBOARD.map((t) => t.m[m.id as keyof typeof t.m][0]);
          const lo = Math.min(...vals);
          const hi = Math.max(...vals);
          return (
            <g key={m.id}>
              <text x={LPAD.l - 10} y={y + 4} textAnchor="end" className="lb strong">{m.name}</text>
              <text x={LPAD.l - 10} y={y + 15} textAnchor="end" className="lb dim">{m.id}</text>
              <line x1={lx(-0.15)} y1={y} x2={lx(1.1)} y2={y} stroke="#d8ddd3" />
              <rect x={lx(lo)} y={y - 4} width={Math.max(lx(hi) - lx(lo), 1.5)} height="8"
                fill="#b23a2b" opacity="0.2" />
              {vals.map((v, k) => (
                <circle key={k} cx={lx(v)} cy={y} r="3.6" fill="#b23a2b"
                  opacity={k === 0 ? 1 : 0.5} stroke="#fbfcfa" strokeWidth="0.8" />
              ))}
              <text x={lx(hi) + 9} y={y + 4} className="lb" fill="#b23a2b">{hi.toFixed(3)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        全场只在 <b>扰动可辨识度 (pds)</b> 上得分。四个 DE 指标——占总分 2/3——挤在 0 附近：
        <b>jac</b> 的最好成绩 0.010、<b>fid</b> 0.003，与「把 context 均值贴到每个扰动上」无区别。
        这不是模型不够大，是没人在解 DE 那半个问题。
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------- 收益曲线 */

const PW = 660;
const PH = 300;
const PP = { l: 52, r: 92, t: 18, b: 42 };
const px = (h: number) => PP.l + (h / 0.55) * (PW - PP.l - PP.r);
const py = (o: number) => PP.t + (1 - o / 0.56) * (PH - PP.t - PP.b);

export function PayoffChart() {
  const path = PAYOFF_H.map((d, i) => `${i === 0 ? "M" : "L"} ${px(d.h)} ${py(d.overall)}`).join(" ");
  return (
    <figure className="chart" style={{ margin: 0 }}>
      <div className="legend">
        <span><i style={{ background: "#b23a2b" }} />恢复参考显著集比例 h → overall</span>
        <span><i style={{ background: "#1b4f9c" }} />只修正方向（h=0）</span>
        <span><i style={{ background: "#6b7a3a" }} />当前第一名 {TOP_OVERALL}</span>
      </div>
      <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label="overall 分数随显著集恢复比例的变化">
        <line x1={PP.l} y1={py(TOP_OVERALL)} x2={PW - PP.r} y2={py(TOP_OVERALL)}
          stroke="#6b7a3a" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x={PW - PP.r + 6} y={py(TOP_OVERALL) + 3.5} className="lb" fill="#6b7a3a">
          第一名 {TOP_OVERALL}
        </text>
        <line x1={PP.l} y1={py(0)} x2={PW - PP.r} y2={py(0)} stroke="#c7cdc1" />
        <line x1={PP.l} y1={PP.t} x2={PP.l} y2={py(0)} stroke="#c7cdc1" />
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((o) => (
          <g key={o}>
            <line x1={PP.l - 4} y1={py(o)} x2={PP.l} y2={py(o)} stroke="#c7cdc1" />
            <text x={PP.l - 8} y={py(o) + 3.5} textAnchor="end" className="lb">{o.toFixed(1)}</text>
          </g>
        ))}
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((h) => (
          <text key={h} x={px(h)} y={py(0) + 17} textAnchor="middle" className="lb">{h.toFixed(1)}</text>
        ))}
        <text x={PP.l - 8} y={PP.t - 4} textAnchor="end" className="lb">overall</text>
        <text x={PW - PP.r} y={py(0) + 33} textAnchor="end" className="lb">h = |R ∩ R̂| / |R|</text>

        {/* 只修正方向的四个点，画在 h≈0 处 */}
        {PAYOFF_SIGN.map((d) => (
          <g key={d.a}>
            <circle cx={px(0.006)} cy={py(d.overall)} r="3.4" fill="#1b4f9c" />
            <text x={px(0.006) + 8} y={py(d.overall) + 3.5} className="lb" fill="#1b4f9c">
              方向准确率 {d.a.toFixed(2)} → {d.overall.toFixed(3)}
            </text>
          </g>
        ))}

        <path d={path} fill="none" stroke="#b23a2b" strokeWidth="2.2" />
        {PAYOFF_H.map((d) => (
          <g key={d.h}>
            <circle cx={px(d.h)} cy={py(d.overall)} r="4" fill="#b23a2b" stroke="#fbfcfa" strokeWidth="1.2" />
            <text x={px(d.h) + 9} y={py(d.overall) - 6} className="lb" fill="#b23a2b">
              {d.overall.toFixed(3)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        朱线：在 |R̂| = |R| 的解析最优点上，恢复参考显著集比例 h 时的 overall（jac = h/(2−h)，
        真阳性方向准确率 0.90、假阳性 0.55，reach 取 0.8h，漏掉的基因按 lfc = 0 计）。
        蓝点：<b>h = 0</b>，即完全不改进「哪些基因响应」的判断，只把已有 call set 的方向做对——
        准确率 0.75 就已经是第一名。
      </figcaption>
    </figure>
  );
}
