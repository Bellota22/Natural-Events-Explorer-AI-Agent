import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ message: "EONET event detail error" }, { status: 502 });
  }

  return NextResponse.json(await res.json());
}

