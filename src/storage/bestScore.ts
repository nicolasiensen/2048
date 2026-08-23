const STORAGE_KEY = "2048:best-score";

/** Reads the persisted Best Score from `storage`, defaulting to 0 when unset or invalid. */
export function loadBestScore(storage: Storage): number {
  const raw = storage.getItem(STORAGE_KEY);
  const parsed = raw === null ? 0 : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/** Persists `score` as the Best Score in `storage`. */
export function saveBestScore(storage: Storage, score: number): void {
  storage.setItem(STORAGE_KEY, String(score));
}
