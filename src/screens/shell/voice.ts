import type { ShellPlayer } from "./read-cycle";

export interface OnkkoVoice {
  met: boolean;
  on: boolean;
}

export interface ShellChrome {
  player: ShellPlayer;
  voice: OnkkoVoice;
  disconnect: () => Promise<void>;
  setOnkko: (form: FormData) => Promise<void>;
}
