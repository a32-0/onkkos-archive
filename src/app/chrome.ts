import "server-only";

import type { Screen } from "@/infra/screen";
import { readTourSeen } from "@/infra/session";
import type { ShellChrome } from "@/screens/shell/voice";

import { disconnect, endTour, resetTour, setOnkko } from "./actions";
import { playerOf, voiceOf } from "./screen";

export async function chromeOf(screen: Screen): Promise<ShellChrome> {
  return {
    player: playerOf(screen),
    voice: await voiceOf(screen),
    tour: !(await readTourSeen()),
    disconnect,
    setOnkko,
    endTour,
    resetTour,
  };
}
