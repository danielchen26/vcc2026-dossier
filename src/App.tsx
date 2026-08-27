import { PsiDial, DIAL_TABLE, DIAL_GENE } from "./components/PsiDial";
import { LeaderboardChart, PayoffChart } from "./components/Charts";
import { Chip, M, Section, Stat } from "./components/ui";
import {
  ARTIFACTS, BASAL_CORR, BUDGET, BUNDLE, CAPS, CHECKS, COMPARE, CONTEXTS,
  GATE_INTER, GATE_UNION, LEADERBOARD, LOSSLESS, LB_ORDER, MACHINE,
  MANIFEST_PROOF, METRICS, N_TEAMS, OPTIMIZATIONS, PARITY, PARITY_META,
  PAYOFF_FULL, PAYOFF_H, PSEUDOBULK_CUT, PSI_CHECK, REV, ROADMAP, SHAPE,
  SIGMA, SPEED, STAGE2, TASK, TIMELINE, TOOLS, TOP_OVERALL, TRAPS, scaled,
} from "./data/facts";

const NAV = [
  ["01", "task", "交付物"],
  ["02", "field", "全场诊断"],
  ["03", "reduction", "闭式约化"],
  ["04", "compare", "对比传统做法"],
  ["05", "method", "我们的方法"],
  ["06", "verify", "验证记录"],
  ["07", "payoff", "收益算术"],
  ["08", "budget", "预算与算力"],
  ["09", "traps", "陷阱"],
  ["10", "next", "下一步"],
];

