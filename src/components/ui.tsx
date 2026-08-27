import katex from "katex";
import type { ReactNode } from "react";
import type { Prov } from "../data/facts";

export function M({ tex, block }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, {
    displayMode: !!block,
    throwOnError: false,
    strict: false,
  });
  return block ? (
    <div className="mblock" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

const PROV_LABEL: Record<Prov, string> = {
  official: "官方",
  measured: "本机实测",
  derived: "推算",
  gap: "待验证",
};

export function Chip({ p, children }: { p: Prov; children?: ReactNode }) {
  const cls = p === "official" ? "official" : p === "measured" ? "measured" : p === "gap" ? "gap" : "derived";
  return (
    <span className={`chip ${cls}`}>
      {children ?? PROV_LABEL[p]}
    </span>
  );
}

export function Section({
  id, num, title, kicker, children,
}: { id: string; num: string; title: string; kicker?: string; children: ReactNode }) {
  return (
    <section id={id}>
      <div className="sec-head">
        <span className="sec-num">{num}</span>
        <div>
          <h2>{title}</h2>
          {kicker && <p>{kicker}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Stat({
  k, v, u, n, hero,
}: { k: string; v: string; u?: string; n?: string; hero?: boolean }) {
  return (
    <div className={hero ? "stat hero" : "stat"}>
      <span className="k">{k}</span>
      <span className="v">
        {v}
        {u && <span className="u">{u}</span>}
      </span>
      {n && <span className="n">{n}</span>}
    </div>
  );
}
