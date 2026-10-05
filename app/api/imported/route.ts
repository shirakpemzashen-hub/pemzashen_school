import { NextRequest, NextResponse } from "next/server";
import {
  classifyImportedPage,
  cleanImportedTitle,
  getImportedPages,
} from "../../imported-content";
import { readOverrides, writeOverrides } from "../../imported-overrides";
import { requireAuth } from "../auth-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — բոլոր imported էջերը override-ների հետ
export async function GET() {
  const pages = getImportedPages();
  const overrides = await readOverrides();

  const result = pages.map((page) => ({
    sourceUrl: page.sourceUrl,
    slug: page.slug,
    title: page.title,
    cleanTitle: cleanImportedTitle(page),
    section: classifyImportedPage(page),
    fileCount: page.files.length,
    isHidden: overrides.hidden.includes(page.sourceUrl),
    override: overrides.edits[page.sourceUrl] ?? null,
  }));

  return NextResponse.json(result);
}

// PUT — խmbagreL վernagiR (override)
export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const { sourceUrl, title } = (await request.json()) as {
    sourceUrl: string;
    title: string;
  };

  if (!sourceUrl) {
    return NextResponse.json({ error: "Missing sourceUrl" }, { status: 400 });
  }

  const overrides = await readOverrides();
  const trimmedTitle = title?.trim() ?? "";

  if (trimmedTitle) {
    overrides.edits[sourceUrl] = { ...overrides.edits[sourceUrl], title: trimmedTitle };
  } else {
    // Եթե դատարկ է — հեռացնել override-ը
    delete overrides.edits[sourceUrl];
  }

  await writeOverrides(overrides);
  return NextResponse.json({ ok: true });
}

// DELETE — թakacneL կaM verakangneL
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const sourceUrl = request.nextUrl.searchParams.get("sourceUrl");
  const restore = request.nextUrl.searchParams.get("restore") === "true";

  if (!sourceUrl) {
    return NextResponse.json({ error: "Missing sourceUrl" }, { status: 400 });
  }

  const overrides = await readOverrides();

  if (restore) {
    overrides.hidden = overrides.hidden.filter((url) => url !== sourceUrl);
  } else {
    if (!overrides.hidden.includes(sourceUrl)) {
      overrides.hidden.push(sourceUrl);
    }
  }

  await writeOverrides(overrides);
  return NextResponse.json({ ok: true });
}
