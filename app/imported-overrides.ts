import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImportedContent } from "./imported-content";

export type ImportedOverride = {
  title?: string; // Override վերնագիր
};

export type ImportedOverrides = {
  hidden: string[]; // sourceUrl-ներ, որ թաքցված են
  edits: Record<string, ImportedOverride>; // sourceUrl → override
};

const dataDir = path.join(process.cwd(), "data");
const overridesFile = path.join(dataDir, "imported-overrides.json");

export async function readOverrides(): Promise<ImportedOverrides> {
  try {
    await mkdir(dataDir, { recursive: true });
    const raw = await readFile(overridesFile, "utf8");
    return JSON.parse(raw) as ImportedOverrides;
  } catch {
    return { hidden: [], edits: {} };
  }
}

export async function writeOverrides(overrides: ImportedOverrides): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(overridesFile, JSON.stringify(overrides, null, 2), "utf8");
}

// Override-ները կիրառում ենք pages-ի վրա
export function applyOverrides(
  pages: ImportedContent[],
  overrides: ImportedOverrides,
): ImportedContent[] {
  return pages
    .filter((page) => !overrides.hidden.includes(page.sourceUrl))
    .map((page) => {
      const edit = overrides.edits[page.sourceUrl];
      if (!edit) return page;
      return {
        ...page,
        title: edit.title ?? page.title,
      };
    });
}
