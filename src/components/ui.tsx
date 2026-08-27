import katex from "katex";
import type { ReactNode } from "react";
import type { Prov } from "../data/facts";
import { useLang, type L, type LN } from "../i18n";

export function M({ tex, block }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: !!block, throwOnError: false, strict: false });
  return block ? (
    <div className="mblock" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

const PROV_LABEL: Record<Prov, L> = {
  official: { zh: "官方公布", en: "From the organisers" },
  measured: { zh: "本机实测", en: "We measured it" },
  derived: { zh: "算出来的", en: "Arithmetic" },
  gap: { zh: "待验证", en: "Unverified" },
};

export function Chip({ p, children }: { p: Prov; children?: ReactNode }) {
  const lang = useLang();
  return <span className={`chip ${p}`}>{children ?? PROV_LABEL[p][lang]}</span>;
}

export function Section({
  id, num, title, kicker, children,
}: { id: string; num: string; title: LN; kicker?: LN; children: ReactNode }) {
  const lang = useLang();
  return (
    <section id={id}>
      <div className="sec-head">
        <span className="sec-num">{num}</span>
        <div>
          <h2>{title[lang]}</h2>
          {kicker && <p>{kicker[lang]}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Stat({
  k, v, u, n, hero,
}: { k: ReactNode; v: ReactNode; u?: ReactNode; n?: ReactNode; hero?: boolean }) {
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

/** 一段「说人话」的导语框 */
export function Plain({ children }: { children: ReactNode }) {
  const lang = useLang();
  return (
    <div className="plain">
      <span className="plain-tag">{lang === "zh" ? "一句话" : "In short"}</span>
      <div>{children}</div>
    </div>
  );
}
