"use client";

import { useMemo, useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { EonetGeoJsonFeature, EonetGeoJsonResponse } from "../lib/types";
import { getPointLatLngFromGeoJSON } from "../lib/geo";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";

import LanguageToggle from "../components/LanguageToggle";
import dynamic from "next/dynamic";

const EventsMap = dynamic(() => import("../components/EventsMap"), {
  ssr: false,
});
import RagAnswer from "../components/RagAnswer";

import { useLocalStorageState } from "../lib/useLocalStorageState";

function dedupeByEventId(features: EonetGeoJsonFeature[]) {
  const seen = new Set<string>();
  const out: EonetGeoJsonFeature[] = [];
  for (const f of features) {
    const id = f?.properties?.id;
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(f);
  }
  return out;
}

const SUPPORTED = ["wildfires", "severeStorms", "volcanoes"] as const;
const ALL_SUPPORTED = SUPPORTED.join(",");

function parseLang(raw: string | null): Lang {
  return raw === "en" ? "en" : "es";
}

export default function ExplorePage() {
  const [lang, setLang] = useLocalStorageState<Lang>(
    "lang",
    "es",
    parseLang,
    (v) => v,
  );

  const [category, setCategory] = useState<string>(ALL_SUPPORTED);
  const [days, setDays] = useState<number>(7);
  const [status, setStatus] = useState<string>("open");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [question, setQuestion] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const eventsQ = useQuery({
    queryKey: ["eonet", "events", { category, days, status }],
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("status", status);
      qs.set("days", String(days));
      if (category) qs.set("category", category);

      const r = await fetch(`/api/eonet/events?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error("events error");
      const j = (await r.json()) as EonetGeoJsonResponse;
      return j.features ?? [];
    },
  });

  const uniqueEvents = useMemo(
    () => dedupeByEventId(eventsQ.data ?? []),
    [eventsQ.data],
  );

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return uniqueEvents;
    return uniqueEvents.filter((f) =>
      (f.properties?.title ?? "").toLowerCase().includes(q),
    );
  }, [uniqueEvents, search]);

  const selected = useMemo(() => {
    if (!selectedEventId) return null;
    return (
      uniqueEvents.find((f) => f.properties?.id === selectedEventId) ?? null
    );
  }, [selectedEventId, uniqueEvents]);

  const explainM = useMutation({
    mutationFn: async (payload: {
      eventId: string;
      question?: string;
      lang: Lang;
    }) => {
      const r = await fetch("/api/agent/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.text()) || "explain error");
      return r.json();
    },
  });

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedEventId(id);
      explainM.reset();
    },
    [explainM],
  );

  const points = useMemo(() => {
    const pts: { id: string; title: string; lat: number; lon: number }[] = [];
    for (const f of uniqueEvents) {
      const c = getPointLatLngFromGeoJSON(f.geometry);
      if (!c) continue;
      pts.push({
        id: f.properties.id,
        title: f.properties.title,
        lat: c.lat,
        lon: c.lon,
      });
    }
    return pts;
  }, [uniqueEvents]);

  const coords = selected ? getPointLatLngFromGeoJSON(selected.geometry) : null;

  const quickQuestions = useMemo(
    () => [
      lang === "en"
        ? "What does this event mean?"
        : "¿Qué significa este evento?",
      lang === "en"
        ? "How reliable is this data?"
        : "¿Qué tan confiable es este dato?",
      lang === "en"
        ? "How should I interpret geometry and sources?"
        : "¿Cómo interpreto geometry y sources?",
    ],
    [lang],
  );

  return (
    <main className="py-10">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t(lang, "titleExplore")}
          </h1>
          <p className="mt-2 text-zinc-300">{t(lang, "subtitleExplore")}</p>
        </div>
        <LanguageToggle lang={lang} onChange={setLang} />
      </div>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-4 backdrop-blur">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm text-zinc-300">
                {t(lang, "category")}
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSelectedEventId(null);
                  explainM.reset();
                }}
                className="mt-1 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2"
              >
                <option value={ALL_SUPPORTED}>
                  {lang === "en" ? "All (supported)" : "Todos (soportados)"}
                </option>
                <option value="wildfires">
                  {lang === "en" ? "Wildfires" : "Incendios (Wildfires)"}
                </option>
                <option value="severeStorms">
                  {lang === "en" ? "Severe storms" : "Tormentas severas"}
                </option>
                <option value="volcanoes">
                  {lang === "en" ? "Volcanoes" : "Volcanes"}
                </option>
              </select>

              <p className="mt-1 text-xs text-zinc-500">
                {lang === "en"
                  ? "Limited to categories covered by your Knowledge Base."
                  : "Limitado a categorías cubiertas por tu Knowledge Base."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-zinc-300">
                  {t(lang, "days")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  {t(lang, "status")}
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setSelectedEventId(null);
                    explainM.reset();
                  }}
                  className="mt-1 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                  <option value="all">all</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-300">
                {t(lang, "search")}
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(lang, "searchPlaceholder")}
                className="mt-1 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Events list */}
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-300">{t(lang, "events")}</div>
              <div className="text-xs text-zinc-500">
                {eventsQ.isLoading
                  ? t(lang, "loading")
                  : `${filteredEvents.length}`}
              </div>
            </div>

            <div className="mt-3 max-h-[56vh] overflow-y-auto pr-1">
              {eventsQ.isLoading ? (
                <p className="text-zinc-300">{t(lang, "loading")}</p>
              ) : eventsQ.isError ? (
                <p className="text-red-300">Error.</p>
              ) : filteredEvents.length === 0 ? (
                <p className="text-zinc-400">{t(lang, "noEvents")}</p>
              ) : (
                <ul className="space-y-2">
                  {filteredEvents.map((f) => {
                    const id = f.properties.id;
                    const title = f.properties.title;
                    const active = id === selectedEventId;

                    return (
                      <li key={id}>
                        <button
                          onClick={() => handleSelect(id)}
                          className={[
                            "w-full rounded-2xl border px-3 py-3 text-left transition",
                            active
                              ? "border-zinc-200 bg-zinc-800/40"
                              : "border-zinc-800 bg-zinc-950/20 hover:bg-zinc-800/25",
                          ].join(" ")}
                        >
                          <div className="text-sm font-medium leading-snug">
                            {title}
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">{id}</div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur">
          {/* Steps */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <HintCard
              n="1"
              title={lang === "en" ? "Pick a category" : "Elige categoría"}
              desc={
                lang === "en"
                  ? "Wildfires, storms, volcanoes."
                  : "Incendios, tormentas, volcanes."
              }
            />
            <HintCard
              n="2"
              title={lang === "en" ? "Select an event" : "Selecciona un evento"}
              desc={
                lang === "en"
                  ? "From the list or the map."
                  : "Desde la lista o el mapa."
              }
            />
            <HintCard
              n="3"
              title={lang === "en" ? "Get an explanation" : "Pide explicación"}
              desc={
                lang === "en" ? "Press the RAG button." : "Pulsa el botón RAG."
              }
            />
          </div>

          {/* Map */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 text-sm text-zinc-300">
              {t(lang, "mapTitle")} ({points.length})
            </div>
            <EventsMap
              points={points}
              selectedId={selectedEventId}
              onSelect={handleSelect}
            />
          </div>

          {/* Details */}
          <div className="mt-6">
            {!selected ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4 text-zinc-300">
                {lang === "en"
                  ? "Select an event from the list or click a point on the map to see details."
                  : "Selecciona un evento en la lista o haz click en un punto del mapa para ver detalles."}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {selected.properties.title}
                  </h2>
                  {selected.properties.description ? (
                    <p className="mt-1 text-zinc-300">
                      {selected.properties.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-zinc-400">
                      {lang === "en"
                        ? "No description provided."
                        : "Sin descripción."}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <InfoCard label="Event ID" value={selected.properties.id} />
                  <InfoCard
                    label="State"
                    value={selected.properties.closed ? "closed" : "open"}
                  />
                  <InfoCard
                    label="Geometry"
                    value={selected.geometry?.type ?? "N/A"}
                  />
                </div>

                <div className="mt-3 text-sm text-zinc-300">
                  {coords ? (
                    <>
                      {t(lang, "approxLocation")}:{" "}
                      <span className="text-zinc-100 font-medium">
                        {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                      </span>{" "}
                      <a
                        className="ml-2 underline hover:text-white"
                        href={`https://www.google.com/maps?q=${coords.lat},${coords.lon}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t(lang, "viewOnMap")}
                      </a>
                    </>
                  ) : (
                    <span className="text-zinc-500">(No Point coords)</span>
                  )}
                </div>

                {/* RAG box */}
                <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/20 p-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold">
                      {t(lang, "askExplain")}
                    </div>
                    <p className="text-sm text-zinc-300">
                      {t(lang, "optionalQuestion")}.
                    </p>
                  </div>

                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={
                      lang === "en"
                        ? "e.g. What does this event mean and how should I interpret sources and geometry?"
                        : "Ej: ¿Qué significa este evento y cómo interpretar sources y geometry?"
                    }
                    className="mt-3 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
                    rows={3}
                  />

                  {/* Quick questions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuestion(q)}
                        className="rounded-full border border-zinc-700 bg-zinc-950/30 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800/30"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick={() =>
                        explainM.mutate({
                          eventId: selected.properties.id,
                          question: question.trim() || undefined,
                          lang,
                        })
                      }
                      disabled={explainM.isPending}
                      className="rounded-2xl bg-zinc-100 px-4 py-2 font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
                    >
                      {explainM.isPending
                        ? t(lang, "explaining")
                        : t(lang, "explain")}
                    </button>

                    <button
                      onClick={() => {
                        setQuestion("");
                        explainM.reset();
                      }}
                      className="rounded-2xl border border-zinc-700 px-4 py-2 text-zinc-100 hover:bg-zinc-800/40"
                    >
                      {t(lang, "clear")}
                    </button>

                    {selectedEventId ? (
                      <button
                        onClick={() => {
                          setSelectedEventId(null);
                          explainM.reset();
                        }}
                        className="rounded-2xl border border-zinc-700 px-4 py-2 text-zinc-100 hover:bg-zinc-800/40"
                      >
                        {lang === "en" ? "Deselect" : "Quitar selección"}
                      </button>
                    ) : null}
                  </div>

                  {/* Answer */}
                  <div className="mt-5 border-t border-zinc-800 pt-5">
                    <div className="text-sm font-semibold">
                      {t(lang, "answer")}
                    </div>

                    {explainM.isError ? (
                      <div className="mt-3 rounded-2xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-200">
                        {String(explainM.error)}
                      </div>
                    ) : explainM.isPending ? (
                      <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-300">
                        {lang === "en"
                          ? "Generating explanation..."
                          : "Generando explicación..."}
                      </div>
                    ) : explainM.data ? (
                      <RagAnswer
                        lang={lang}
                        data={
                          explainM.data?.answer_json ??
                          explainM.data?.answerJson ??
                          null
                        }
                        raw={
                          explainM.data?.answer_raw ??
                          explainM.data?.answer ??
                          ""
                        }
                      />
                    ) : (
                      <p className="mt-2 text-sm text-zinc-400">
                        {lang === "en"
                          ? "Select an event, then press “Explain with RAG”."
                          : "Selecciona un evento y luego pulsa “Explicar con RAG”."}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-sm break-all text-zinc-100">{value}</div>
    </div>
  );
}

function HintCard({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-3">
      <div className="text-xs text-zinc-500">Step {n}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-100">{title}</div>
      <div className="mt-1 text-xs text-zinc-300">{desc}</div>
    </div>
  );
}
