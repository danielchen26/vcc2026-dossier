import anndata as ad
from cell_eval2.de_compute import compute_de
a = ad.read_h5ad("parity_pred.h5ad")
df = compute_de(a, backend="scanpy", groupby="target_gene", reference="non-targeting",
                mean_calc="arithmetic", epsilon=1e-9, input_type="counts", target_sum=1e6,
                clip_value=None, filter_gene_min_cpm_cell=5.0, fdr_scope="per_pert",
                threads=-1, device="cpu")
print(df.columns); print(df.shape)
df.write_parquet("de_pred_official.parquet")
