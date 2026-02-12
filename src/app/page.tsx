"use client";

import Link from "next/link";
import LanguageToggle from "./components/LanguageToggle";
import type { Lang } from "./lib/i18n";
import { useLocalStorageState } from "./lib/useLocalStorageState";

function parseLang(raw: string | null): Lang {
  return raw === "en" ? "en" : "es";
}

const copy = {
  en: {
    title: "Natural Events Explainer",
    badge: "NASA EONET + RAG Agent",
    subtitle:
      "Explore live natural events and get a clear, friendly explanation powered by your RAG knowledge base.",
    ctaPrimary: "Explore events",
    ctaSecondary: "Read EONET docs",
    chips: ["Wildfires", "Severe storms", "Volcanoes"],
    sectionTitle: "How it works",
    steps: [
      {
        n: "1",
        title: "Pick a category",
        desc: "Only categories covered by your Knowledge Base.",
      },
      {
        n: "2",
        title: "Select an event",
        desc: "From the list or directly on the map.",
      },
      {
        n: "3",
        title: "Ask for an explanation",
        desc: "Get a structured answer with sources and limitations.",
      },
    ],
    featuresTitle: "What you can do",
    features: [
      {
        title: "Live data",
        desc: "Filter EONET events by days, status and supported category.",
        icon: "🛰️",
      },
      {
        title: "RAG explanations",
        desc: "Understand what the event means and how to read geometry/sources.",
        icon: "🧠",
      },
      {
        title: "Hackathon-ready MVP",
        desc: "No login, no database, just a clean demo with a real agent.",
        icon: "⚡",
      },
    ],
    footer: "Built with Next.js + Tailwind + TanStack Query.",
  },
  es: {
    title: "Natural Events Explainer",
    badge: "NASA EONET + Agente RAG",
    subtitle:
      "Explora eventos naturales en vivo y obtén una explicación clara y amigable usando tu Knowledge Base con RAG.",
    ctaPrimary: "Explorar eventos",
    ctaSecondary: "Ver docs de EONET",
    chips: ["Incendios", "Tormentas severas", "Volcanes"],
    sectionTitle: "Cómo funciona",
    steps: [
      {
        n: "1",
        title: "Elige una categoría",
        desc: "Solo categorías cubiertas por tu Knowledge Base.",
      },
      {
        n: "2",
        title: "Selecciona un evento",
        desc: "Desde la lista o directamente en el mapa.",
      },
      {
        n: "3",
        title: "Pide una explicación",
        desc: "Respuesta estructurada con fuentes y limitaciones.",
      },
    ],
    featuresTitle: "Qué puedes hacer",
    features: [
      {
        title: "Datos en vivo",
        desc: "Filtra eventos EONET por días, estado y categoría soportada.",
        icon: "🛰️",
      },
      {
        title: "Explicación con RAG",
        desc: "Entiende el significado e interpreta geometry/sources.",
        icon: "🧠",
      },
      {
        title: "MVP para hackathon",
        desc: "Sin login, sin BD, solo una demo clara con agente real.",
        icon: "⚡",
      },
    ],
    footer: "Hecho con Next.js + Tailwind + TanStack Query.",
  },
} as const;

export default function HomePage() {
  const [lang, setLang] = useLocalStorageState<Lang>("lang", "es", parseLang, (v) => v);
  const c = copy[lang];

  return (
    <main className="py-10 sm:py-14">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-950/50 flex items-center justify-center">
            🌍
          </div>
          <div className="leading-tight">
            <div className="text-sm text-zinc-400">{c.badge}</div>
            <div className="text-base font-semibold">{c.title}</div>
          </div>
        </div>

        <LanguageToggle lang={lang} onChange={setLang} />
      </div>

      {/* Hero */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 backdrop-blur">
        <div className="relative p-7 sm:p-10">
          {/* Hero glow */}
          <div className="pointer-events-none absolute -top-16 right-[-120px] h-64 w-64 rounded-full bg-white/6 blur-3xl" />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {c.title}
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-300 leading-relaxed">
                {c.subtitle}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {c.chips.map((x) => (
                  <span
                    key={x}
                    className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/30 px-3 py-1 text-xs text-zinc-200"
                  >
                    {x}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-5 py-3 font-medium text-zinc-900 hover:bg-white"
                >
                  {c.ctaPrimary}
                </Link>

                <a
                  href="https://eonet.gsfc.nasa.gov/docs/v3"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-950/20 px-5 py-3 text-zinc-100 hover:bg-zinc-800/40"
                >
                  {c.ctaSecondary}
                </a>
              </div>
            </div>

            {/* Right visual card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/30 p-5">
                <div className="text-xs text-zinc-500">
                  {lang === "en" ? "Preview" : "Vista previa"}
                </div>
                <div className="mt-2 text-sm font-semibold text-zinc-100">
                  {lang === "en"
                    ? "Explore → Select → Explain"
                    : "Explora → Selecciona → Explica"}
                </div>

                <div className="mt-4 space-y-3">
                  <SkeletonLine w="w-4/5" />
                  <SkeletonLine w="w-3/5" />
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-zinc-500">
                        {lang === "en" ? "Selected event" : "Evento seleccionado"}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {lang === "en" ? "Map highlight" : "Resaltado en mapa"}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-zinc-200">
                      {lang === "en"
                        ? "Tap a point → get a structured explanation."
                        : "Toca un punto → obtén una explicación estructurada."}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <TinyPill>{lang === "en" ? "Sources" : "Fuentes"}</TinyPill>
                    <TinyPill>{lang === "en" ? "Meaning" : "Significado"}</TinyPill>
                    <TinyPill>{lang === "en" ? "Limits" : "Límites"}</TinyPill>
                  </div>
                </div>

                <div className="mt-4 text-xs text-zinc-500">
                  {lang === "en"
                    ? "Built for DigitalOcean Gradient AI Hackathon."
                    : "Hecho para el hackathon de DigitalOcean Gradient AI."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* How it works */}
        <div className="p-7 sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold">{c.sectionTitle}</h2>
            <Link
              href="/explore"
              className="text-sm text-zinc-300 underline hover:text-white"
            >
              {lang === "en" ? "Open the explorer" : "Abrir el explorador"}
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {c.steps.map((s) => (
              <StepCard key={s.n} n={s.n} title={s.title} desc={s.desc} />
            ))}
          </div>

          <h3 className="mt-10 text-xl font-semibold">{c.featuresTitle}</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {c.features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-10 text-sm text-zinc-500">
        {c.footer}
      </footer>
    </main>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
      <div className="text-xs text-zinc-500">Step {n}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-100">{title}</div>
      <div className="mt-2 text-sm text-zinc-300 leading-relaxed">{desc}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-center">
          {icon}
        </div>
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
      </div>
      <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function SkeletonLine({ w }: { w: string }) {
  return <div className={`h-3 ${w} rounded-full bg-white/10`} />;
}

function TinyPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-zinc-800 bg-zinc-950/30 px-3 py-1 text-center text-[11px] text-zinc-300">
      {children}
    </div>
  );
}
