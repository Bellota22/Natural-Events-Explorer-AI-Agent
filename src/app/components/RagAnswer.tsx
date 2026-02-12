"use client";

import type { Lang } from "../lib/i18n";

type SourceItem =
  | string
  | { label?: string; title?: string; url?: string }
  | { name?: string; url?: string };

function tryParseJson(raw: string): any | null {
  const t = raw?.trim?.() ?? "";
  if (!t) return null;

  // 1) parse directo
  try {
    return JSON.parse(t);
  } catch {}

  // 2) intentar extraer primer {...} (por si viene con texto alrededor)
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const slice = t.slice(first, last + 1);
    try {
      return JSON.parse(slice);
    } catch {}
  }

  return null;
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter((x) => x.trim().length > 0);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function normalizeSources(v: unknown): Array<{ label: string; url?: string }> {
  if (!Array.isArray(v)) return [];
  return (v as SourceItem[])
    .map((s: any) => {
      if (typeof s === "string") return { label: s };
      const label = String(s?.label ?? s?.title ?? s?.name ?? s?.url ?? "Source");
      const url = s?.url ? String(s.url) : undefined;
      return { label, url };
    })
    .filter((x) => x.label && x.label !== "Source");
}

function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

export default function RagAnswer({
  lang,
  data,
  raw,
}: {
  lang: Lang;
  data: any | null;
  raw: string;
}) {
  // ✅ si data no viene, intenta parsear raw (tu caso del screenshot)
  const obj = (data && typeof data === "object" ? data : null) ?? tryParseJson(raw);

  // si no hay objeto, muestra raw bonito
  if (!obj || typeof obj !== "object") {
    return (
      <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="text-xs text-zinc-500">{lang === "en" ? "Answer" : "Respuesta"}</div>
        <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">
          {raw || (lang === "en" ? "No answer yet." : "Aún no hay respuesta.")}
        </pre>
      </div>
    );
  }

  // ✅ soporta tus keys: summary, meaning, how_to_read, sources, limitations, next_steps
  const summary = String(pick(obj, ["summary"]) ?? "").trim();

  const meaning = asArray(pick(obj, ["meaning", "what_is_happening", "what", "details"]));
  const howToRead = asArray(pick(obj, ["how_to_read", "how_to_interpret", "how_to_use"]));
  const limitations = asArray(pick(obj, ["limitations", "caveats", "uncertainty"]));
  const nextSteps = asArray(pick(obj, ["next_steps", "recommended_actions", "actions"]));

  const sources = normalizeSources(pick(obj, ["sources", "references", "links"]));

  return (
    <div className="mt-3 space-y-4">
      {summary ? (
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950/70 to-zinc-950/30 p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl border border-zinc-800 bg-zinc-950/50 flex items-center justify-center">
              ✨
            </div>
            <div className="text-sm font-semibold text-zinc-100">
              {lang === "en" ? "Summary" : "Resumen"}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-100">{summary}</p>
        </div>
      ) : null}

      {meaning.length ? (
        <Section title={lang === "en" ? "Meaning" : "Qué significa"}>
          <Bullets items={meaning} />
        </Section>
      ) : null}

      {howToRead.length ? (
        <Section title={lang === "en" ? "How to read this" : "Cómo leerlo"}>
          <Bullets items={howToRead} />
        </Section>
      ) : null}

      {limitations.length ? (
        <Section title={lang === "en" ? "Limitations" : "Limitaciones"}>
          <Bullets items={limitations} />
        </Section>
      ) : null}

      {nextSteps.length ? (
        <Section title={lang === "en" ? "Next steps" : "Próximos pasos"}>
          <Bullets items={nextSteps} />
        </Section>
      ) : null}

      {sources.length ? (
        <Section title={lang === "en" ? "Sources" : "Fuentes"}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {sources.slice(0, 8).map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3"
              >
                <div className="text-xs text-zinc-500">{lang === "en" ? "Source" : "Fuente"}</div>
                {s.url ? (
                  <a
                    className="mt-1 block break-all text-sm text-zinc-100 underline hover:text-white"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.label}
                  </a>
                ) : (
                  <div className="mt-1 break-all text-sm text-zinc-100">{s.label}</div>
                )}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Debug opcional (para ti), colapsado */}
      <details className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3">
        <summary className="cursor-pointer text-xs text-zinc-400">
          {lang === "en" ? "Show raw JSON" : "Ver JSON crudo"}
        </summary>
        <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-200">
          {JSON.stringify(obj, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm font-semibold text-zinc-100">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-zinc-100">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-zinc-400" />
          <span className="leading-relaxed">{x}</span>
        </li>
      ))}
    </ul>
  );
}
