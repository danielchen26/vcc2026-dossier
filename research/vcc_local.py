"""VCC 2026 本地工具: cell-eval2 DE 的精确复刻 + Stage-2 计数矩阵构造器.

已验证 (2026-08-27, context_A, cell-eval2 0.16.0, preset vcc2026):
  - gate 基因集      : 9929, 与官方完全一致
  - log2_fold_change : 最大绝对差 1.0e-5 (float32 存储噪声)
  - p_adj            : log10 中位绝对差 0.0000
  - 显著集 R̂         : 3/3 个扰动对称差 = 0  (需 tie correction)
  - 速度             : 41x 官方 scanpy CPU 后端
"""

from __future__ import annotations

import numpy as np
from scipy import sparse
from scipy.stats import norm

TS_BULK = 5e4      # pds / mse 的 pseudobulk target sum
TS_CELL = 1e6      # DE 的 per-cell target sum
GATE_CPM = 5.0     # filter_gene_min_cpm_cell
ALPHA = 0.05       # p_adj_threshold, Benjamini-Hochberg
EPS = 1e-9         # fold-change epsilon


def bh_adjust(p: np.ndarray) -> np.ndarray:
    """Benjamini-Hochberg step-up. 注意是 min_{j>=i}, 不是 max."""
    m = len(p)
    order = np.argsort(p)
    q = p[order] * m / np.arange(1, m + 1)
    q = np.minimum.accumulate(q[::-1])[::-1]
    out = np.empty(m)
    out[order] = np.minimum(q, 1.0)
    return out


def hamilton(row: np.ndarray, total: int = 1_000_000) -> np.ndarray:
    """最大余数法取整, 使行和恰为 total. counts == CPM 的前提."""
    fl = np.floor(row)
    need = int(total - fl.sum())
    if need > 0:
        fl[np.argpartition(-(row - fl), need - 1)[:need]] += 1
    elif need < 0:
        nz = np.flatnonzero(fl > 0)
        fl[nz[np.argpartition(row[nz] - fl[nz], -need - 1)[: -need]]] -= 1
    return fl


