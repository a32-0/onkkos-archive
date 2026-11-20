import type { ZoomLevel } from "@/domain/zoom";

export interface ZoomSetting {
  level: ZoomLevel;
  levels: readonly [ZoomLevel, ...ZoomLevel[]];
  cookie: string;
  choose: (form: FormData) => Promise<void>;
}

export function keptLevel(cookies: string, setting: ZoomSetting): ZoomLevel {
  const kept = cookies
    .split(";")
    .map((pair) => pair.trim().split("="))
    .find(([name]) => name === setting.cookie)?.[1];
  return setting.levels.find((level) => String(level) === kept) ?? setting.levels[0];
}
