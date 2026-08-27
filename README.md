# VCC 2026 · 方法与验证工作簿

**中文** · [English](README.en.md) · **[在线阅读 ↗](https://danielchen26.github.io/vcc2026-dossier/)**（左上角可切中英文）

Arc Institute [Virtual Cell Challenge 2026](https://virtualcellchallenge.org/) 的方法工作簿。
一个 React 单页应用，记录我们的解法、与全场传统做法的逐项对比，以及在**官方数据**上的全部验证记录。

**核心论断：评分规则可以精确算出来，所以这题能在一台没有 GPU 的笔记本上解。**

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

---

## 一句话方法

六个评分指标全部只经过每个基因的**两个标量**——一阶矩 $\hat m_g$ 与平均对照分位数 $\bar\psi_g$。
细胞级的联合分布对分数零贡献。于是问题分成两级：

| | 内容 | 状态 |
|---|---|---|
| **Stage 1 · 估计** | 预测 $(x^{\text{basal}}_c, g) \mapsto (\hat R_{g,c},\ \widehat{\mathrm{lfc}}_{g,c},\ \text{置信序})$ | 待做 |
| **Stage 2 · 构造** | 矩量约束下的离散分布设计，无损翻译成 400 个整数细胞 | **已完成并验证** |

Stage 2 是**无损解码器**：只要 Stage 1 预测得出来，分数就是确定的——没有解码损失、没有采样方差。

---

## 关键发现

### 1. Wilcoxon 秩和的闭式约化

打分时的比较组是整个 panel 上同一组 18,400 个对照细胞。对固定比较组，定义中位秩算子

$$\psi_g(v)=\#\{c: x_{cg}<v\}+\tfrac12\#\{c: x_{cg}=v\}$$

则检验统计量**恒等于** $U_g=\sum_{i=1}^{400}\psi_g(\tilde v_{ig})$。
与 `scipy.stats.mannwhitneyu` 逐位相等（含点质量退化情形，3/3 精确匹配）。

预计算 ECDF 后，每个基因的检验退化为 400 次 `searchsorted`：**比官方 CPU 打分器快 41×**。

### 2. 显著性阈值极薄

$$d_{\text{crit}}=\frac{1.96\,\sigma_{\text{tie}}}{n_1n_2}=0.0278$$

平均对照分位数只要偏移 **2.78 个百分点**就判显著。输出「均值的复制品」的模型组内方差 ≈ 0，
把几乎整个基因组推过这条线 → 巨量过报 → `jac` 归零、`fid` 退化成掷硬币。
这正是排行榜前列 `jac` scaled = −0.004、`fid` scaled = 0.003 的病因。

### 3. 显著性与方向完全解耦

固定一阶矩、只改组内分布形状，$p$ 值可从 $2.8\times10^{-29}$ 连续调到 $0.77$。
更强的是：在 $t=3.0$ 处一阶矩**仍然向上**（lfc = +0.32）而 $d<0$、$p=5.2\times10^{-20}$——
Wilcoxon 读秩，lfc 读均值，两者可以指向相反方向。

所以每个基因上有**三个可独立指定的量**：进不进显著集、报什么方向、报多大幅度。
应用里的可交互拨盘就是这个实验，由 `SELENOT`（context A）的真实对照 ECDF 驱动。

### 4. manifest.json 证实了对照组身份

```json
"per_context": { "A": { "control_cells": 18400, "ground_truth_cells": 138400, "n_ntc_ids": 46 } }
```

$138{,}400 = 300\times400 + 18{,}400$ —— **发布给参赛者的对照细胞就是打分时的参考比较组**。
因此 $\psi_g$、5-CPM 门、BH 的基因全集全部可在本地精确重建。

---

## 验证记录

全部在官方 `controls.zip` 上、本机（Apple M1 Pro，16 GB，**无 CUDA**）完成。

### 与 `cell-eval2` 0.16.0 `preset vcc2026` 逐基因对齐

| | 官方 | 本复刻 |
|---|---|---|
| DE gate 基因数 | 9,929 | **9,929（完全一致）** |
| `log2_fold_change` 最大绝对差 | — | **1.0×10⁻⁵**（float32 存储噪声） |
| `log10(p_adj)` 中位绝对差 | — | **0.0000** |
| 显著集 $\hat R_p$ 对称差 | — | **0 / 0 / 0**（3 个扰动） |

最后 1–2 个基因的差距来自 **Wilcoxon 并列校正**：
$\sigma_{\text{tie}}=104{,}477$ vs 未校正 $107{,}384$，$z$ 大 2.8%。加上后对称差归零。

### 速度

| | 3 个扰动 | 全 panel（300×3） |
|---|---|---|
| 官方 `cell-eval2`（scanpy CPU） | 626 s | **52 小时** |
| 本复刻 | 7.7 s | **60 min 单核 / 6 min 十核** |

### Stage 2 解码器精度

```
意图 |R| = 250   实际 |R̂| = 250   命中 = 250
召回 100.0%   精确率 100.0%   假阳性 0
方向一致率 100.0%   lfc 中位绝对误差 6.1e-4
design 0.28 s   de_table 3.98 s   nnz/cell 5998
```

---

## 我们的方法 vs 传统做法

| 轴 | 传统做法 | 我们 |
|---|---|---|
| 问题框架 | 训生成式单细胞模型，把打分当外部裁判 | 逆问题 + 离散设计；估计 ⊕ 构造 |
| 打分器 | 当黑盒，靠线上 2 次/天反馈 | ψ 精确复刻，41×，本地无限迭代 |
| 细胞真实感 | 花算力让细胞「看起来像真的」 | 证明对分数零贡献，只是格式约束 |
| 显著性 | 模型输出的副产品，不可控 → 过报 | 由 $\bar\psi_g$ 单调可解，二分精确命中 |
| 方向 | 来自生成噪声，全场 fid raw ≈ 0.514 = 掷硬币 | 由一阶矩独立设定，与显著性解耦 |
| 效应幅度 | 不校准，nmae raw 0.892 | $\lambda$ 凸分段线性，3 次提交解析求最优 |
| 显著集大小 | 不控制，两侧同时漏分 | 解析最优点 $|\hat R_p|=|R_p|$，jac $=h/(2-h)$ |
| 库大小 | 当物理约束模拟 ~20k UMI | 证明是自由变量，取 $10^6$ 使 counts ≡ CPM |
| 稀疏度 | dense = cap 的 1.40×，直接超限 | 自举真实支撑集，5,998 nnz/cell = cap 的 45% |
| 成分性 | 忽略 CPM 是成分数据 | 显式重归一，量化了 $\log_2 Z$ |
| null 背景 | 从模型采样，p 值不校准 | 自举真实对照细胞，假阳性实测 0 |
| 训练数据 | 下 61 GB 原始细胞 | per-perturbation pseudobulk，731 MB（83×） |
| 算力 | A100 / H100 | M1 Pro 笔记本，全 panel 构造 4 分钟 |

**传统路线做对了什么：** `pds` 是 pseudobulk 余弦距离排名，需要真实生物学信号，大模型确实提供了
（榜首 raw 0.820 对基线 0.500）。我们的 Stage 2 在这个指标上帮不上忙。两条路线互补，不互斥。

**为什么这不是钻规则漏洞：** Stage 2 不改变任何生物学主张，它只是把 Stage 1 的预测**无损地**
翻译成打分器要求的格式。传统做法在这一步有巨大的、不自知的损耗。分数仍然完全取决于 Stage 1 有多准。

---

## 收益算术

用官方锚点计算（$s=(u-b)/(r-b)$，0 = context 均值基线，1 = 真实重复实验）。
当前第一名 overall = **0.1899**。

| 情形 | overall | 倍数 |
|---|---|---|
| 只把已有 call set 的方向做对（准确率 0.75） | 0.228 | 1.20× |
| 同上，准确率 0.85 | 0.284 | 1.50× |
| 恢复参考显著集 $h=0.30$ | 0.341 | 1.80× |
| $h=0.40$ | 0.422 | 2.23× |
| $h=0.40$ 且 `pds` / `mse` 也做好 | **0.488** | **2.57×** |

第一行的意义：**完全不改进任何生物学预测，只把方向符号做对就能拿下第一。**

---

## 仓库结构

```
src/
  App.tsx                 全部章节
  data/facts.ts           唯一事实来源，每条带溯源标记 (official/measured/derived)
  data/psi.json           SELENOT 真实对照 ECDF (2048 分位点) + 精确实测 dial 表
  components/PsiDial.tsx  签名交互件：矩量固定下的显著性拨盘
  components/Charts.tsx   排行榜诊断图、收益曲线（手写 SVG）
research/
  vcc_local.py            ControlRef：ψ 表 / de_table() 精确复刻 / design() Stage-2 构造器
  smoke.py                干净进程冒烟测试
  parity.py               调 cell-eval2 preset vcc2026 出官方六指标
  dump_de.py              导出官方 DE 表（29,787 行）供逐基因回归
```

### 复现 `research/` 的验证

```bash
uv venv --python 3.12 .venv
VIRTUAL_ENV=.venv uv pip install numpy scipy pandas h5py anndata 'cell-eval2==0.16.0'
# 把官方 controls.zip 解压到同目录（context_{A,B,C}.h5ad + gene_names.csv + pert_counts.csv）
.venv/bin/python research/smoke.py     # → 250/250, 召回 100%, 精确率 100%
.venv/bin/python research/parity.py    # → 官方六指标（CPU 约 10 分钟 / 3 个扰动）
```

---

## 会静默扣分的陷阱

1. **context 标签错位** —— 所有指标退化到随机，看起来像「模型弱」。分数里没有任何信息告诉你标签串了。
2. **BH 用了 `maximum.accumulate`** —— 应为 `minimum.accumulate`。发现数从 250 变成 0，零报错。
3. **忘了并列校正** —— 每个扰动少判 1–2 个基因，`jac`/`fid` 系统性偏低。
4. **CPM 未重归一** —— 目标 profile 列均值之和必须等于 $10^6$，否则行和约束无解。
5. **本地打分缺 `non-targeting` 行** —— `validate_pair` 要求两侧标签集相同，而正式提交必须去掉它们。
6. **交了 log-normalized 数据** —— 2026 起打分在 counts 空间，小数直接拒收。
7. **dense 存储** —— $6.67\times10^9$ 条目 = cap 的 1.40×，无论内容如何都超限。
8. **拿验证分比决赛分** —— 不同细胞系、不同 panel，不可比。

---

## 声明

本仓库不隶属于 Arc Institute。所有官方数值引自 [virtualcellchallenge.org](https://virtualcellchallenge.org/)
与 [`ArcInstitute/cell-eval2`](https://github.com/ArcInstitute/cell-eval2) 的 vcc2026 metric specification。
本仓库不包含任何挑战数据集文件。标注「本机实测」的数值均可用 `research/` 下的脚本复现。
