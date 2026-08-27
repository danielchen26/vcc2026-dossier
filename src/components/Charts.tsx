import { LEADERBOARD, METRICS, PAYOFF_H, PAYOFF_SIGN, TOP_OVERALL } from "../data/facts";
import { useLang } from "../i18n";

/* ---------------------------------------------- 排行榜: 按指标看全场的塌陷 */

const LW = 660;
const ROW = 42;
const LPAD = { l: 168, r: 62, t: 26 };
const LH = LPAD.t + METRICS.length * ROW + 16;
const lx = (v: number) => LPAD.l + ((v + 0.15) / 1.25) * (LW - LPAD.l - LPAD.r);

const LB_TXT = {
  zh: {
    legend: ["前 5 名各队的得分", "0 = 跟猜平均值一样差", "1 = 跟真做一遍实验一样好"],
    cap: (
      <>
        全场只在<b>「认得出是哪个扰动」</b>这一项上得分。另外四项——加起来占总分的三分之二——全挤在 0 附近：
        「挑对了哪些基因」最好 0.010，「涨跌方向」最好 0.003。也就是说，这些模型在这两件事上，
        跟「把平均值贴到每个基因上」没有区别。
        <br />
        这不是模型不够大。是没有人在解 DE 那半个问题。
      </>
    ),
  },
  en: {
    legend: ["top-5 teams", "0 = no better than the average", "1 = as good as a real repeat"],
    cap: (
      <>
        The entire field scores on one thing: <b>telling perturbations apart</b>. The other four —
        two thirds of the total — are pinned near zero: the best score for “which genes responded” is 0.010,
        and for “up or down” it is 0.003. On those two questions these models are indistinguishable from
        pasting the average onto every gene.
        <br />
        This is not a model-size problem. Nobody is solving the other half.
      </>
    ),
  },
};

