import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { BucketList } from "@/lib/types";
import { toGlobalStats } from "@/lib/stats";

// ---------------------------------------------------------------------------
// Persistent file-backed store — survives server restarts.
// Falls back to in-memory only if the file cannot be written (e.g., read-only FS).
// ---------------------------------------------------------------------------

const STORE_PATH = join(process.cwd(), ".demo-store.json");

type SerializedState = {
  lists: Array<[string, BucketList]>;
  totalItems: number;
};

type DemoState = { lists: Map<string, BucketList>; totalItems: number };

// Use globalThis to survive Next.js hot-module reloads within a single process.
const globalKey = "__bucket_list_demo_state__";
declare const globalThis: typeof global & { [globalKey]?: DemoState };

function loadFromDisk(): DemoState {
  try {
    if (existsSync(STORE_PATH)) {
      const raw = readFileSync(STORE_PATH, "utf-8");
      const parsed: SerializedState = JSON.parse(raw);
      return {
        lists: new Map(parsed.lists ?? []),
        totalItems: parsed.totalItems ?? 0,
      };
    }
  } catch {
    // corrupted file — start fresh but don't crash
  }
  return { lists: new Map(), totalItems: 0 };
}

function saveToDisk(s: DemoState) {
  try {
    const payload: SerializedState = {
      lists: Array.from(s.lists.entries()),
      totalItems: s.totalItems,
    };
    writeFileSync(STORE_PATH, JSON.stringify(payload, null, 2), "utf-8");
  } catch {
    // non-fatal — data is still in memory for this process lifetime
  }
}

// Initialise once per process; if hot-reloaded, reuse the existing state object.
if (!globalThis[globalKey]) {
  globalThis[globalKey] = loadFromDisk();
}
const state: DemoState = globalThis[globalKey]!;

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function createId() {
  const bytes = randomBytes(8);
  return `BL-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

export function createDemoList(items: string[]) {
  let publicId = createId();
  while (state.lists.has(publicId)) publicId = createId();
  const list: BucketList = {
    publicId,
    createdAt: new Date().toISOString(),
    items: items.map((text, index) => ({ text, position: index + 1 })),
  };
  state.lists.set(publicId, list);
  state.totalItems += items.length;
  saveToDisk(state);
  return list;
}

export function getDemoList(publicId: string) { return state.lists.get(publicId) ?? null; }
export function getDemoStats() { return toGlobalStats(state.lists.size, state.totalItems); }
