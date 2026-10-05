import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../auth-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFileName(value: string) {
  const extension = path.extname(value);
  const base = path.basename(value, extension).replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/-+/g, "-");
  return `${base || "file"}-${Date.now()}${extension}`;
}

function hasBlobStore() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function isBlobUploadUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com") && url.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  // Only allow safe document/image types
  const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".txt", ".csv", ".zip"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = safeFileName(file.name);

  if (process.env.VERCEL === "1" && !hasBlobStore()) {
    return NextResponse.json(
      { error: "Vercel Blob storage is not connected to this project." },
      { status: 503 },
    );
  }

  if (hasBlobStore()) {
    const blob = await put(`uploads/${fileName}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });
    return NextResponse.json({ name: file.name, href: blob.url, size: file.size });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  await writeFile(path.join(uploadDir, fileName), buffer);

  return NextResponse.json({
    name: file.name,
    href: `/uploads/${fileName}`,
    size: file.size,
  });
}

// DELETE /api/upload?href=/uploads/filename.pdf
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const href = request.nextUrl.searchParams.get("href");
  if (!href) {
    return NextResponse.json({ error: "Invalid href" }, { status: 400 });
  }

  if (hasBlobStore()) {
    if (!isBlobUploadUrl(href)) {
      return NextResponse.json({ error: "Invalid upload URL" }, { status: 400 });
    }
    await del(href);
    return NextResponse.json({ ok: true });
  }

  if (!href.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalid href" }, { status: 400 });
  }
  const fileName = path.basename(href);
  // Guard against path traversal
  if (fileName.includes("..") || fileName.includes("/")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);
  try {
    await unlink(filePath);
  } catch {
    // File already gone — treat as success
  }
  return NextResponse.json({ ok: true });
}
