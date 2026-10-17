"use client";

import { useState, type ReactNode } from "react";

import { APP } from "@/content/app";
import { SHELL } from "@/content/nav";
import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { PlaceCard } from "@/ui/PlaceCard/PlaceCard";
import { Segmented, type SegmentedOption } from "@/ui/Segmented/Segmented";
import { Sheet } from "@/ui/Sheet/Sheet";

import { nextLens } from "./lens";
import styles from "./Map.module.css";
import { MapGroups } from "./MapGroups";
import { usePanes } from "./panes";
import { PlaceList } from "./PlaceList";
import type { Lens, MapView } from "./state";
import { SystemList } from "./SystemList";

const TO_GET: SegmentedOption = { value: "left", label: MAP.toGet };
const MASTERED: SegmentedOption = { value: "mastered", label: MAP.mastered };
const NEW: SegmentedOption = { value: "new", label: MAP.new };

export function MapBody({ view, voice, top }: { view: MapView; voice: boolean; top: ReactNode }) {
  const [lens, setLens] = useState<Lens>("left");
  const [places, setPlaces] = useState(false);
  const [systems, setSystems] = useState(false);
  const [chosen, setChosen] = useState(view.system);
  const [query, setQuery] = useState("");
  const panes = usePanes();
  const system = view.places.find((one) => one.id === chosen) ?? view.places[0];

  const list = system && (
    <PlaceList
      system={system}
      query={query}
      onQuery={setQuery}
      onSystems={() => setSystems(true)}
      voice={voice}
    />
  );

  return (
    <div className={styles.page}>
      <aside className={styles.pane}>{list}</aside>
      <div className={styles.main}>
        <div className={styles.column}>
          {top}
          <PlaceCard {...view.card} onOpen={() => setPlaces(true)} />
          {view.nothingLeft ? (
            <EmptyState
              icon="explore"
              title={view.nothingLeft.title}
              line={view.nothingLeft.line}
            />
          ) : (
            <div className={styles.show}>
              <span className={styles["show-label"]}>{MAP.show}</span>
              <Segmented
                label={MAP.show}
                options={view.newLens ? [TO_GET, MASTERED, NEW] : [TO_GET, MASTERED]}
                chosen={lens}
                onChoose={(value) => setLens(nextLens(lens, value))}
              />
            </div>
          )}
        </div>
        {!view.nothingLeft && (
          <div className={styles.area}>
            <MapGroups key={lens} sections={view.sections} lens={lens} />
          </div>
        )}
        {voice && (
          <div className={styles.foot}>
            <OnkkoLine place="bottom" line={VOICE.place} />
          </div>
        )}
      </div>

      <Sheet
        label={MAP.places}
        wordmark={APP.name}
        closeLabel={SHELL.close}
        open={places}
        onClose={() => setPlaces(false)}
      >
        {list}
      </Sheet>
      <Sheet
        label={MAP.systems}
        wordmark={APP.name}
        closeLabel={SHELL.close}
        open={systems}
        onClose={() => setSystems(false)}
        align={panes ? "start" : "end"}
        back
      >
        <SystemList
          systems={view.systems}
          more={view.moreSystems}
          chosen={chosen}
          onChoose={(id) => {
            setChosen(id);
            setQuery("");
            setSystems(false);
          }}
          voice={voice}
        />
      </Sheet>
    </div>
  );
}
