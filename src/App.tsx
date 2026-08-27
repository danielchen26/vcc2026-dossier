import { useEffect, useRef, useState } from "react";
import { COPY, MATH } from "./copy";
import { LeaderboardChart, PayoffChart } from "./components/Charts";
import { Pipeline } from "./components/Pipeline";
import { DIAL_GENE, DIAL_TABLE, PsiDial } from "./components/PsiDial";
import { Chip, M, Plain, Section, Stat } from "./components/ui";
import { LangProvider, LangToggle, type Lang } from "./i18n";
import {
  ARTIFACTS, BASAL_CORR, BUDGET, BUNDLE, CAPS, CHECKS, COMPARE, CONTEXTS,
  GATE_INTER, GATE_UNION, LB_ORDER, LEADERBOARD, LOSSLESS, MACHINE,
  MANIFEST_PROOF, METRICS, N_TEAMS, OPTIMIZATIONS, PARITY, PARITY_META,
  PAYOFF_FULL, PAYOFF_H, PSEUDOBULK_CUT, PSI_CHECK, REV, ROADMAP, SHAPE,
  SIGMA, SPEED, STAGE2, TASK, TIMELINE, TOOLS, TOP_OVERALL, TRAPS, UI, scaled,
} from "./data/facts";

const IDS = ["problem", "rules", "field", "reduction", "method", "compare",
  "verify", "payoff", "budget", "traps", "next"];

/** 滚动进度 0..1，写进 CSS transform，不触发 re-render */
function useScrollProgress(bar: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [bar]);
}

/** 当前视口内最靠上的 section id */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.intersectionRatio);
        let best = active;
        let bestRatio = -1;
        for (const id of ids) {
          const r = seen.get(id) ?? 0;
          if (r > bestRatio) { bestRatio = r; best = id; }
        }
        if (bestRatio > 0) setActive(best);
      },
      { rootMargin: "-12% 0px -60% 0px", threshold: [0, 0.15, 0.4, 0.8] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);
  return active;
}

/** 进入视口时给元素加 .in */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function App() {
  return <LangProvider>{(lang, set) => <Page lang={lang} setLang={set} />}</LangProvider>;
}