export default function App() {
  const top = LEADERBOARD[0];
  const decoded = LB_ORDER.map((id) => {
    const [lbScaled, raw] = top.m[id];
    return { id, raw, lbScaled, computed: scaled(id, raw) };
  });
  const decodedMean = decoded.reduce((a, d) => a + d.lbScaled, 0) / decoded.length;

  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-mark">
          VCC 2026<span>方法与验证工作簿</span>
        </div>
        <nav>
          {NAV.map(([n, id, label]) => (
            <a key={id} href={`#${id}`}><b>{n}</b><span>{label}</span></a>
          ))}
        </nav>
        <div className="rail-foot">
          <div><span>修订</span><b>{REV}</b></div>
          <div><span>机器</span><b>M1 Pro · 无 GPU</b></div>
          <div><span>第一名</span><b>{TOP_OVERALL}</b></div>
          <div><span>参赛队</span><b>{N_TEAMS}</b></div>
          <div><span>截止</span><b>11-05</b></div>
        </div>
      </aside>

      <main>
        {/* ------------------------------------------------------------ 首屏 */}
        <div className="hero">
          <span className="eyebrow">Arc Institute · Virtual Cell Challenge 2026</span>
          <h1>打分函数是闭式的，所以这题能在笔记本上解。</h1>
          <p className="thesis">
            六个指标全部只经过每个基因的<b>两个标量</b>：一阶矩，和平均对照分位数。
            细胞级的真实感对分数<b>零贡献</b>。于是问题分成两级——预测答案（统计）与精确实现答案（构造）——
            而第二级是<b>解析可解的无损解码器</b>，也正是 {N_TEAMS} 支队伍集体空着的那 2/3 分数。
          </p>
          <div className="hero-meta">
            <span>本机实测<b>{SPEED.ratio}× 打分加速</b></span>
            <span>与官方逐基因对齐<b>对称差 0</b></span>
            <span>解码器精度<b>{STAGE2.hit}/{STAGE2.intended}</b></span>
            <span>全 panel 构造<b>4 分钟 · 无 CUDA</b></span>
          </div>
        </div>

        <div className="dial-intro">
          <h3>签名实验 · 拖动它</h3>
          <p>
            固定一阶矩，只改组内分布形状。均值钉住不动，
            <M tex="p" /> 从 <M tex="10^{-29}" /> 荡到 0.77 再荡回 <M tex="10^{-20}" />。
          </p>
          <Chip p="measured">真实对照数据驱动</Chip>
        </div>
        <PsiDial />

        {/* --------------------------------------------------------- 01 任务 */}
        <Section id="task" num="01" title="最终要交出去的东西，只有一个矩阵"
          kicker="不是模型，不是权重，不是代码。">
          <p className="lede">
            这个区别是整件事的支点。官方原话是 <em>only those results form your entry</em>——
            参赛者自己跑模型，只有结果构成参赛作品；只有获奖者需要补一份文字说明。
            所以这不是「训练一个 virtual cell 模型」的比赛，是
            <strong>「构造一个能通过一套确定性统计检验的计数矩阵」</strong>的比赛。
          </p>

          <div className="grid g4" style={{ marginBottom: 14 }}>
            {SHAPE.map((s) => <Stat key={s.k} {...s} />)}
          </div>

          <div className="tw" style={{ marginBottom: 14 }}>
            <table>
              <thead><tr><th>项</th><th>值</th><th>说明</th></tr></thead>
              <tbody>
                {TASK.map((r) => (
                  <tr key={r.k}>
                    <td className="mono">{r.k}</td>
                    <td><b>{r.v}</b></td>
                    <td style={{ color: "var(--ink-2)" }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
              <caption>官方页面 + manifest.json，逐项核对。<Chip p="official" /></caption>
            </table>
          </div>

          <div className="grid g2">
            <div className="card">
              <h3>提交的硬上限</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <tbody>
                    {CAPS.map((c) => (
                      <tr key={c.k}>
                        <td className="mono">{c.k}</td>
                        <td className="n"><b>{c.v}</b></td>
                        <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{c.n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <h3>时间线</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <tbody>
                    {TIMELINE.map((t) => (
                      <tr key={t.d} className={t.s === "now" ? "hl" : undefined}>
                        <td className="mono" style={{ color: t.s === "past" ? "var(--ink-3)" : "var(--ink)" }}>
                          {t.d}
                        </td>
                        <td style={{ color: t.s === "past" ? "var(--ink-3)" : "var(--ink)" }}>
                          {t.e}{t.s === "now" && " ←"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Section>

        {/* --------------------------------------------------------- 02 诊断 */}
        <Section id="field" num="02" title="全场诊断：2/3 的分数没人拿"
          kicker={`${N_TEAMS} 支队伍，第一名 overall ${TOP_OVERALL}。`}>
          <LeaderboardChart />

          <div className="grid g2" style={{ marginTop: 14 }}>
            <div className="card">
              <h3>列序解码，已用算术证实</h3>
              <p style={{ fontSize: 14 }}>
                排行榜每格是两个数。用官方锚点 <M tex="s=(u-b)/(r-b)" /> 反算，
                确认<strong>前者是 scaled、后者是 raw</strong>，且六个 scaled 的无权平均恰为 overall。
              </p>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead>
                    <tr><th>指标</th><th className="n">raw</th><th className="n">榜上 scaled</th>
                      <th className="n">锚点反算</th></tr>
                  </thead>
                  <tbody>
                    {decoded.map((d) => (
                      <tr key={d.id}>
                        <td className="mono">{d.id}</td>
                        <td className="n">{d.raw.toFixed(3)}</td>
                        <td className="n"><b>{d.lbScaled.toFixed(3)}</b></td>
                        <td className="n" style={{ color: "var(--stamp)" }}>{d.computed.toFixed(3)}</td>
                      </tr>
                    ))}
                    <tr className="hl">
                      <td className="mono"><b>无权平均</b></td>
                      <td className="n">—</td>
                      <td className="n"><b>{decodedMean.toFixed(4)}</b></td>
                      <td className="n" style={{ color: "var(--stamp)" }}>榜上 {top.overall}</td>
                    </tr>
                  </tbody>
                  <caption>
                    锚点取官方区间中点，故有 ±0.01 量级残差；overall 与榜面完全吻合。
                    <Chip p="derived" />
                  </caption>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>为什么 DE 那半边是空的</h3>
              <p style={{ fontSize: 14 }}>
                DE 是拿你交的 400 个细胞、对官方真实对照细胞逐基因跑 Wilcoxon。
                如果 400 个细胞几乎相同（很多模型输出均值再复制），组内方差 ≈ 0，
                <M tex="n_1=400" /> 对 <M tex="n_2=18{,}400" /> 的秩和检验极其敏感——
              </p>
              <div className="mblock">
                <M block tex="d_{\text{crit}}=\frac{1.96\,\sigma}{n_1n_2}=0.0278" />
              </div>
              <p style={{ fontSize: 14, marginBottom: 0 }}>
                <strong>平均对照分位数只要偏移 2.78 个百分点就判显著。</strong>
                退化的细胞把几乎整个基因组推过这条线 → 巨量过报 → <M tex="\mathrm{jac}" /> 的并集炸掉、
                <M tex="\mathrm{fid}" /> 退化成掷硬币。这正是榜首 jac scaled = −0.004、fid scaled = 0.003 的病因。
              </p>
            </div>
          </div>

          <div className="tw" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>队伍</th><th>模型</th><th className="n">overall</th>
                  {METRICS.map((m) => <th key={m.id} className="n">{m.id}</th>)}
                  <th className="n">提交</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((t) => (
                  <tr key={t.rank}>
                    <td className="n">{t.rank}</td>
                    <td><b>{t.team}</b>{t.org && <div style={{ color: "var(--ink-3)", fontSize: 12 }}>{t.org}</div>}</td>
                    <td className="mono">{t.model}</td>
                    <td className="n"><b>{t.overall.toFixed(4)}</b></td>
                    {LB_ORDER.map((id) => {
                      const [sc, raw] = t.m[id];
                      return (
                        <td key={id} className="n">
                          <span className={sc > 0.3 ? "num pos" : "num"}>{sc.toFixed(3)}</span>
                          <div style={{ color: "var(--ink-3)", fontSize: 11 }}>{raw}</div>
                        </td>
                      );
                    })}
                    <td className="n">{t.subs}</td>
                  </tr>
                ))}
              </tbody>
              <caption>
                每格上行 scaled、下行 raw。2026-08-26 抓取。<Chip p="official" />
              </caption>
            </table>
          </div>
        </Section>

        {/* --------------------------------------------------------- 03 约化 */}
        <Section id="reduction" num="03" title="打分函数的闭式约化"
          kicker="这是「不用 GPU」的全部根据。">
          <p className="lede">
            打分时的比较组，是整个 panel 上<em>同一组</em> 18,400 个对照细胞。对固定比较组，
            Wilcoxon 的秩和有一个可加的闭式表示。
          </p>

          <div className="card" style={{ marginBottom: 14 }}>
            <h3>中位秩算子 <M tex="\psi_g" /></h3>
            <M block tex="\psi_g(v)=\#\{c: x_{cg}<v\}+\tfrac12\#\{c: x_{cg}=v\}
              \qquad\Longrightarrow\qquad U_g=\sum_{i=1}^{400}\psi_g(\tilde v_{ig})" />
            <p style={{ fontSize: 14 }}>
              与 <code>scipy.stats.mannwhitneyu</code> 逐位相等，含点质量退化情形：
            </p>
            <div className="tw" style={{ border: 0, marginBottom: 12 }}>
              <table>
                <thead><tr><th>情形</th><th className="n">scipy 的 U</th><th className="n">ψ 求和</th><th>一致</th></tr></thead>
                <tbody>
                  {PSI_CHECK.map((c) => (
                    <tr key={c.case}>
                      <td>{c.case}</td>
                      <td className="n">{c.scipy}</td>
                      <td className="n">{c.psi}</td>
                      <td style={{ color: "var(--stamp)", fontWeight: 600 }}>✓ 精确</td>
                    </tr>
                  ))}
                </tbody>
                <caption>本机 numpy/scipy 验证。<Chip p="measured" /></caption>
              </table>
            </div>
            <p style={{ marginBottom: 0 }}>
              推论：<strong>六个指标全部只经过每个基因的两个标量。</strong>
            </p>
            <div className="tw" style={{ marginTop: 12, border: "1px solid var(--rule)" }}>
              <table>
                <thead><tr><th>充分统计量</th><th>决定</th></tr></thead>
                <tbody>
                  <tr><td><M tex="\hat m_g=\operatorname{mean}_i \tilde v_{ig}" /></td>
                    <td><M tex="\widehat{\mathrm{lfc}}_g" /> → <code>nmae</code>、<code>fid</code> 的方向</td></tr>
                  <tr><td><M tex="\bar\psi_g=U_g/(n_1n_2)" /></td>
                    <td><M tex="p_g" /> → <M tex="\hat R_p" /> → <code>jac</code>、<code>fid</code> 的产出量、<code>reach</code> 的排序</td></tr>
                  <tr><td>pseudobulk <M tex="\textstyle\sum_i v_{ig}" /></td>
                    <td><code>pds</code>、<code>mse</code>（由 <M tex="\hat m_g" /> 唯一确定）</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="note" style={{ marginBottom: 14 }}>
            <b>没有一个指标读你的细胞级联合分布。</b> 所以「生成逼真的单细胞」这件事对分数是零价值的——
            它只是一个必须满足的格式约束。全场投入最多算力的地方，恰好不产生分数。
          </div>

          <div className="grid g2">
            <div className="card">
              <h3>并列校正不是可选项</h3>
              <p style={{ fontSize: 14 }}>
                零计数产生巨量并列组，<M tex="\sigma" /> 必须按 <M tex="\sum_t(t^3-t)" /> 校正：
              </p>
              <M block tex="\sigma_{\text{tie}}=\sqrt{\frac{n_1n_2}{12}\left[(N+1)-\frac{\sum_t (t^3-t)}{N(N-1)}\right]}" />
              <div className="grid g2">
                <Stat k="未校正 σ" v={SIGMA.plain.toLocaleString()} n={`d_crit = ${SIGMA.dCritPlain}`} />
                <Stat k="校正后 σ" v={SIGMA.tie.toLocaleString()} n={`d_crit = ${SIGMA.dCritTie}`} hero />
              </div>
              <p style={{ fontSize: 13.5, marginTop: 12, marginBottom: 0, color: "var(--ink-2)" }}>
                <M tex="z" /> 大 2.8%。这是我与官方打分器最后 1–2 个基因差距的<em>唯一</em>来源。
              </p>
            </div>

            <div className="card">
              <h3>官方锚点：0 与 1 是什么</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead><tr><th>指标</th><th className="n">b（基线）</th><th className="n">r（重复实验）</th>
                    <th className="n">完美复现</th></tr></thead>
                  <tbody>
                    {METRICS.map((m) => (
                      <tr key={m.id}>
                        <td className="mono">{m.id}</td>
                        <td className="n">{m.bTxt}</td>
                        <td className="n">{m.rTxt}</td>
                        <td className="n" style={{ color: "var(--stamp)" }}>{m.perfect}</td>
                      </tr>
                    ))}
                  </tbody>
                  <caption>
                    <M tex="s=(u-b)/(r-b)" />。1 是地标不是上限——完美复现参考数据在四个指标上都超过 1。
                    <Chip p="official" />
                  </caption>
                </table>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <h3>解耦：显著性与方向是两个独立坐标</h3>
            <p style={{ fontSize: 14 }}>
              签名实验用的是 <code>{DIAL_GENE.gene}</code>（context {DIAL_GENE.context}，对照均值{" "}
              {DIAL_GENE.meanCpm.toFixed(2)} CPM，{DIAL_GENE.nZero.toLocaleString()}/{DIAL_GENE.nCtrl.toLocaleString()} 个零细胞）。
              一阶矩恒定在 {DIAL_GENE.target.toFixed(2)} CPM，即 lfc 恒为 +{DIAL_GENE.lfc.toFixed(4)}：
            </p>
            <div className="tw">
              <table>
                <thead>
                  <tr><th className="n">t</th><th className="n">非零细胞</th><th className="n">一阶矩</th>
                    <th className="n">d = ψ̄ − 0.5</th><th className="n">p</th><th>判定</th></tr>
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
                      <td style={{ fontWeight: 600, color: r.p < 0.05 ? "var(--pos)" : "var(--neg)" }}>
                        {r.p < 0.05 ? "显著" : "不显著"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <caption>
                  含并列校正的精确值。注意 <b>t = 3.00</b>：一阶矩<em>仍然向上</em>（lfc = +0.32），
                  但 <M tex="d<0" />、<M tex="p=5\times10^{-20}" />。
                  Wilcoxon 读的是秩，lfc 读的是均值——两者可以指向相反方向。
                  <Chip p="measured" />
                </caption>
              </table>
            </div>
            <p style={{ marginTop: 14, marginBottom: 0 }}>
              于是设计空间的每个基因上有<strong>三个可独立指定的量</strong>：进不进显著集（<M tex="\bar\psi_g" />）、
              报什么方向（<M tex="\hat m_g" /> 的符号）、报多大幅度（<M tex="\hat m_g" /> 的值）。
              这就是下一节两级分解成立的原因。
            </p>
          </div>
        </Section>

        {/* --------------------------------------------------------- 04 对比 */}
        <Section id="compare" num="04" title="传统做法 vs 我们的方法"
          kicker="逐个轴对比。右列每一条都有本机证据或官方文档支撑。">
          <p className="lede">
            大家的默认路线是「更大的生成式单细胞模型」。这条路线在
            <code>pds</code> 上确实有效——榜首 scaled 0.708——但它把 DE 那半边完全交给了运气。
            我们的路线不与它竞争 <code>pds</code>；我们去拿它放弃的那 2/3。
          </p>

          <div className="cmp">
            <div className="cmp-head">
              <div>轴</div>
              <div className="them">传统做法 · 全场默认</div>
              <div className="us">我们的方法</div>
              <div className="ev">证据</div>
            </div>
            {COMPARE.map((c) => (
              <div className="cmp-row" key={c.axis}>
                <div className="axis">{c.axis}<span>{c.sub}</span></div>
                <div className="them">{c.them}</div>
                <div className="us">{c.us}</div>
                <div className="ev">
                  <Chip p={c.prov} />
                  {c.ev && <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 5, color: "var(--stamp)" }}>{c.ev}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid g2" style={{ marginTop: 14 }}>
            <div className="card">
              <h3>传统路线做对了什么</h3>
              <p style={{ fontSize: 14, marginBottom: 0 }}>
                <code>pds</code> 是 pseudobulk 余弦距离的排名，本质上考的是「不同扰动的效应方向能不能互相区分」。
                这需要真实的生物学信号，而大模型确实提供了——榜首 raw 0.820 对基线 0.500。
                <strong>我们的 Stage 2 在这个指标上帮不上忙</strong>，它必须由 Stage 1 的估计质量来挣。
                诚实的结论是：两条路线互补，不互斥。
              </p>
            </div>
            <div className="card">
              <h3>为什么这不是「钻规则漏洞」</h3>
              <p style={{ fontSize: 14, marginBottom: 0 }}>
                Stage 2 不改变任何生物学主张。它做的是：把 Stage 1 的预测
                （哪些基因响应、方向、幅度）<em>无损地</em>翻译成打分器要求的 400 个整数细胞。
                传统做法在这一步有巨大的、不自知的损耗——把正确的预测糟蹋成掷硬币。
                我们只是把这个损耗清零。分数仍然完全取决于 Stage 1 预测得多准。
              </p>
            </div>
          </div>
        </Section>

        {/* --------------------------------------------------------- 05 方法 */}
        <Section id="method" num="05" title="两级分解"
          kicker="估计 ⊕ 构造。第二级已经做完并验证。">
          <div className="flow" style={{ marginBottom: 16 }}>
            <div className="step">
              <span className="tag">输入</span>
              <h4>源域 pseudobulk</h4>
              <p>Replogle / Nadig / Jiang / 2025 VCC H1 的 per-perturbation pseudobulk。合计 &lt; 2 GB。</p>
            </div>
            <div className="step">
              <span className="tag">输入</span>
              <h4>目标 context 的 basal 谱</h4>
              <p>18,400 个非靶向对照细胞。这就是「context」——不给细胞系名字，给它的未扰动状态。</p>
            </div>
            <div className="step">
              <span className="tag">Stage 1 · 估计</span>
              <h4>预测稀疏有符号响应</h4>
              <M block tex="(x^{\text{basal}}_c,\, g)\;\mapsto\;(\hat R_{g,c},\;\widehat{\mathrm{lfc}}_{g,c},\;\text{置信序})" />
              <p>
                规模是 <M tex="10^4\times1.85{\times}10^4" /> 的经典线性代数。<b>待做。</b>
              </p>
            </div>
            <div className="step lossless">
              <span className="tag">Stage 2 · 构造</span>
              <h4>矩量约束下的离散分布设计</h4>
              <p>
                逐基因一维单调求解，命中 <M tex="(\hat m_g,\bar\psi_g)" />。
                <b style={{ color: "var(--stamp)" }}>无损，已验证，0.28 s / 扰动。</b>
              </p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <h3>Stage 2 的数学形式</h3>
            <p style={{ fontSize: 14 }}>
              给定目标一阶矩与目标平均分位数，在整数计数格上求 400 点经验分布：
            </p>
            <M block tex="\text{求 } \{v_i\}_{i=1}^{400}\subset\mathbb{Z}_{\ge0}\;:\;
              \operatorname{mean}_i v_i=\hat m_g,\qquad
              \sum_i\psi_g(v_i)=U_g^{\text{target}}" />
            <p style={{ fontSize: 14 }}>
              固定一阶矩下，<M tex="\bar\psi_g" /> 的可达集是一个<strong>区间</strong>：上界是全部质量集中于单点，
              下界是质量劈成「零」与「大值」的两点分布。<M tex="\psi_g" /> 单调 ⟹ 一维单调方程，
              24 步二分即得。约束只有三条：整数、每细胞总数 <M tex="\le 10^6" />、全局
              nnz <M tex="\le 4.75\times10^9" />。
            </p>
            <div className="grid g3">
              <Stat k="意图 → 实现" v={`${STAGE2.hit}/${STAGE2.intended}`} n="召回 100% · 精确率 100% · 假阳性 0" hero />
              <Stat k="方向一致率" v="100%" n={`lfc 中位绝对误差 ${STAGE2.lfcErr}`} />
              <Stat k="单扰动耗时" v={String(STAGE2.tDesign)} u="s" n={`nnz/cell = ${STAGE2.nnzCell}`} />
            </div>
          </div>

          <div className="grid g3" style={{ marginBottom: 14 }}>
            <div className="card">
              <h3>三个漂亮的推论</h3>
              <ol className="tight" style={{ fontSize: 13.5 }}>
                <li>
                  <strong>库大小 L 是自由变量。</strong> DE 按每细胞归一到 <M tex="10^6" />、
                  pseudobulk 归一到 <M tex="5\times10^4" />，两级都尺度无关。取 <M tex="L=10^6" /> 使
                  <strong> counts ≡ CPM</strong>，免费拿到 1-CPM 的设计分辨率。
                </li>
                <li>
                  <strong>每细胞稀疏 ≠ pseudobulk 稀疏。</strong> 400 个各 ~6,000 nnz 的细胞，
                  其并集覆盖全部有表达基因，pds/mse 毫发无损，而密度只用掉 cap 的 45%。
                </li>
                <li>
                  <strong>call-set 的解析最优点是 <M tex="|\hat R_p|=|R_p|" />。</strong>{" "}
                  <code>fid</code> 罚少报、<code>jac</code> 罚多报，取等时 <M tex="\mathrm{jac}=h/(2-h)" />。
                </li>
              </ol>
            </div>
            <div className="card">
              <h3>解码器无损性的量化</h3>
              <p style={{ fontSize: 13.5 }}>
                在「Stage 1 完美」的假设下把构造结果送进打分公式，得到的正是完美复现参考数据的理论上限：
              </p>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead><tr><th>指标</th><th className="n">raw</th><th className="n">scaled</th></tr></thead>
                  <tbody>
                    {LOSSLESS.map((l) => (
                      <tr key={l.id}>
                        <td className="mono">{l.id}</td>
                        <td className="n">{l.raw}</td>
                        <td className="n"><b style={{ color: "var(--stamp)" }}>{l.sc}</b></td>
                      </tr>
                    ))}
                  </tbody>
                  <caption>与官方 spec 的「完美复现」栏一致。<Chip p="measured" /></caption>
                </table>
              </div>
            </div>
            <div className="card">
              <h3>null 背景不用建模</h3>
              <p style={{ fontSize: 13.5, marginBottom: 0 }}>
                最省事也最正确的 null 背景，是<strong>自举真实对照细胞</strong>：
                <M tex="\bar\psi_g" /> 自动 ≈ 0.5，稀疏度与均值–方差关系天然正确，
                假阳性实测为 <b>0</b>。设计成本只花在预测会响应的那 ~250 个基因上，
                其余 ~9,700 个基因一行代码都不用写。
              </p>
            </div>
          </div>

          <div className="card">
            <h3>工程优化清单</h3>
            <div className="tw" style={{ border: 0 }}>
              <table>
                <thead><tr><th>优化</th><th>做法</th><th>收益</th></tr></thead>
                <tbody>
                  {OPTIMIZATIONS.map((o) => (
                    <tr key={o.t}>
                      <td style={{ minWidth: 170 }}><b>{o.t}</b></td>
                      <td style={{ color: "var(--ink-2)", fontSize: 13 }}>{o.d}</td>
                      <td className="mono" style={{ color: "var(--stamp)", minWidth: 120 }}>{o.win}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* --------------------------------------------------------- 06 验证 */}
        <Section id="verify" num="06" title="验证记录"
          kicker="全部在官方数据上、本机、无 GPU 完成。">
          <div className="grid g4" style={{ marginBottom: 16 }}>
            <Stat k="与官方显著集" v="对称差 0" n="3/3 个扰动，含并列校正" hero />
            <Stat k="打分加速" v={`${SPEED.ratio}×`} n={`${SPEED.officialBoth} s → ${SPEED.mine} s`} />
            <Stat k="全 panel 自评" v={`${SPEED.panelMine10} 分钟`} n={`官方 CPU 需 ${SPEED.panelOfficialH} 小时`} />
            <Stat k="lfc 最大偏差" v="1.0e-5" n="float32 存储噪声量级" />
          </div>

          <div className="grid g2" style={{ marginBottom: 14 }}>
            <div className="card">
              <h3>包内容逐项核对</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead><tr><th>核对项</th><th>实测</th><th className="n">规格</th></tr></thead>
                  <tbody>
                    {CHECKS.map((c) => (
                      <tr key={c.k}>
                        <td className="mono">{c.k}</td>
                        <td style={{ fontSize: 13 }}>{c.v}</td>
                        <td className="n" style={{ color: "var(--stamp)" }}>{c.spec}</td>
                      </tr>
                    ))}
                  </tbody>
                  <caption>
                    <code>{BUNDLE.file}</code> · {BUNDLE.bytes.toLocaleString()} bytes ·
                    sha256 <code style={{ fontSize: 10.5 }}>{BUNDLE.sha256.slice(0, 24)}…</code>
                    <Chip p="measured" />
                  </caption>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>manifest.json 给出的证明</h3>
              <p style={{ fontSize: 14 }}>
                上一轮我把「发布的对照细胞就是打分用的比较组」标记为待验证。manifest 直接给了答案：
              </p>
              <pre>
                {`"per_context": {\n  "A": {\n    "n_perturbations": 300,\n    "control_cells": `}
                <b>18400</b>
                {`,\n    "`}<b>ground_truth_cells</b>{`": `}<b>138400</b>
                {`,\n    "n_ntc_ids": 46\n  }, ...`}
              </pre>
              <div className="mblock">
                <M block tex="138{,}400 = 300\times400 \;+\; 18{,}400" />
              </div>
              <p style={{ fontSize: 14, marginBottom: 0 }}>
                <strong>{MANIFEST_PROOF.claim}</strong> 所以 <M tex="\psi_g" />、5-CPM 门、
                BH 的基因全集，全部可以在本地精确重建。<Chip p="official" />
              </p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <h3>与 cell-eval2 的逐基因对齐</h3>
            <div className="grid g3" style={{ marginBottom: 14 }}>
              <Stat k="gate 基因数" v={`${PARITY_META.gateMine.toLocaleString()}`} n={`官方 ${PARITY_META.gateOfficial.toLocaleString()} · 完全一致`} />
              <Stat k="官方 DE 表" v={PARITY_META.rows.toLocaleString()} u="行" n="= 3 扰动 × 9,929 基因" />
              <Stat k="log10(padj) 中位差" v={PARITY_META.padjDiff} n="即完全一致" hero />
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr><th>扰动</th><th className="n">官方 |R̂|</th><th className="n">我（含并列校正）</th>
                    <th className="n">我（未校正）</th><th className="n">对称差</th><th className="n">lfc 最大偏差</th></tr>
                </thead>
                <tbody>
                  {PARITY.map((p) => (
                    <tr key={p.p} className="hl">
                      <td className="mono">{p.p}</td>
                      <td className="n">{p.off}</td>
                      <td className="n"><b style={{ color: "var(--stamp)" }}>{p.mineTie}</b></td>
                      <td className="n" style={{ color: "var(--ink-3)" }}>{p.minePlain}</td>
                      <td className="n"><b>{p.sym}</b></td>
                      <td className="n">{p.lfcMax}</td>
                    </tr>
                  ))}
                </tbody>
                <caption>
                  {PARITY_META.version}。官方六指标同时给出：
                  <code>de_wilcoxon_sig_jaccard</code> = {PARITY_META.officialJac}（三个扰动相同，
                  = 100/401，与设计的 100 重叠吻合），
                  <code>direction_fidelity</code> = {PARITY_META.officialFid.join(" / ")}，
                  <code>direction_reach</code> = 0（随机符号 → 纯度 &lt; 0.9，行为正确）。
                  <Chip p="measured" />
                </caption>
              </table>
            </div>
          </div>

          <div className="grid g2">
            <div className="card">
              <h3>三个 context 的实测差异</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead><tr><th>context</th><th className="n">DE gate</th><th className="n">占比</th>
                    <th className="n">&gt;1 CPM</th><th className="n">非零基因</th></tr></thead>
                  <tbody>
                    {CONTEXTS.map((c) => (
                      <tr key={c.c}>
                        <td className="mono"><b>{c.c}</b></td>
                        <td className="n"><b>{c.gate.toLocaleString()}</b></td>
                        <td className="n">{(c.pct * 100).toFixed(1)}%</td>
                        <td className="n">{c.gt1.toLocaleString()}</td>
                        <td className="n">{c.nz.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <caption>
                    gate = 对照均值 &gt; 5 CPM。三者交集 {GATE_INTER.toLocaleString()}、
                    并集 {GATE_UNION.toLocaleString()} —— 约 4,000 个基因只在部分 context 内被检验，
                    <strong>gate 本身是 context-specific 的</strong>。<Chip p="measured" />
                  </caption>
                </table>
              </div>
            </div>
            <div className="card">
              <h3>它们是真正不同的细胞系</h3>
              <div className="grid g3" style={{ marginBottom: 12 }}>
                {BASAL_CORR.map((b) => (
                  <Stat key={b.p} k={b.p} v={b.r.toFixed(3)} />
                ))}
              </div>
              <p style={{ fontSize: 14, marginBottom: 0 }}>
                basal log-pseudobulk 的两两 Pearson 只有 0.69–0.79。这是跨组织的细胞系，不是近亲。
                <strong>context 迁移是硬问题</strong>——Stage 1 不可能靠「假装三个 context 一样」蒙过去。
                <Chip p="measured" />
              </p>
            </div>
          </div>
        </Section>

        {/* --------------------------------------------------------- 07 收益 */}
        <Section id="payoff" num="07" title="收益算术"
          kicker="用官方锚点算，不是估计。">
          <PayoffChart />

          <div className="grid g2" style={{ marginTop: 14 }}>
            <div className="card">
              <h3>恢复显著集的收益</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead><tr><th className="n">h</th><th className="n">jac</th><th className="n">fid</th>
                    <th className="n">reach</th><th className="n">nmae</th><th className="n">overall</th>
                    <th className="n">倍数</th></tr></thead>
                  <tbody>
                    {PAYOFF_H.map((d) => (
                      <tr key={d.h} className={d.overall > TOP_OVERALL ? "hl" : undefined}>
                        <td className="n">{d.h.toFixed(2)}</td>
                        <td className="n">{d.jac.toFixed(3)}</td>
                        <td className="n">{d.fid.toFixed(3)}</td>
                        <td className="n">{d.reach.toFixed(3)}</td>
                        <td className="n">{d.nmae.toFixed(3)}</td>
                        <td className="n"><b>{d.overall.toFixed(4)}</b></td>
                        <td className="n" style={{ color: "var(--pos)" }}>
                          {(d.overall / TOP_OVERALL).toFixed(2)}×
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <caption>全部为 scaled 值。<Chip p="derived" /></caption>
                </table>
              </div>
            </div>
            <div className="card">
              <h3>如果 pds / mse 也一起做好</h3>
              <div className="grid g3" style={{ marginBottom: 12 }}>
                {Object.entries(PAYOFF_FULL.parts).map(([k, v]) => (
                  <Stat key={k} k={k} v={(v >= 0 ? "+" : "") + v.toFixed(2)} />
                ))}
              </div>
              <Stat k={`h = ${PAYOFF_FULL.h}，pds raw 0.90，mse raw 0.75`}
                v={PAYOFF_FULL.overall.toFixed(4)}
                n={`= 当前第一名的 ${(PAYOFF_FULL.overall / TOP_OVERALL).toFixed(2)}×`} hero />
              <p style={{ fontSize: 13.5, marginTop: 12, marginBottom: 0, color: "var(--ink-2)" }}>
                注意 <code>mse</code> 被上限钳在 1，是六个里唯一两端有界的；其余五个上无界，
                所以强提交可以超过 1。别把分数当百分比读。
              </p>
            </div>
          </div>
        </Section>

        {/* --------------------------------------------------------- 08 预算 */}
        <Section id="budget" num="08" title="预算与算力"
          kicker={`${MACHINE.cpu} · ${MACHINE.ram} · ${MACHINE.gpu} · ${MACHINE.disk}`}>
          <div className="grid g2">
            <div className="card">
              <h3>实测预算</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <tbody>
                    {BUDGET.map((b) => (
                      <tr key={b.k}>
                        <td className="mono" style={{ minWidth: 130 }}>{b.k}</td>
                        <td className="n"><b>{b.v}</b></td>
                        <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{b.n}</td>
                      </tr>
                    ))}
                  </tbody>
                  <caption><Chip p="measured" /></caption>
                </table>
              </div>
            </div>
            <div className="card">
              <h3>pseudobulk 降维：为什么不需要下 61 GB</h3>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead><tr><th>数据集</th><th className="n">原始</th><th className="n">pseudobulk</th>
                    <th className="n">压缩</th></tr></thead>
                  <tbody>
                    {PSEUDOBULK_CUT.map((d) => (
                      <tr key={d.d}>
                        <td>{d.d}<div style={{ color: "var(--ink-3)", fontSize: 11.5 }}>{d.n}</div></td>
                        <td className="n">{d.raw}</td>
                        <td className="n"><b>{d.pb}</b></td>
                        <td className="n" style={{ color: "var(--stamp)" }}>{d.x}</td>
                      </tr>
                    ))}
                  </tbody>
                  <caption>
                    指标只读 pseudobulk 与逐基因矩量，训练素材也只需 per-perturbation pseudobulk。
                    流式提取，只保留 running sums，磁盘占用 ≈ 0。<Chip p="derived" />
                  </caption>
                </table>
              </div>
            </div>
          </div>

          <div className="note" style={{ marginTop: 14 }}>
            <b>唯一挡路的不是算法，是磁盘。</b> 整份提交 17.1 GB 装不进 16 GB 内存——
            解决办法是按扰动块追加写 h5ad（每块 19 MB，常驻 &lt;100 MB），而不是降低密度。
            公开数据集本身仍需 ~200 GB 落地空间。
          </div>
        </Section>

        {/* --------------------------------------------------------- 09 陷阱 */}
        <Section id="traps" num="09" title="会静默扣分的陷阱"
          kicker="全部不会报错，只会让结果看起来像「模型弱」。">
          <div className="tw">
            <table>
              <thead><tr><th>陷阱</th><th>后果</th><th className="n">来源</th></tr></thead>
              <tbody>
                {TRAPS.map((t) => (
                  <tr key={t.t}>
                    <td style={{ minWidth: 190 }}><b>{t.t}</b></td>
                    <td style={{ color: "var(--ink-2)" }}>{t.d}</td>
                    <td className="n">
                      <Chip p={t.who === "official" ? "official" : "measured"} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <caption>
                标「本机实测」的四条是我在本次工作中真的撞过的。
                <code>maximum.accumulate</code> 那条尤其阴险：BH 阶梯写反，发现数从 250 变成 0，
                零报错、零警告。
              </caption>
            </table>
          </div>
        </Section>

        {/* -------------------------------------------------------- 10 下一步 */}
        <Section id="next" num="10" title="下一步"
          kicker="整个流水线现在只缺 Stage 1。">
          <p className="lede">
            Stage 2 保证：<strong>只要能预测出「哪些基因响应、方向、幅度」，分数就是确定的</strong>——
            没有解码损失、没有采样方差、没有「模型输出到提交文件」之间的任何漏损。
            估计问题的规模是 300 个基因 × 3 个 context，训练素材 &lt; 2 GB。
            这是经典统计的尺寸，不是深度学习的尺寸。
          </p>

          <div className="grid g2" style={{ marginBottom: 14 }}>
            {ROADMAP.map((r) => (
              <div className="card" key={r.n} style={r.status === "next"
                ? { borderColor: "#b23a2b66", boxShadow: "inset 0 0 0 1px #b23a2b18" } : undefined}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                  <span className="sec-num" style={{ paddingTop: 0 }}>{String(r.n).padStart(2, "0")}</span>
                  <h3 style={{ flex: 1 }}>{r.t}</h3>
                  <span className="eyebrow" style={{ color: r.status === "next" ? "var(--pos)" : "var(--ink-3)" }}>
                    {r.status === "next" ? "进行中" : "排队"}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--pos)", fontFamily: "var(--mono)", marginBottom: 8 }}>
                  {r.why}
                </p>
                <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 0 }}>{r.d}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>已落盘的产出</h3>
            <div className="tw" style={{ border: 0 }}>
              <table>
                <tbody>
                  {ARTIFACTS.map((a) => (
                    <tr key={a.f}>
                      <td className="mono" style={{ minWidth: 190, color: "var(--neg)" }}>{a.f}</td>
                      <td style={{ color: "var(--ink-2)", fontSize: 13.5 }}>{a.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <div className="foot">
          <div>VCC 2026 方法与验证工作簿 · 修订 {REV}</div>
          <div>{TOOLS}</div>
          <div>
            全部数字或来自 Arc 官方页面与 metric spec，或在官方 controls.zip 上本机实测。
            推算项已标注。1.0 是地标不是上限，分数不是百分比。
          </div>
        </div>
      </main>
    </div>
  );
}
