import type { ShellPlayer } from "./read-cycle";

export interface OnkkoVoice {
  met: boolean;
  on: boolean;
}

export interface ShellChrome {
  player: ShellPlayer;
  voice: OnkkoVoice;
  tour: boolean;
  disconnect: () => Promise<void>;
  setOnkko: (form: FormData) => Promise<void>;
  endTour: () => Promise<void>;
  resetTour: () => Promise<void>;
}
