import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../auth-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFileName(value: string) {
  const extension = path.extname(value);
  const base = path.basename(value, extension).replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/-+/g, "-");
  return `${base || "file"}-${Date.now()}${extension}`;
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
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = safeFileName(file.name);
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
  if (!href || !href.startsWith("/uploads/")) {
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
