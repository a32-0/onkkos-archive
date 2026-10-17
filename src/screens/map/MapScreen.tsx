import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import type { SummaryAction, SummaryCardView, SummaryUpdate } from "../summary/state";
import { SummaryCard } from "../summary/SummaryCard";
import { MapBody } from "./MapBody";
import type { MapView } from "./state";

export function MapScreen({
  chrome,
  view,
  card,
  updates,
  choose,
}: {
  chrome: ShellChrome;
  view: MapView;
  card: SummaryCardView;
  updates: readonly SummaryUpdate[];
  choose: SummaryAction;
}) {
  return (
    <Shell chrome={chrome} tab="navigation" tabs>
      <MapBody
        key={`${view.system}/${view.card.name}`}
        view={view}
        voice={chrome.voice.on}
        top={<SummaryCard card={card} updates={updates} step={null} choose={choose} />}
      />
    </Shell>
  );
}
