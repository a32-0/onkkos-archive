"use client";

import { useTicks, writeTick } from "@/infra/ticks";
import { ItemScreen } from "@/screens/item/ItemScreen";
import type { ItemPageView } from "@/screens/item/state";
import type { ShellChrome } from "@/screens/shell/voice";
import { tickableIds } from "@/screens/item/steps/Steps";

export function ItemTicks({ chrome, page }: { chrome: ShellChrome; page: ItemPageView }) {
  const { scope } = page.steps;
  const ticked = useTicks(scope, tickableIds(page.steps));
  return (
    <ItemScreen
      chrome={chrome}
      page={page}
      ticks={{ ticked, tick: (id, on) => writeTick(scope, id, on) }}
    />
  );
}
