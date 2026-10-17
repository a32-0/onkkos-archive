import "server-only";

import type { Screen } from "@/infra/screen";
import type { ShellChrome } from "@/screens/shell/voice";

import { disconnect, setOnkko } from "./actions";
import { playerOf, voiceOf } from "./screen";

export async function chromeOf(screen: Screen): Promise<ShellChrome> {
  return { player: playerOf(screen), voice: await voiceOf(screen), disconnect, setOnkko };
}