export function LeaderboardChart() {
  const lang = useLang();
  const c = LB_TXT[lang];
  return (
    <figure className="chart" style={{ margin: 0 }}>
      <div className="legend">
        <span><i style={{ background: "#b23a2b" }} />{c.legend[0]}</span>
        <span><i style={{ background: "#1b4f9c" }} />{c.legend[1]}</span>
        <span><i style={{ background: "#6b7a3a" }} />{c.legend[2]}</span>
      </div>
      <svg viewBox={`0 0 ${LW} ${LH}`} role="img" aria-label="scores of the top five teams across six metrics">
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
              <text x={LPAD.l - 10} y={y + 1} textAnchor="end" className="lb strong">{m.name[lang]}</text>
              <text x={LPAD.l - 10} y={y + 13} textAnchor="end" className="lb dim">{m.id}</text>
              <line x1={lx(-0.15)} y1={y} x2={lx(1.1)} y2={y} stroke="#d8ddd3" />
              <rect x={lx(lo)} y={y - 4} width={Math.max(lx(hi) - lx(lo), 1.5)} height="8" fill="#b23a2b" opacity="0.2" />
              {vals.map((v, k) => (
                <circle key={k} cx={lx(v)} cy={y} r="3.6" fill="#b23a2b"
                  opacity={k === 0 ? 1 : 0.5} stroke="#fbfcfa" strokeWidth="0.8" />
              ))}
              <text x={lx(hi) + 9} y={y + 4} className="lb" fill="#b23a2b">{hi.toFixed(3)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>{c.cap}</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------- 收益曲线 */

const PW = 660;
const PH = 300;
const PP = { l: 52, r: 96, t: 18, b: 42 };
const px = (h: number) => PP.l + (h / 0.55) * (PW - PP.l - PP.r);
const py = (o: number) => PP.t + (1 - o / 0.56) * (PH - PP.t - PP.b);

const PAY_TXT = {
  zh: {
    legend: ["挑对基因的比例越高 → 总分", "只把涨跌方向做对", `当前第一名 ${TOP_OVERALL}`],
    xAxis: "挑对了真实变化基因的比例",
    yAxis: "总分",
    signLab: (a: number, o: number) => `方向准确率 ${a.toFixed(2)} → ${o.toFixed(3)}`,
    leader: `第一名 ${TOP_OVERALL}`,
    cap: (
      <>
        <b>朱线</b>：假设我们能挑对真实变化基因中的一部分（横轴），并且报的个数正好等于真实个数
        （这是两个指标联立的最优点），总分会走到哪里。
        <br />
        <b>蓝点</b>：横轴等于 0 —— 完全不改进「哪些基因变了」的判断，只把已经报出来的那些基因的涨跌方向做对。
        准确率做到 0.75 就已经是第一名。
      </>
    ),
  },
  en: {
    legend: ["share of real responders recovered → total", "fixing direction only", `current leader ${TOP_OVERALL}`],
    xAxis: "share of the real responding genes we recover",
    yAxis: "total score",
    signLab: (a: number, o: number) => `direction accuracy ${a.toFixed(2)} → ${o.toFixed(3)}`,
    leader: `leader ${TOP_OVERALL}`,
    cap: (
      <>
        <b>Red line</b>: where the total lands if we recover some share of the genes that really changed
        (horizontal axis) and flag exactly as many as really changed — the joint optimum of two metrics.
        <br />
        <b>Blue dots</b>: horizontal axis at zero. No improvement at all in deciding <em>which</em> genes
        changed; only the up-or-down call on the genes already flagged. Accuracy of 0.75 already wins.
      </>
    ),
  },
};

export function PayoffChart() {
  const lang = useLang();
  const c = PAY_TXT[lang];
  const path = PAYOFF_H.map((d, i) => `${i === 0 ? "M" : "L"} ${px(d.h)} ${py(d.overall)}`).join(" ");
  return (
    <figure className="chart" style={{ margin: 0 }}>
      <div className="legend">
        <span><i style={{ background: "#b23a2b" }} />{c.legend[0]}</span>
        <span><i style={{ background: "#1b4f9c" }} />{c.legend[1]}</span>
        <span><i style={{ background: "#6b7a3a" }} />{c.legend[2]}</span>
      </div>
      <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label="total score versus share of responders recovered">
        <line x1={PP.l} y1={py(TOP_OVERALL)} x2={PW - PP.r} y2={py(TOP_OVERALL)}
          stroke="#6b7a3a" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x={PW - PP.r + 6} y={py(TOP_OVERALL) + 3.5} className="lb" fill="#6b7a3a">{c.leader}</text>
        <line x1={PP.l} y1={py(0)} x2={PW - PP.r} y2={py(0)} stroke="#c7cdc1" />
        <line x1={PP.l} y1={PP.t} x2={PP.l} y2={py(0)} stroke="#c7cdc1" />
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((o) => (
          <g key={o}>
            <line x1={PP.l - 4} y1={py(o)} x2={PP.l} y2={py(o)} stroke="#c7cdc1" />
            <text x={PP.l - 8} y={py(o) + 3.5} textAnchor="end" className="lb">{o.toFixed(1)}</text>
          </g>
        ))}
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((h) => (
          <text key={h} x={px(h)} y={py(0) + 17} textAnchor="middle" className="lb">{(h * 100).toFixed(0)}%</text>
        ))}
        <text x={PP.l - 8} y={PP.t - 4} textAnchor="end" className="lb">{c.yAxis}</text>
        <text x={PW - PP.r} y={py(0) + 33} textAnchor="end" className="lb">{c.xAxis}</text>

        {PAYOFF_SIGN.map((d) => (
          <g key={d.a}>
            <circle cx={px(0.006)} cy={py(d.overall)} r="3.4" fill="#1b4f9c" />
            <text x={px(0.006) + 8} y={py(d.overall) + 3.5} className="lb" fill="#1b4f9c">
              {c.signLab(d.a, d.overall)}
            </text>
          </g>
        ))}

        <path d={path} fill="none" stroke="#b23a2b" strokeWidth="2.2" />
        {PAYOFF_H.map((d) => (
          <g key={d.h}>
            <circle cx={px(d.h)} cy={py(d.overall)} r="4" fill="#b23a2b" stroke="#fbfcfa" strokeWidth="1.2" />
            <text x={px(d.h) + 9} y={py(d.overall) - 6} className="lb" fill="#b23a2b">{d.overall.toFixed(3)}</text>
          </g>
        ))}
      </svg>
      <figcaption>{c.cap}</figcaption>
    </figure>
  );
}
