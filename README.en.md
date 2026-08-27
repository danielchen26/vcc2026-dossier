# VCC 2026 · Method & Verification Notebook

**English** · [中文](README.md) · **[Live site ↗](https://danielchen26.github.io/vcc2026-dossier/)** (language toggle in the top-left)

A React single-page notebook for Arc Institute's [Virtual Cell Challenge 2026](https://virtualcellchallenge.org/).
It records our approach, an aspect-by-aspect comparison against what the rest of the field is doing, and
every verification we ran **against the official data**.

**The claim: the scoring rule is exactly computable, so this problem can be solved on a laptop with no GPU.**

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

---

## The method in one paragraph

All six scoring metrics pass through only **two numbers per gene** — the average of your 400 cells, and
their average rank inside the control cells. Nothing reads how the cells co-vary. So the job splits in two:

| | What it does | Status |
|---|---|---|
| **Stage 1 · predict** | Which genes changed, up or down, by how much | To do |
| **Stage 2 · construct** | Write that answer as 400 whole-number cells, losing nothing | **Done and verified** |

Stage 2 is a **lossless decoder**: whatever stage 1 predicts, the score follows deterministically — no
decoding loss, no sampling variance.

---

## What we found

### 1. The rank-sum test collapses into a lookup

The comparison group is the same 18,400 control cells for the entire competition. For a fixed comparison
group, define the mid-rank operator

$$\psi_g(v)=\#\{c: x_{cg}<v\}+\tfrac12\#\{c: x_{cg}=v\}$$

and the test statistic is **identically** $U_g=\sum_{i=1}^{400}\psi_g(v_i)$ — bit-for-bit equal to
`scipy.stats.mannwhitneyu`, including the degenerate case where all 400 cells are identical (3/3 exact).

Pre-sort the controls once and each gene's test becomes 400 binary searches. Comparisons per gene drop
from 266,960 to 5,668 — **41× faster than the official CPU scorer**, measured.

### 2. The significance threshold is razor-thin

$$d_{\text{crit}}=\frac{1.96\,\sigma_{\text{tie}}}{n_1n_2}=0.0278$$

Move a gene's average percentile within the controls by **2.78 points** and it is called changed. Models
that emit 400 near-identical cells have almost no between-cell variation, so nearly the whole genome
crosses that line. That is why the leaders score −0.004 and 0.003 on two of the six metrics.

### 3. Significance and direction are independent dials

Hold the average fixed and change only how expression is spread across the 400 cells: $p$ swings from
$2.8\times10^{-29}$ to $0.77$. More striking still, at one setting the average is **up 25%** while the test
reads the gene as moving **down**, at $p=5.2\times10^{-20}$. The test reads ranks; the fold change reads the
average. The interactive dial on the site is this experiment, driven by the real control distribution of
gene `SELENOT`.

### 4. The official manifest settles a key question

```json
"per_context": { "A": { "control_cells": 18400, "ground_truth_cells": 138400, "n_ntc_ids": 46 } }
```

$138{,}400 = 300\times400 + 18{,}400$ — **the control cells handed to participants are exactly the group the
scorer compares against**. So the control distribution, the 5 ppm filter, and the gene universe for
multiple-testing correction can all be rebuilt locally, exactly.

---

## Verification

All of it on the official `controls.zip`, on one Apple M1 Pro, 16 GB, **no CUDA**.

### Gene-by-gene against `cell-eval2` 0.16.0, `preset vcc2026`

| | Official | Our reimplementation |
|---|---|---|
| Genes entering the test | 9,929 | **9,929 (identical)** |
| Max deviation in `log2_fold_change` | — | **1.0×10⁻⁵** (float storage precision) |
| Median difference in `log10(p_adj)` | — | **0.0000** |
| Disagreement in the set called changed | — | **0 / 0 / 0 genes** (three groups) |

The last 1–2 genes came down to **Wilcoxon tie correction**: $\sigma_{\text{tie}}=104{,}477$ against
$107{,}384$ uncorrected, tightening $z$ by 2.8%. With it, the disagreement is zero.

### Speed

| | 3 groups | Full panel (300 × 3) |
|---|---|---|
| Official `cell-eval2` (scanpy, CPU) | 626 s | **52 hours** |
| Our reimplementation | 7.7 s | **60 min single-core / 6 min on ten cores** |

### Stage 2 decoder accuracy

```
aimed to flag 250   actually flagged 250   correct 250
recall 100.0%   precision 100.0%   false flags 0
direction 100.0%   median effect-size error 6.1e-4
construct 0.28 s   score 3.98 s   nonzeros/cell 5998
```

---

## Ours vs the usual approach

| Aspect | The usual approach | Ours |
|---|---|---|
| Framing | Train a generative single-cell model, treat the scorer as an external judge | Work out what the scorer reads, then predict + construct |
| The scorer | Black box; two online submissions a day | Reimplemented, 41× faster, unlimited local runs |
| Cell realism | Spend compute making cells look real | Proved it earns zero points; it is a formatting requirement |
| Significance | A by-product of whatever the model emitted | Monotone in one quantity; bisect to hit it exactly |
| Direction | Comes out of generation noise; field sits at coin-flip | Set by the average alone, independent of significance |
| Effect size | Uncalibrated; field scores 0.892 vs 1.0013 for "no change" | Convex piecewise-linear in one factor; three submissions bracket it |
| How many genes to flag | Uncontrolled; penalised at both ends | Closed form: exactly as many as really changed |
| Sequencing depth | Mimic ~20,000 as a physical constraint | Free parameter; set it to 10⁶ so counts equal parts-per-million |
| Density | A dense array is 1.40× the cap and rejected | Borrow the real support pattern: 45% of the cap |
| Compositionality | Add the change onto the average, ignoring the sum-to-a-million constraint | Renormalise explicitly; the global shift is measured |
| Unchanged genes | Sampled from the model, so p-values are uncalibrated | Copy the real controls; false flags measured zero |
| Training data | Download 61 GB of raw cells | Per-perturbation averages only: 731 MB, 83× smaller |
| Hardware | A100 / H100 | One M1 Pro laptop; full submission in 4 minutes |

**What the conventional route gets right:** telling perturbations apart needs real biological signal, and
large models supply it (leader's raw 0.820 against a 0.500 baseline). Our stage 2 contributes nothing there.
The two routes are complementary, not mutually exclusive.

**Why this isn't gaming the rules:** stage 2 makes no biological claim. It translates stage 1's prediction
into the required format without loss. The conventional route has a large unrecognised loss at exactly that
step. The score still depends entirely on how good stage 1 is.

---

## What it's worth

Computed from the organisers' published reference points ($s=(u-b)/(r-b)$, where 0 = the cell-line average
baseline and 1 = a real repeat experiment). Today's leader totals **0.1899**.

| Scenario | Total | ×leader |
|---|---|---|
| Fix only the up/down call on genes already flagged (accuracy 0.75) | 0.228 | 1.20× |
| Same, accuracy 0.85 | 0.284 | 1.50× |
| Recover 30% of the genes that really changed | 0.341 | 1.80× |
| Recover 40% | 0.422 | 2.23× |
| Recover 40%, plus the other two metrics done well | **0.488** | **2.57×** |

The first row matters most: **with no improvement in biology at all, getting the direction right wins.**

---

## Repository layout

```
src/
  App.tsx                 all ten sections
  copy.tsx                bilingual prose (zh / en), field-for-field aligned
  i18n.tsx                language context, toggle, localStorage persistence
  data/facts.ts           single source of truth; every entry carries a provenance tag
  data/psi.json           real control distribution for SELENOT + exact measured dial table
  components/PsiDial.tsx  the interactive significance dial
  components/Charts.tsx   leaderboard diagnosis and payoff curve (hand-written SVG)
research/
  vcc_local.py            lookup tables, exact reimplementation of the scorer, stage-2 builder
  smoke.py                clean-process smoke test
  parity.py               runs the official cell-eval2 over all six metrics
  dump_de.py              exports the official per-gene table (29,787 rows)
```

### Reproducing the verification

```bash
uv venv --python 3.12 .venv
VIRTUAL_ENV=.venv uv pip install numpy scipy pandas h5py anndata 'cell-eval2==0.16.0'
# unzip the official controls.zip here (context_{A,B,C}.h5ad + gene_names.csv + pert_counts.csv)
.venv/bin/python research/smoke.py     # → 250/250, recall 100%, precision 100%
.venv/bin/python research/parity.py    # → the official six metrics (~10 min CPU for 3 groups)
```

---

## Traps that cost points silently

1. **Cell-line labels get swapped** — every metric collapses to chance and it just looks like a weak model.
2. **Multiple-testing correction reversed** — `minimum.accumulate`, not `maximum`. Discoveries drop 250 → 0 with no error.
3. **Tie correction forgotten** — one or two genes short per group; two metrics come in systematically low.
4. **Parts-per-million don't sum to a million** — the per-cell totals then have no solution.
5. **Local scoring needs control rows; the real submission must not have them.**
6. **Log-normalised values** — scoring runs in raw counts; fractional values are rejected.
7. **A dense array** — 6.67×10⁹ stored numbers is 1.40× the cap regardless of contents.
8. **Comparing validation and final scores** — different cell lines, different panels, not comparable.

---

## Disclaimer

Not affiliated with Arc Institute. All official figures are cited from
[virtualcellchallenge.org](https://virtualcellchallenge.org/) and the vcc2026 metric specification in
[`ArcInstitute/cell-eval2`](https://github.com/ArcInstitute/cell-eval2). This repository contains no
challenge dataset files. Everything marked "we measured it" is reproducible with the scripts in `research/`.
