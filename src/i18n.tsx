import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "zh" | "en";

/** 可本地化字符串 */
export type L = { zh: string; en: string };
/** 可本地化富文本（含数学、代码、强调） */
export type LN = { zh: ReactNode; en: ReactNode };

const LangCtx = createContext<Lang>("zh");

const STORAGE_KEY = "vcc-lang";

export function LangProvider({ children }: { children: (lang: Lang, set: (l: Lang) => void) => ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "zh" || saved === "en") return saved;
    return typeof navigator !== "undefined" && navigator.language.startsWith("zh") ? "zh" : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = lang === "zh"
      ? "VCC 2026 · 方法与验证工作簿"
      : "VCC 2026 · Method and Verification Notebook";
  }, [lang]);

  return <LangCtx.Provider value={lang}>{children(lang, setLang)}</LangCtx.Provider>;
}

/** 取当前语言的字符串或节点 */
export function useT() {
  const lang = useContext(LangCtx);
  return <V extends L | LN>(v: V) => v[lang] as V extends L ? string : ReactNode;
}

export function useLang() {
  return useContext(LangCtx);
}

/** 内联渲染一段双语富文本 */
export function T({ v }: { v: LN }) {
  const lang = useContext(LangCtx);
  return <>{v[lang]}</>;
}

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="langtog" role="group"
      aria-label={lang === "zh" ? "切换语言" : "Switch language"}>
      {(["zh", "en"] as const).map((l) => (
        <button key={l} type="button" onClick={() => onChange(l)}
          aria-pressed={lang === l} className={lang === l ? "on" : undefined}>
          {l === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
  );
}