function Page({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const c = COPY[lang];
  const bar = useRef<HTMLDivElement>(null);
  useScrollProgress(bar);
  useReveal();
  const active = useActiveSection(IDS);

  const top = LEADERBOARD[0];
  const decoded = LB_ORDER.map((id) => {
    const [lbScaled, raw] = top.m[id];
    return { id, raw, lbScaled, computed: scaled(id, raw) };
  });
  const decodedMean = decoded.reduce((a, d) => a + d.lbScaled, 0) / decoded.length;
  const zh = lang === "zh";

  return (
    <>
      <div className="progress" ref={bar} style={{ transform: "scaleX(0)" }} />
      <div className="shell">
        <aside className="rail">
          <div className="rail-mark">
            VCC 2026<span>{UI.subtitle[lang]}</span>
          </div>
          <LangToggle lang={lang} onChange={setLang} />
          <nav>
            {IDS.map((id, i) => (
              <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{c.nav[i]}</span>
              </a>
            ))}
          </nav>
          <div className="rail-foot">
            <div><span>{UI.rev[lang]}</span><b>{REV}</b></div>
            <div><span>{UI.machine[lang]}</span><b>{UI.noGpu[lang]}</b></div>
            <div><span>{UI.first[lang]}</span><b>{TOP_OVERALL}</b></div>
            <div><span>{UI.teams[lang]}</span><b>{N_TEAMS}</b></div>
            <div><span>{UI.deadline[lang]}</span><b>11-05</b></div>
          </div>
        </aside>

        <main>
          {/* ------------------------------------------------------------ 首屏 */}
          <div className="hero">
            <span className="eyebrow">{c.heroEyebrow}</span>
            <h1>{c.heroTitle}</h1>
            <p className="thesis">{c.heroThesis}</p>
            <div className="hero-meta">
              {c.heroMeta.map(([k, v]) => (
                <span key={k}>{k}<b>{v}</b></span>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------------ 三分钟看懂 */}
          <div className="overview reveal">
            <span className="ov-tag">{c.ovTag}</span>
            <div className="ov-grid">
              {c.ov.map((o) => (
                <div className="ov-card" key={o.tag}>
                  <span className="n">{o.tag}</span>
                  <h3>{o.t}</h3>
                  <p>{o.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* --------------------------------------------------------- 01 问题 */}
          <Section id="problem" num="01" title={{ zh: c.s.problem.t, en: COPY.en.s.problem.t }}
            kicker={{ zh: c.s.problem.k, en: COPY.en.s.problem.k }}>
            <div className="reveal in">
              <p className="lede">{c.p.probLede}</p>
              <p style={{ marginTop: 20 }}>{c.p.probWhat}</p>

              <div className="card" style={{ marginTop: 26 }}>
                <h3>{c.p.probHardH}</h3>
                <p>{c.p.probHard1}</p>
                <p>{c.p.probHard2}</p>
                <p>{c.p.probHard3}</p>
                <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 0 }}>{c.p.probStakes}</p>
              </div>

              <div className="grid g4" style={{ marginTop: 16 }}>
                {SHAPE.map((s) => <Stat key={s.v} k={s.k[lang]} v={s.v} n={s.n[lang]} />)}
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3>{c.h.timeline}</h3>
                <div className="tw">
                  <table>
                    <tbody>
                      {TIMELINE.map((t) => (
                        <tr key={t.d.en} className={t.s === "now" ? "hl" : undefined}>
                          <td className="mono" style={{ color: t.s === "past" ? "var(--text-3)" : "var(--text)", width: 90 }}>
                            {t.d[lang]}
                          </td>
                          <td style={{ color: t.s === "past" ? "var(--text-3)" : "var(--text)" }}>
                            {t.e[lang]}{t.s === "now" && " ←"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 02 规则 */}
          <Section id="rules" num="02" title={{ zh: c.s.rules.t, en: COPY.en.s.rules.t }}
            kicker={{ zh: c.s.rules.k, en: COPY.en.s.rules.k }}>
            <div className="reveal">
              <Plain>{c.p.rulesLede}</Plain>

              <h3 style={{ margin: "34px 0 14px" }}>{c.p.rulesFlowH}</h3>
              <Pipeline />

              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.p.rulesHandInH}</h3>
                  <p style={{ fontSize: 15 }}>{c.p.rulesHandIn}</p>
                  <div className="tw">
                    <table>
                      <tbody>
                        {TASK.slice(0, 4).map((r) => (
                          <tr key={r.k.en}>
                            <td className="mono" style={{ color: "var(--text-3)", width: 120 }}>{r.k[lang]}</td>
                            <td><b>{r.v[lang]}</b>
                              <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>{r.n[lang]}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <caption><Chip p="official" /></caption>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <h3>{c.p.rulesAnchorH}</h3>
                  <p style={{ fontSize: 15 }}>{c.p.rulesAnchor}</p>
                  <div style={{ borderLeft: "2px solid var(--ver)", paddingLeft: 16, margin: "16px 0", fontSize: 15, lineHeight: 1.7 }}>
                    {c.p.rulesAnchorList}
                  </div>
                  <p style={{ fontSize: 15, marginBottom: 0 }}>{c.p.rulesAnchorTail}</p>
                </div>
              </div>

              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.h.anchors}</h3>
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>{UI.metric[lang]}</th>
                          <th className="n">{zh ? "0 分处" : "score 0"}</th>
                          <th className="n">{zh ? "1 分处" : "score 1"}</th>
                          <th className="n">{zh ? "完美复现" : "perfect copy"}</th></tr>
                      </thead>
                      <tbody>
                        {METRICS.map((m) => (
                          <tr key={m.id}>
                            <td>{m.name[lang]}
                              <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 3, lineHeight: 1.45 }}>{m.plain[lang]}</div>
                            </td>
                            <td className="n">{m.bTxt}</td>
                            <td className="n">{m.rTxt}</td>
                            <td className="n" style={{ color: "var(--ver)" }}>{m.perfect}</td>
                          </tr>
                        ))}
                      </tbody>
                      <caption><M tex={MATH.scale} /> <Chip p="official" /></caption>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3>{c.h.caps}</h3>
                  <div className="tw">
                    <table>
                      <tbody>
                        {CAPS.map((x) => (
                          <tr key={x.k.en}>
                            <td>{x.k[lang]}</td>
                            <td className="n"><b>{x.v}</b></td>
                            <td style={{ color: "var(--text-2)", fontSize: 13 }}>{x.n[lang]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="tw" style={{ marginTop: 14 }}>
                    <table>
                      <tbody>
                        {TASK.slice(4).map((r) => (
                          <tr key={r.k.en}>
                            <td className="mono" style={{ color: "var(--text-3)", width: 110 }}>{r.k[lang]}</td>
                            <td><b>{r.v[lang]}</b>
                              <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>{r.n[lang]}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 03 现状 */}
          <Section id="field" num="03" title={{ zh: c.s.field.t, en: COPY.en.s.field.t }}
            kicker={{ zh: c.s.field.k, en: COPY.en.s.field.k }}>
            <div className="reveal">
              <LeaderboardChart />

              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.h.whyEmpty}</h3>
                  <p style={{ fontSize: 15 }}>{c.p.fieldWhyP1}</p>
                  <M block tex={MATH.dCrit} />
                  <p style={{ fontSize: 15, marginBottom: 0 }}>{c.p.fieldWhyP2}</p>
                </div>
                <div className="card">
                  <h3>{c.h.decode}</h3>
                  <p style={{ fontSize: 15 }}>{c.p.fieldDecodeP}</p>
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>{UI.metric[lang]}</th><th className="n">raw</th>
                          <th className="n">{zh ? "榜上" : "board"}</th>
                          <th className="n">{zh ? "我们反算" : "recomputed"}</th></tr>
                      </thead>
                      <tbody>
                        {decoded.map((d) => (
                          <tr key={d.id}>
                            <td className="mono">{d.id}</td>
                            <td className="n">{d.raw.toFixed(3)}</td>
                            <td className="n"><b>{d.lbScaled.toFixed(3)}</b></td>
                            <td className="n" style={{ color: "var(--ver)" }}>{d.computed.toFixed(3)}</td>
                          </tr>
                        ))}
                        <tr className="hl">
                          <td className="mono"><b>{zh ? "六项平均" : "mean of six"}</b></td>
                          <td className="n">—</td>
                          <td className="n"><b>{decodedMean.toFixed(4)}</b></td>
                          <td className="n" style={{ color: "var(--ver)" }}>{zh ? "总分 " : "total "}{top.overall}</td>
                        </tr>
                      </tbody>
                      <caption><Chip p="derived" /></caption>
                    </table>
                  </div>
                </div>
              </div>

              <div className="tw" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>{zh ? "队伍" : "Team"}</th><th>{zh ? "模型" : "Model"}</th>
                      <th className="n">{zh ? "总分" : "total"}</th>
                      {METRICS.map((m) => <th key={m.id} className="n">{m.id}</th>)}
                      <th className="n">{zh ? "提交" : "subs"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEADERBOARD.map((t) => (
                      <tr key={t.rank}>
                        <td className="n">{t.rank}</td>
                        <td><b>{t.team}</b>{t.org[lang] && <div style={{ color: "var(--text-3)", fontSize: 12 }}>{t.org[lang]}</div>}</td>
                        <td className="mono">{t.model}</td>
                        <td className="n"><b>{t.overall.toFixed(4)}</b></td>
                        {LB_ORDER.map((id) => {
                          const [sc, raw] = t.m[id];
                          return (
                            <td key={id} className="n">
                              <span className={sc > 0.3 ? "num pos" : "num"}>{sc.toFixed(3)}</span>
                              <div style={{ color: "var(--text-3)", fontSize: 11 }}>{raw}</div>
                            </td>
                          );
                        })}
                        <td className="n">{t.subs}</td>
                      </tr>
                    ))}
                  </tbody>
                  <caption>
                    {zh ? "每格上行是换算后的分数，下行是原始值。2026-08-26 抓取。"
                      : "Top line rescaled, bottom line raw. Captured 2026-08-26."}
                    <Chip p="official" />
                  </caption>
                </table>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 04 发现 */}
          <Section id="reduction" num="04" title={{ zh: c.s.reduction.t, en: COPY.en.s.reduction.t }}
            kicker={{ zh: c.s.reduction.k, en: COPY.en.s.reduction.k }}>
            <div className="reveal">
              <Plain>{c.p.redLede}</Plain>

              <div className="card">
                <h3>{c.h.psiName}</h3>
                <M block tex={MATH.psi} />
                <p style={{ fontSize: 15 }}>{c.p.redPsiP}</p>
                <div className="tw">
                  <table>
                    <thead>
                      <tr><th>{zh ? "情形" : "Case"}</th><th className="n">scipy</th>
                        <th className="n">{zh ? "我们的写法" : "our form"}</th><th>{zh ? "一致" : "match"}</th></tr>
                    </thead>
                    <tbody>
                      {PSI_CHECK.map((x) => (
                        <tr key={x.case.en}>
                          <td>{x.case[lang]}</td>
                          <td className="n">{x.scipy}</td>
                          <td className="n">{x.psi}</td>
                          <td style={{ color: "var(--ver)", fontWeight: 600 }}>{zh ? "✓ 精确相等" : "✓ exact"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <caption><Chip p="measured" /></caption>
                  </table>
                </div>
                <p style={{ marginTop: 18, marginBottom: 0, fontSize: 17 }}>{c.p.redConclusion}</p>
              </div>

              <div className="note" style={{ marginTop: 16 }}>{c.p.redNote}</div>

              <div className="dial-intro">
                <h3>{c.dialTitle}</h3>
                <p>{c.dialLede}</p>
                <Chip p="measured">{c.dialChip}</Chip>
              </div>
              <PsiDial />

              <div className="card" style={{ marginTop: 16 }}>
                <h3>{c.h.decouple}</h3>
                <p style={{ fontSize: 15 }}>{c.p.redDecoupP}</p>
                <div className="tw">
                  <table>
                    <thead>
                      <tr><th className="n">t</th>
                        <th className="n">{zh ? "有信号的细胞" : "cells with signal"}</th>
                        <th className="n">{zh ? "平均值" : "average"}</th>
                        <th className="n">{zh ? "检验读到的偏移" : "shift the test reads"}</th>
                        <th className="n">p</th><th>{zh ? "结论" : "verdict"}</th></tr>
                    </thead>
                    <tbody>
                      {DIAL_TABLE.map((r) => (
                        <tr key={r.t} className={r.p >= 0.05 ? "hl" : undefined}>
                          <td className="n">{r.t.toFixed(2)}</td>
                          <td className="n">{r.k}</td>
                          <td className="n">{r.mean.toFixed(2)}</td>
                          <td className="n">
                            <span className={r.d >= 0 ? "num pos" : "num neg"}>
                              {r.d >= 0 ? "+" : ""}{r.d.toFixed(4)}
                            </span>
                          </td>
                          <td className="n">{r.p < 1e-4 ? r.p.toExponential(2) : r.p.toFixed(4)}</td>
                          <td style={{ fontWeight: 600, color: r.p < 0.05 ? "var(--up)" : "var(--down)" }}>
                            {r.p < 0.05 ? (zh ? "变了" : "changed") : (zh ? "没变" : "unchanged")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <caption>
                      {zh
                        ? `基因 ${DIAL_GENE.gene}，细胞系 ${DIAL_GENE.context}，对照均值 ${DIAL_GENE.meanCpm.toFixed(2)} ppm，${DIAL_GENE.nZero.toLocaleString()} 个对照细胞检不到它。含并列校正的精确值。`
                        : `Gene ${DIAL_GENE.gene}, cell line ${DIAL_GENE.context}, control average ${DIAL_GENE.meanCpm.toFixed(2)} ppm, undetected in ${DIAL_GENE.nZero.toLocaleString()} control cells. Exact values with tie correction.`}
                      <Chip p="measured" />
                    </caption>
                  </table>
                </div>
                <p style={{ marginTop: 18 }}>{c.p.redDecoupNote}</p>
                <p style={{ marginBottom: 0 }}>{c.p.redDecoupWrap}</p>
              </div>

              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.h.tie}</h3>
                  <p style={{ fontSize: 15 }}>{c.p.redTieP}</p>
                  <M block tex={MATH.sigmaTie} />
                  <div className="grid g2">
                    <Stat k={zh ? "不校正" : "uncorrected"} v={SIGMA.plain.toLocaleString()}
                      n={`${zh ? "阈值" : "threshold"} ${SIGMA.dCritPlain}`} />
                    <Stat k={zh ? "校正后" : "corrected"} v={SIGMA.tie.toLocaleString()}
                      n={`${zh ? "阈值" : "threshold"} ${SIGMA.dCritTie}`} hero />
                  </div>
                  <p style={{ fontSize: 14, marginTop: 16, marginBottom: 0, color: "var(--text-2)" }}>{c.p.redTieNote}</p>
                </div>
                <div className="card">
                  <h3>{zh ? "那两个数字分别决定什么" : "What each of the two numbers decides"}</h3>
                  <div className="tw">
                    <table>
                      <tbody>
                        <tr>
                          <td><b>{zh ? "① 400 个细胞的平均值" : "① the average of the 400 cells"}</b></td>
                          <td style={{ color: "var(--text-2)" }}>{zh ? "涨还是跌、涨多少" : "up or down, and by how much"}</td>
                        </tr>
                        <tr>
                          <td><b>{zh ? "② 它们在对照里的平均排名" : "② their average rank in the controls"}</b></td>
                          <td style={{ color: "var(--text-2)" }}>{zh ? "算不算「变了」" : "whether it counts as changed"}</td>
                        </tr>
                        <tr>
                          <td><b>{zh ? "（① 的加总）" : "(the sum of ①)"}</b></td>
                          <td style={{ color: "var(--text-2)" }}>{zh ? "认得出是哪个扰动、表达量准不准" : "telling perturbations apart, expression accuracy"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 05 方法 */}
          <Section id="method" num="05" title={{ zh: c.s.method.t, en: COPY.en.s.method.t }}
            kicker={{ zh: c.s.method.k, en: COPY.en.s.method.k }}>
            <div className="reveal">
              <div className="flow">
                <div className="step">
                  <span className="tag">{zh ? "材料" : "input"}</span>
                  <h4>{zh ? "别的细胞系的平均反应" : "Average responses in other cell lines"}</h4>
                  <p>{zh ? "Replogle / Nadig / Jiang / 去年的 VCC 数据，每个扰动一行平均谱。合计不到 2 GB。"
                    : "Replogle / Nadig / Jiang / last year's VCC, one average profile per perturbation. Under 2 GB total."}</p>
                </div>
                <div className="step">
                  <span className="tag">{zh ? "材料" : "input"}</span>
                  <h4>{zh ? "目标细胞系的健康状态" : "The target line's healthy state"}</h4>
                  <p>{zh ? "18,400 个未扰动细胞。官方不给细胞系名字，这些细胞就是「这是哪个细胞系」的唯一线索。"
                    : "18,400 unperturbed cells. The names are withheld, so these cells are the only clue to which line it is."}</p>
                </div>
                <div className="step">
                  <span className="tag">{zh ? "第一步 · 预测" : "stage 1 · predict"}</span>
                  <h4>{zh ? "哪些基因变了，涨还是跌，涨多少" : "Which genes changed, up or down, how much"}</h4>
                  <M block tex={MATH.stage1} />
                  <p>{zh ? "普通 CPU 上的经典线性代数。待做。" : "Classical linear algebra on a plain CPU. Still to do."}</p>
                </div>
                <div className="step lossless">
                  <span className="tag">{zh ? "第二步 · 构造" : "stage 2 · construct"}</span>
                  <h4>{zh ? "把答案精确写成 400 个整数细胞" : "Write that answer as 400 whole-number cells"}</h4>
                  <p>{zh ? <>逐基因解一个一维方程。<b>不打折扣，已验证，0.28 秒一组。</b></>
                    : <>One one-dimensional equation per gene. <b>Lossless, verified, 0.28 s per group.</b></>}</p>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3>{c.p.methodMathH}</h3>
                <p style={{ fontSize: 15 }}>{c.p.methodMathP1}</p>
                <M block tex={MATH.design} />
                <p style={{ fontSize: 15 }}>{c.p.methodMathP2}</p>
                <div className="grid g3" style={{ marginTop: 20 }}>
                  <Stat k={zh ? "想让它显著的基因，实际显著了多少" : "genes we aimed to flag, actually flagged"}
                    v={`${STAGE2.hit} / ${STAGE2.intended}`}
                    n={zh ? "召回 100% · 精确率 100% · 乱报 0" : "recall 100% · precision 100% · zero false flags"} hero />
                  <Stat k={zh ? "涨跌方向" : "direction"} v="100%"
                    n={zh ? `幅度误差中位数 ${STAGE2.lfcErr}` : `median effect-size error ${STAGE2.lfcErr}`} />
                  <Stat k={zh ? "一组耗时" : "per group"} v={String(STAGE2.tDesign)} u="s"
                    n={zh ? `每细胞 ${STAGE2.nnzCell} 个非零值` : `${STAGE2.nnzCell} nonzeros per cell`} />
                </div>
              </div>

              <div className="grid g3" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.p.methodThreeH}</h3>
                  <ol className="tight" style={{ fontSize: 14 }}>
                    <li>{zh
                      ? <><b>测序深度是免费参数。</b>评分器两处归一化都跟总量无关，所以把深度设成一百万，计数值就直接等于百万分率。</>
                      : <><b>Sequencing depth is free.</b> Both normalisation steps are scale-free, so set depth to one million and counts become parts-per-million directly.</>}</li>
                    <li>{zh
                      ? <><b>单个细胞稀疏，加总不稀疏。</b>400 个各约 6,000 个非零值的细胞加起来仍覆盖所有有表达的基因，前两个指标毫发无损，密度只用掉上限的 45%。</>
                      : <><b>Sparse cells, dense total.</b> 400 cells with ~6,000 nonzeros each still cover every expressed gene when summed — first two metrics untouched, at 45% of the cap.</>}</li>
                    <li>{zh
                      ? <><b>该报多少个基因有解析答案：</b>正好等于真实变了的个数，此时 <M tex={MATH.jacH} />。</>
                      : <><b>How many genes to flag has a closed form:</b> exactly as many as really changed, giving <M tex={MATH.jacH} />.</>}</li>
                  </ol>
                </div>
                <div className="card">
                  <h3>{c.p.methodLosslessH}</h3>
                  <p style={{ fontSize: 14 }}>{c.p.methodLosslessP}</p>
                  <div className="tw">
                    <table>
                      <thead><tr><th>{UI.metric[lang]}</th><th className="n">raw</th><th className="n">{zh ? "换算后" : "rescaled"}</th></tr></thead>
                      <tbody>
                        {LOSSLESS.map((l) => (
                          <tr key={l.id}>
                            <td className="mono">{l.id}</td>
                            <td className="n">{l.raw}</td>
                            <td className="n"><b style={{ color: "var(--ver)" }}>{l.sc}</b></td>
                          </tr>
                        ))}
                      </tbody>
                      <caption><Chip p="measured" /></caption>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3>{c.p.methodNullH}</h3>
                  <p style={{ fontSize: 14, marginBottom: 0 }}>{c.p.methodNullP}</p>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3>{c.p.methodOptH}</h3>
                <div className="tw">
                  <table>
                    <thead><tr>{c.cols.opt.map((x) => <th key={x}>{x}</th>)}</tr></thead>
                    <tbody>
                      {OPTIMIZATIONS.map((o) => (
                        <tr key={o.win.en}>
                          <td style={{ minWidth: 190 }}><b>{o.t[lang]}</b></td>
                          <td style={{ color: "var(--text-2)", fontSize: 13.5 }}>{o.d[lang]}</td>
                          <td className="mono" style={{ color: "var(--ver)", minWidth: 120 }}>{o.win[lang]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 06 对比 */}
          <Section id="compare" num="06" title={{ zh: c.s.compare.t, en: COPY.en.s.compare.t }}
            kicker={{ zh: c.s.compare.k, en: COPY.en.s.compare.k }}>
            <div className="reveal">
              <Plain>{c.p.cmpLede}</Plain>
              <div className="cmp">
                <div className="cmp-head">
                  {c.cols.cmp.map((h, i) => <div key={h} className={["", "them", "us", "ev"][i]}>{h}</div>)}
                </div>
                {COMPARE.map((x) => (
                  <div className="cmp-row" key={x.sub}>
                    <div className="axis">{x.axis[lang]}<span>{x.sub}</span></div>
                    <div className="them">{x.them[lang]}</div>
                    <div className="us">{x.us[lang]}</div>
                    <div className="ev">
                      <Chip p={x.prov} />
                      {x.ev && <div style={{ fontFamily: "var(--mono)", fontSize: 10, marginTop: 7, color: "var(--ver)" }}>{x.ev[lang]}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.p.cmpFairH}</h3>
                  <p style={{ fontSize: 15, marginBottom: 0 }}>{c.p.cmpFairP}</p>
                </div>
                <div className="card">
                  <h3>{c.p.cmpNotHackH}</h3>
                  <p style={{ fontSize: 15, marginBottom: 0 }}>{c.p.cmpNotHackP}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 07 验证 */}
          <Section id="verify" num="07" title={{ zh: c.s.verify.t, en: COPY.en.s.verify.t }}
            kicker={{ zh: c.s.verify.k, en: COPY.en.s.verify.k }}>
            <div className="reveal">
              <div className="grid g4">
                <Stat k={zh ? "跟官方的结论差异" : "disagreement with the official scorer"}
                  v={zh ? "0 个基因" : "0 genes"}
                  n={zh ? "3 组全部逐个基因一致" : "all three groups, gene for gene"} hero />
                <Stat k={zh ? "自己打分快多少" : "our scoring speedup"} v={`${SPEED.measuredRatio}×`}
                  n={`${SPEED.officialOne} s → ${SPEED.mine} s`} />
                <Stat k={zh ? "评一次全场" : "one full self-evaluation"}
                  v={zh ? `${SPEED.panelMine10} 分钟` : `${SPEED.panelMine10} min`}
                  n={zh ? `官方打分器要 ${SPEED.panelOfficialH} 小时` : `official scorer needs ${SPEED.panelOfficialH} hours`} />
                <Stat k={zh ? "幅度最大偏差" : "largest effect-size deviation"} v="1.0e-5"
                  n={zh ? "浮点存储精度量级" : "at float-storage precision"} />
              </div>

              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.h.checks}</h3>
                  <div className="tw">
                    <table>
                      <thead><tr><th>{zh ? "核对项" : "Item"}</th><th>{zh ? "实测" : "Measured"}</th><th className="n">{zh ? "规格" : "Spec"}</th></tr></thead>
                      <tbody>
                        {CHECKS.map((x) => (
                          <tr key={x.k.en}>
                            <td>{x.k[lang]}</td>
                            <td style={{ fontSize: 13.5, color: "var(--text-2)" }}>{x.v[lang]}</td>
                            <td className="n" style={{ color: "var(--ver)" }}>{x.spec}</td>
                          </tr>
                        ))}
                      </tbody>
                      <caption>
                        <code>{BUNDLE.file}</code> · {BUNDLE.bytes.toLocaleString()} bytes · sha256{" "}
                        <code>{BUNDLE.sha256.slice(0, 16)}…</code> <Chip p="measured" />
                      </caption>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3>{c.p.verifyManifestH}</h3>
                  <p style={{ fontSize: 15 }}>{c.p.verifyManifestP1}</p>
                  <pre>
                    {`"A": {\n  "n_perturbations": 300,\n  "control_cells": `}<b>18400</b>
                    {`,\n  "`}<b>ground_truth_cells</b>{`": `}<b>138400</b>
                    {`,\n  "n_ntc_ids": 46\n}`}
                  </pre>
                  <M block tex={MATH.manifest} />
                  <p style={{ fontSize: 15, marginBottom: 0 }}>
                    <b>{MANIFEST_PROOF.claim[lang]}</b> {c.p.verifyManifestP2} <Chip p="official" />
                  </p>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3>{c.p.verifyParityH}</h3>
                <div className="grid g3" style={{ marginBottom: 18 }}>
                  <Stat k={zh ? "参与检验的基因数" : "genes tested"} v={PARITY_META.gate.toLocaleString()}
                    n={zh ? "与官方完全一致" : "identical to the official run"} />
                  <Stat k={zh ? "官方结果表" : "official result table"} v={PARITY_META.rows.toLocaleString()}
                    u={zh ? " 行" : " rows"} n={zh ? "3 组 × 9,929 基因" : "3 groups × 9,929 genes"} />
                  <Stat k={zh ? "校正后 p 值的差异" : "difference in adjusted p-values"} v={PARITY_META.padjDiff}
                    n={zh ? "即完全一致" : "i.e. identical"} hero />
                </div>
                <div className="tw">
                  <table>
                    <thead>
                      <tr><th>{zh ? "组" : "Group"}</th>
                        <th className="n">{zh ? "官方判为变了" : "official: changed"}</th>
                        <th className="n">{zh ? "我们（含并列校正）" : "ours (tie-corrected)"}</th>
                        <th className="n">{zh ? "我们（不校正）" : "ours (uncorrected)"}</th>
                        <th className="n">{zh ? "差异" : "difference"}</th>
                        <th className="n">{zh ? "幅度最大偏差" : "max deviation"}</th></tr>
                    </thead>
                    <tbody>
                      {PARITY.map((p) => (
                        <tr key={p.p} className="hl">
                          <td className="mono">{p.p}</td>
                          <td className="n">{p.off}</td>
                          <td className="n"><b style={{ color: "var(--ver)" }}>{p.mineTie}</b></td>
                          <td className="n" style={{ color: "var(--text-3)" }}>{p.minePlain}</td>
                          <td className="n"><b>{p.sym}</b></td>
                          <td className="n">{p.lfcMax}</td>
                        </tr>
                      ))}
                    </tbody>
                    <caption>
                      {PARITY_META.version}.{" "}
                      {zh
                        ? `官方六指标同时给出：「挑对哪些基因」= ${PARITY_META.officialJac}（三组相同，正好是 100/401，与我们故意设计的 100 个重叠吻合），「涨跌方向」= ${PARITY_META.officialFid.join(" / ")}，「方向纵深」= 0（我们的方向是随机设的，行为正确）。`
                        : `The official six came out too: overlap = ${PARITY_META.officialJac} (identical across groups, exactly 100/401, matching the 100 overlaps we designed in), direction = ${PARITY_META.officialFid.join(" / ")}, reach = 0 (we set directions at random — correct behaviour).`}
                      <Chip p="measured" />
                    </caption>
                  </table>
                </div>
              </div>

              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.h.parity}</h3>
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>{zh ? "细胞系" : "Line"}</th>
                          <th className="n">{zh ? "参与检验" : "tested"}</th>
                          <th className="n">{zh ? "占比" : "share"}</th>
                          <th className="n">&gt;1 ppm</th>
                          <th className="n">{zh ? "检出" : "detected"}</th></tr>
                      </thead>
                      <tbody>
                        {CONTEXTS.map((x) => (
                          <tr key={x.c}>
                            <td className="mono"><b>{x.c}</b></td>
                            <td className="n"><b>{x.gate.toLocaleString()}</b></td>
                            <td className="n">{(x.pct * 100).toFixed(1)}%</td>
                            <td className="n">{x.gt1.toLocaleString()}</td>
                            <td className="n">{x.nz.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <caption>
                        {zh
                          ? `交集 ${GATE_INTER.toLocaleString()}、并集 ${GATE_UNION.toLocaleString()} —— 约 4,000 个基因只在部分细胞系里被检验。`
                          : `Intersection ${GATE_INTER.toLocaleString()}, union ${GATE_UNION.toLocaleString()} — about 4,000 genes are tested in only some lines.`}
                        <Chip p="measured" />
                      </caption>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3>{c.p.verifyCtxH}</h3>
                  <div className="grid g3" style={{ marginBottom: 16 }}>
                    {BASAL_CORR.map((b) => <Stat key={b.p} k={b.p} v={b.r.toFixed(3)} />)}
                  </div>
                  <p style={{ fontSize: 15, marginBottom: 0 }}>{c.p.verifyCtxP} <Chip p="measured" /></p>
                </div>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 08 收益 */}
          <Section id="payoff" num="08" title={{ zh: c.s.payoff.t, en: COPY.en.s.payoff.t }}
            kicker={{ zh: c.s.payoff.k, en: COPY.en.s.payoff.k }}>
            <div className="reveal">
              <PayoffChart />
              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card">
                  <h3>{c.h.payTable}</h3>
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th className="n">{zh ? "挑对比例" : "recovered"}</th>
                          <th className="n">jac</th><th className="n">fid</th><th className="n">reach</th>
                          <th className="n">nmae</th><th className="n">{zh ? "总分" : "total"}</th>
                          <th className="n">{zh ? "倍数" : "×leader"}</th></tr>
                      </thead>
                      <tbody>
                        {PAYOFF_H.map((d) => (
                          <tr key={d.h} className={d.overall > TOP_OVERALL ? "hl" : undefined}>
                            <td className="n">{(d.h * 100).toFixed(0)}%</td>
                            <td className="n">{d.jac.toFixed(3)}</td>
                            <td className="n">{d.fid.toFixed(3)}</td>
                            <td className="n">{d.reach.toFixed(3)}</td>
                            <td className="n">{d.nmae.toFixed(3)}</td>
                            <td className="n"><b>{d.overall.toFixed(4)}</b></td>
                            <td className="n" style={{ color: "var(--up)" }}>{(d.overall / TOP_OVERALL).toFixed(2)}×</td>
                          </tr>
                        ))}
                      </tbody>
                      <caption><Chip p="derived" /></caption>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3>{c.p.payHiH}</h3>
                  <div className="grid g3" style={{ marginBottom: 16 }}>
                    {Object.entries(PAYOFF_FULL.parts).map(([k, v]) => (
                      <Stat key={k} k={k} v={(v >= 0 ? "+" : "") + v.toFixed(2)} />
                    ))}
                  </div>
                  <Stat
                    k={zh ? `挑对 ${PAYOFF_FULL.h * 100}%，另两项也做好` : `${PAYOFF_FULL.h * 100}% recovered, plus the other two`}
                    v={PAYOFF_FULL.overall.toFixed(4)}
                    n={zh ? `= 当前第一名的 ${(PAYOFF_FULL.overall / TOP_OVERALL).toFixed(2)} 倍`
                      : `= ${(PAYOFF_FULL.overall / TOP_OVERALL).toFixed(2)}× today's leader`} hero />
                  <p style={{ fontSize: 14, marginTop: 16, marginBottom: 0, color: "var(--text-2)" }}>{c.p.payHiP}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 09 算力 */}
          <Section id="budget" num="09" title={{ zh: c.s.budget.t, en: COPY.en.s.budget.t }}
            kicker={{ zh: c.s.budget.k, en: COPY.en.s.budget.k }}>
            <div className="reveal">
              <div className="grid g2">
                <div className="card">
                  <h3>{c.h.budget}</h3>
                  <div className="tw">
                    <table>
                      <tbody>
                        {BUDGET.map((b) => (
                          <tr key={b.k.en}>
                            <td style={{ minWidth: 130 }}>{b.k[lang]}</td>
                            <td className="n"><b>{b.v[lang]}</b></td>
                            <td style={{ color: "var(--text-2)", fontSize: 13 }}>{b.n[lang]}</td>
                          </tr>
                        ))}
                      </tbody>
                      <caption>
                        {MACHINE.cpu[lang]} · {MACHINE.ram} · {MACHINE.gpu[lang]} · {MACHINE.disk[lang]}
                        <Chip p="measured" />
                      </caption>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3>{c.p.budgetCutH}</h3>
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>{zh ? "数据集" : "Dataset"}</th>
                          <th className="n">{zh ? "原始" : "raw"}</th>
                          <th className="n">{zh ? "只要平均谱" : "averages"}</th>
                          <th className="n">{zh ? "压缩" : "ratio"}</th></tr>
                      </thead>
                      <tbody>
                        {PSEUDOBULK_CUT.map((d) => (
                          <tr key={d.d.en}>
                            <td>{d.d[lang]}<div style={{ color: "var(--text-3)", fontSize: 12 }}>{d.n[lang]}</div></td>
                            <td className="n">{d.raw}</td>
                            <td className="n"><b>{d.pb}</b></td>
                            <td className="n" style={{ color: "var(--ver)" }}>{d.x}</td>
                          </tr>
                        ))}
                      </tbody>
                      <caption><Chip p="derived" /></caption>
                    </table>
                  </div>
                </div>
              </div>
              <div className="note" style={{ marginTop: 16 }}>{c.p.budgetNote}</div>
            </div>
          </Section>

          {/* --------------------------------------------------------- 10 陷阱 */}
          <Section id="traps" num="10" title={{ zh: c.s.traps.t, en: COPY.en.s.traps.t }}
            kicker={{ zh: c.s.traps.k, en: COPY.en.s.traps.k }}>
            <div className="reveal tw">
              <table>
                <thead>
                  <tr><th>{zh ? "坑" : "Trap"}</th><th>{zh ? "后果" : "Consequence"}</th>
                    <th className="n">{zh ? "来源" : "Source"}</th></tr>
                </thead>
                <tbody>
                  {TRAPS.map((t) => (
                    <tr key={t.t.en}>
                      <td style={{ minWidth: 210 }}><b>{t.t[lang]}</b></td>
                      <td style={{ color: "var(--text-2)" }}>{t.d[lang]}</td>
                      <td className="n"><Chip p={t.who} /></td>
                    </tr>
                  ))}
                </tbody>
                <caption>
                  {zh ? "标「本机实测」的四条是我们这次真的踩过的。多重检验校正写反那条最阴险：发现数从 250 变成 0，零报错、零警告。"
                    : "The four marked “we measured it” are ones we actually hit. The reversed multiple-testing correction is the nastiest: discoveries drop from 250 to zero with no error and no warning."}
                </caption>
              </table>
            </div>
          </Section>

          {/* -------------------------------------------------------- 11 下一步 */}
          <Section id="next" num="11" title={{ zh: c.s.next.t, en: COPY.en.s.next.t }}
            kicker={{ zh: c.s.next.k, en: COPY.en.s.next.k }}>
            <div className="reveal">
              <Plain>{c.p.nextLede}</Plain>
              <div className="grid g2">
                {ROADMAP.map((r) => (
                  <div className="card" key={r.n}
                    style={r.status === "next" ? { borderColor: "#ff7a5c4d", background: "linear-gradient(160deg, var(--up-dim), transparent 62%), var(--surface)" } : undefined}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
                      <span className="sec-num" style={{ paddingTop: 0 }}>{String(r.n).padStart(2, "0")}</span>
                      <h3 style={{ flex: 1 }}>{r.t[lang]}</h3>
                      <span className="eyebrow" style={{ color: r.status === "next" ? "var(--up)" : "var(--text-3)" }}>
                        {r.status === "next" ? (zh ? "进行中" : "in progress") : (zh ? "排队" : "queued")}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--up)", fontFamily: "var(--mono)", marginBottom: 10 }}>{r.why[lang]}</p>
                    <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 0 }}>{r.d[lang]}</p>
                  </div>
                ))}
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <h3>{c.p.artifactsH}</h3>
                <div className="tw">
                  <table>
                    <tbody>
                      {ARTIFACTS.map((a) => (
                        <tr key={a.f}>
                          <td className="mono" style={{ minWidth: 200, color: "var(--down)" }}>{a.f}</td>
                          <td style={{ color: "var(--text-2)", fontSize: 14 }}>{a.d[lang]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          <div className="foot">
            <div>VCC 2026 · {UI.subtitle[lang]} · {UI.rev[lang]} {REV}</div>
            <div>{TOOLS}</div>
            <div>{c.foot}</div>
          </div>
        </main>
      </div>
    </>
  );
}
