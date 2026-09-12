declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends a GA4 event via the `gtag` loaded in `index.html`, doing nothing if it hasn't loaded (blocked by an ad blocker, offline, or in tests). */
function sendEvent(name: string, params?: Record<string, unknown>): void {
  window.gtag?.("event", name, params);
}

/** Tracks a New Game starting, whether from the New Game button or the Game Over overlay. */
export function trackNewGame(): void {
  sendEvent("new_game");
}

/** Tracks Game Over being reached, with the final Score. */
export function trackGameOver(score: number): void {
  sendEvent("game_over", { score });
}

/** Tracks the Best Score being surpassed, with the new Best Score. */
export function trackNewBestScore(score: number): void {
  sendEvent("new_best_score", { score });
}
