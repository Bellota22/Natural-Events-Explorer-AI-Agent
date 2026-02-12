import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ message: "EONET event detail error" }, { status: 502 });
  }

  return NextResponse.json(await res.json());
}