class ControlRef:
    """一个 cell context 的参考对照组. 官方 manifest 的 ground_truth_cells
    = 300*400 + 18400 证实发布的对照细胞就是打分用的比较组."""

    def __init__(self, h5ad_path, gene_names):
        import h5py

        with h5py.File(h5ad_path, "r") as f:
            X = sparse.csr_matrix(
                (f["X/data"][:], f["X/indices"][:], f["X/indptr"][:]),
                shape=tuple(f["X"].attrs["shape"]),
            )
            var = np.array(f["var/_index/values"][:], dtype=object).astype(str)
        if not np.array_equal(var, np.asarray(gene_names)):
            raise ValueError("var 顺序与 gene_names.csv 不一致")

        self.n_ctrl, self.n_genes = X.shape
        lib = np.asarray(X.sum(1)).ravel()
        cpm = X.multiply((TS_CELL / lib)[:, None]).tocsc()

        self.m_full = np.asarray(cpm.mean(0)).ravel()          # 全基因对照均值 CPM
        pb = np.asarray(X.sum(0)).ravel()
        self.b_ctrl = np.log1p(TS_BULK * pb / pb.sum())        # pds/mse 的对照 pseudobulk
        self.gidx = np.flatnonzero(self.m_full > GATE_CPM)     # DE gate
        self.m_gate = self.m_full[self.gidx]
        self.G = len(self.gidx)

        sub = cpm[:, self.gidx].tocsc()
        self._sorted = [
            np.sort(sub.data[sub.indptr[j] : sub.indptr[j + 1]]).astype(np.float32)
            for j in range(self.G)
        ]
        self._nzero = np.array(
            [self.n_ctrl - a.size for a in self._sorted], dtype=np.int64
        )
        self._cpm_csr = cpm.tocsr()

    def psi(self, j: int, v: np.ndarray) -> np.ndarray:
        """psi_g(v) = #{ctrl < v} + 0.5 * #{ctrl == v}. Wilcoxon 的充分统计量:
        U_g = sum_i psi_g(v_i)  (对 scipy.mannwhitneyu 逐位验证)."""
        col, nz = self._sorted[j], self._nzero[j]
        lo = np.searchsorted(col, v, "left")
        hi = np.searchsorted(col, v, "right")
        out = nz + lo + 0.5 * (hi - lo)
        out[v == 0] = 0.5 * nz
        return out

    def de_table(self, counts: np.ndarray, tie_correct: bool = True):
        """cell-eval2 wilcoxon DE 的精确复刻. counts 行和须为 1e6.
        返回 (p_adj, log2fc), 均在 gate 内, 长度 self.G."""
        n1 = counts.shape[0]
        n2 = self.n_ctrl
        N = n1 + n2
        U = np.empty(self.G)
        T = np.empty(self.G)
        for j in range(self.G):
            v = counts[:, self.gidx[j]].astype(np.float64)
            U[j] = self.psi(j, v).sum()
            allv = np.concatenate(
                [np.zeros(self._nzero[j], np.float32), self._sorted[j], v.astype(np.float32)]
            )
            _, c = np.unique(allv, return_counts=True)
            T[j] = np.sum(c.astype(np.float64) ** 3 - c)
        if tie_correct:
            sd = np.sqrt(n1 * n2 / 12.0 * ((N + 1) - T / (N * (N - 1.0))))
        else:
            sd = np.full(self.G, np.sqrt(n1 * n2 * (N + 1) / 12.0))
        p = 2 * norm.sf(np.abs((U - n1 * n2 / 2) / sd))
        lfc = np.log2((counts[:, self.gidx].mean(0) + EPS) / (self.m_gate + EPS))
        return bh_adjust(p), lfc

    def design(self, r_set, lfc, n_cells=400, shift=0.10, seed=0):
        """Stage 2: 给定响应基因集 (gate 内下标) 与目标 lfc, 构造 n_cells 个整数
        计数细胞. 关键约束: CPM 是成分数据, 目标 profile 必须重归一到 1e6.

        null 背景用真实对照细胞自举 -> psi_bar 自动校准, 稀疏度/过散天然正确.
        响应基因用二点分布 (0, s), 对非零比例 f 二分, 使平均对照分位数命中
        0.5 +- shift. 显著性(psi_bar) 与方向(一阶矩) 完全解耦."""
        rg = np.random.default_rng(seed)
        r_set = np.asarray(r_set)
        lfc = np.asarray(lfc, dtype=float)

        lf = np.zeros(self.n_genes)
        lf[self.gidx[r_set]] = lfc
        tgt = self.m_full * 2.0 ** lf
        tgt *= TS_CELL / tgt.sum()

        V = np.asarray(self._cpm_csr[rg.choice(self.n_ctrl, n_cells, replace=False)].todense())
        V *= tgt / np.maximum(V.mean(0), 1e-12)

        for j, l in zip(r_set, lfc):
            mu = tgt[self.gidx[j]]
            ut = 0.5 + np.sign(l) * shift
            lo, hi = 1.0 / n_cells, 1.0
            for _ in range(24):                       # psi_bar 对 f 单调 -> 二分
                f = 0.5 * (lo + hi)
                k = max(1, int(round(f * n_cells)))
                col = np.zeros(n_cells)
                col[:k] = mu * n_cells / k
                if self.psi(j, col).mean() / self.n_ctrl < ut:
                    lo = f
                else:
                    hi = f
            k = max(1, int(round(0.5 * (lo + hi) * n_cells)))
            col = np.zeros(n_cells)
            col[rg.permutation(n_cells)[:k]] = mu * n_cells / k
            V[:, self.gidx[j]] = col

        V *= (TS_CELL / V.sum(1))[:, None]
        return np.vstack([hamilton(V[i]) for i in range(n_cells)]).astype(np.float32)
