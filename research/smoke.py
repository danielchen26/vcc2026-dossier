import time, numpy as np, pandas as pd
from vcc_local import ControlRef

genes = pd.read_csv("gene_names.csv")["gene_name"].to_numpy()
t0 = time.time(); ref = ControlRef("context_A.h5ad", genes); t_load = time.time()-t0
print(f"ControlRef 加载: {t_load:.1f}s   gate={ref.G}   对照细胞={ref.n_ctrl}")

rg = np.random.default_rng(42)
R = rg.choice(ref.G, 250, replace=False)
lfc = rg.choice([-1, 1], 250) * rg.uniform(0.4, 2.2, 250)

t0 = time.time(); C = ref.design(R, lfc, seed=1); t_des = time.time()-t0
assert np.all(C.sum(1) == 1_000_000) and np.all(C >= 0) and np.all(C == np.floor(C))
t0 = time.time(); padj, lf = ref.de_table(C); t_de = time.time()-t0

R_hat = np.flatnonzero(padj < 0.05)
intended = np.zeros(ref.G, bool); intended[R] = True
realized = np.zeros(ref.G, bool); realized[R_hat] = True
tp = int((intended & realized).sum())
print(f"design: {t_des:.2f}s   de_table: {t_de:.2f}s   nnz/cell={np.mean((C>0).sum(1)):.0f}")
print(f"意图 |R|={len(R)}  实际 |R̂|={len(R_hat)}  命中={tp}  "
      f"召回={tp/len(R):.1%}  精确率={tp/max(len(R_hat),1):.1%}")
print(f"方向一致率={np.mean(np.sign(lf[R])==np.sign(lfc)):.1%}")
print(f"外推 900 个 (pert,context): design {t_des*900/60:.0f} min, "
      f"de_table {t_de*900/60:.0f} min (单核)")
