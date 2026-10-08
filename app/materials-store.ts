import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";
import type { AdminEntry } from "./user-materials";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "materials.json");
const blobPath = "admin/materials.json";
const materialsCacheTag = "materials";

function hasBlobStore() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function ensurePersistentStore() {
  if (process.env.VERCEL === "1" && !hasBlobStore()) {
    throw new Error("Vercel Blob storage is not connected to this project.");
  }
}

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]", "utf8");
  }
}

const readBlobMaterials = unstable_cache(
  async () => {
    const result = await get(blobPath, { access: "public" });
    if (!result?.stream) return [];
    return JSON.parse(await new Response(result.stream).text()) as AdminEntry[];
  },
  ["materials"],
  { revalidate: 86_400, tags: [materialsCacheTag] },
);

export async function readMaterials() {
  ensurePersistentStore();
  if (hasBlobStore()) return readBlobMaterials();
  await ensureStore();
  const value = await readFile(dataFile, "utf8");
  return JSON.parse(value) as AdminEntry[];
}

export async function writeMaterials(entries: AdminEntry[]) {
  ensurePersistentStore();
  if (hasBlobStore()) {
    await put(blobPath, JSON.stringify(entries, null, 2), {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json",
    });
    revalidateTag(materialsCacheTag, { expire: 0 });
    return;
  }
  await ensureStore();
  await writeFile(dataFile, JSON.stringify(entries, null, 2), "utf8");
}
