import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AdminEntry } from "./user-materials";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "materials.json");

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]", "utf8");
  }
}

export async function readMaterials() {
  await ensureStore();
  const value = await readFile(dataFile, "utf8");
  return JSON.parse(value) as AdminEntry[];
}

export async function writeMaterials(entries: AdminEntry[]) {
  await ensureStore();
  await writeFile(dataFile, JSON.stringify(entries, null, 2), "utf8");
}
