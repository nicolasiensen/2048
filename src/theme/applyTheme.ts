import type { Theme } from "./themes";

/**
 * Pushes `theme.ui`'s colors onto `root` as CSS custom properties, so
 * style.css's chrome (scoreboard, buttons, banners, page background) follows
 * the active Theme. The canvas itself isn't CSS-driven — callers must also
 * redraw the board with the same `theme` passed to `drawBoard`.
 */
export function applyTheme(
  theme: Theme,
  root: HTMLElement = document.documentElement
): void {
  const { style } = root;
  style.setProperty("--page-background", theme.ui.pageBackground);
  style.setProperty("--panel-background", theme.ui.panelBackground);
  style.setProperty("--panel-text", theme.ui.panelText);
  style.setProperty("--button-background", theme.ui.buttonBackground);
  style.setProperty(
    "--button-background-hover",
    theme.ui.buttonBackgroundHover
  );
  style.setProperty("--button-text", theme.ui.buttonText);
  style.setProperty("--win-banner-background", theme.ui.winBannerBackground);
  style.setProperty("--win-banner-text", theme.ui.winBannerText);
  style.setProperty("--game-over-background", theme.ui.gameOverBackground);
  style.setProperty("--game-over-text", theme.ui.gameOverText);
}
