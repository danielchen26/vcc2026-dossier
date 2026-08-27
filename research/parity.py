from dataclasses import replace
from cell_eval2 import compute_metrics, EvalConfig
cfg = EvalConfig.from_preset("vcc2026")
cfg = replace(cfg, pert_col="target_gene", device="cpu")
cfg = replace(cfg, de=replace(cfg.de, backend="scanpy"))
df = compute_metrics("parity_pred.h5ad", "parity_real.h5ad", config=cfg)
import polars as pl
pl.Config.set_tbl_rows(60); pl.Config.set_tbl_width_chars(200)
print(df)
