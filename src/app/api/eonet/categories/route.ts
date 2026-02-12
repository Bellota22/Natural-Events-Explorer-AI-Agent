import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/categories", {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ message: "EONET categories error" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
