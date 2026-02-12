"use client";

import type { Lang } from "../lib/i18n";

export default function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (v: Lang) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-zinc-800 bg-zinc-950/30 p-1">
      <button
        type="button"
        onClick={() => onChange("es")}
        className={[
          "rounded-xl px-3 py-1.5 text-sm transition",
          lang === "es"
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-200 hover:bg-zinc-800/40",
        ].join(" ")}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={[
          "rounded-xl px-3 py-1.5 text-sm transition",
          lang === "en"
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-200 hover:bg-zinc-800/40",
        ].join(" ")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
