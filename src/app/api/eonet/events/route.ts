import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clampInt(v: string | null, def: number, min: number, max: number) {
  const n = Number(v ?? def);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function dedupeById(features: any[]) {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const f of features) {
    const id = f?.properties?.id;
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(f);
  }
  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const statusRaw = (searchParams.get("status") ?? "open").toLowerCase();
  const status = ["open", "closed", "all"].includes(statusRaw) ? statusRaw : "open";
  const days = clampInt(searchParams.get("days"), 7, 1, 365);

  // ✅ support CSV categories: wildfires,severeStorms,volcanoes
  const categoryRaw = (searchParams.get("category") ?? "").trim();
  const categories = categoryRaw
    ? categoryRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const fetchOne = async (cat?: string) => {
    const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events/geojson");
    url.searchParams.set("status", status);
    url.searchParams.set("days", String(days));
    if (cat) url.searchParams.set("category", cat);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("EONET events error");
    return res.json();
  };

  try {
    if (categories.length <= 1) {
      const data = await fetchOne(categories[0]);
      return NextResponse.json(data);
    }

    const results = await Promise.all(categories.map((c) => fetchOne(c)));
    const merged = {
      type: "FeatureCollection",
      features: dedupeById(results.flatMap((r) => r?.features ?? [])),
    };

    return NextResponse.json(merged);
  } catch {
    return NextResponse.json({ message: "EONET events error" }, { status: 502 });
  }
}
