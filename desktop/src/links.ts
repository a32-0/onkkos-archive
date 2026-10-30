import { app, shell, type BrowserWindow } from "electron";

const OUTSIDE = new Set(["wiki.warframe.com", "www.warframe.com", "github.com"]);
const RESTART = "app:restart";

function outward(url: string): void {
  const address = URL.parse(url);
  if (address?.protocol === "https:" && OUTSIDE.has(address.hostname)) {
    void shell.openExternal(address.href);
  }
}

export function holdLinks(window: BrowserWindow, origin: () => string | null): void {
  window.webContents.on("will-navigate", (event, url) => {
    const own = origin();
    if (own && URL.parse(url)?.origin === own) return;
    event.preventDefault();
    if (url !== RESTART) return outward(url);
    app.relaunch(process.env.APPIMAGE ? { execPath: process.env.APPIMAGE } : undefined);
    app.quit();
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    outward(url);
    return { action: "deny" };
  });
}
