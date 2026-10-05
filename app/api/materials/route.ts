import { NextRequest, NextResponse } from "next/server";
import { readMaterials, writeMaterials } from "../../materials-store";
import type { AdminEntry } from "../../user-materials";
import { requireAuth } from "../auth-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await readMaterials();
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const payload = (await request.json()) as Omit<AdminEntry, "id" | "date">;
  const entries = await readMaterials();
  const entry: AdminEntry = {
    ...payload,
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
  };
  const nextEntries = [entry, ...entries];
  await writeMaterials(nextEntries);
  return NextResponse.json(entry, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const payload = (await request.json()) as AdminEntry;
  if (!payload.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const entries = await readMaterials();
  const nextEntries = entries.map((entry) => (entry.id === payload.id ? payload : entry));
  await writeMaterials(nextEntries);
  return NextResponse.json(payload);
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const entries = await readMaterials();
  const nextEntries = entries.filter((entry) => entry.id !== id);
  await writeMaterials(nextEntries);
  return NextResponse.json({ ok: true });
}
