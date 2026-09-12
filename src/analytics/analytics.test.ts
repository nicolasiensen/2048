import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackGameOver, trackNewBestScore, trackNewGame } from "./analytics";

describe("analytics", () => {
  let gtag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gtag = vi.fn();
    window.gtag = gtag as typeof window.gtag;
  });

  afterEach(() => {
    delete window.gtag;
  });

  it("sends a new_game event", () => {
    trackNewGame();

    expect(gtag).toHaveBeenCalledWith("event", "new_game", undefined);
  });

  it("sends a game_over event with the final Score", () => {
    trackGameOver(1234);

    expect(gtag).toHaveBeenCalledWith("event", "game_over", { score: 1234 });
  });

  it("sends a new_best_score event with the new Best Score", () => {
    trackNewBestScore(4096);

    expect(gtag).toHaveBeenCalledWith("event", "new_best_score", {
      score: 4096,
    });
  });

  it("does nothing when gtag hasn't loaded (e.g. blocked by an ad blocker)", () => {
    delete window.gtag;

    expect(() => trackNewGame()).not.toThrow();
  });
});
