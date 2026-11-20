import "server-only";

import type { ZoomLevel } from "@/domain/zoom";
import { parentPort } from "@/infra/app-port";

export function tellZoom(level: ZoomLevel): void {
  parentPort()?.postMessage({ kind: "zoom", level });
}
