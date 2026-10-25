import Link from "next/link";

import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import { mapCategoryRoute, placesRoute, updatesRoute } from "@/routes";
import { Divider } from "@/ui/Divider/Divider";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { FeaturedCard } from "@/ui/FeaturedCard/FeaturedCard";
import { List, ListEntry } from "@/ui/List/List";
import { ListItem } from "@/ui/ListItem/ListItem";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { PlaceOverview } from "@/ui/PlaceOverview/PlaceOverview";
import { PlaceSwitcher } from "@/ui/PlaceSwitcher/PlaceSwitcher";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import type { SummaryCardView } from "../summary/state";
import styles from "./Map.module.css";
import type { MapView } from "./state";

export function MapScreen({
  chrome,
  view,
  card,
}: {
  chrome: ShellChrome;
  view: MapView;
  card: SummaryCardView;
}) {
  const voice = chrome.voice.on;
  return (
    <Shell chrome={chrome} tab="navigation" tabs>
      <div className={styles.page}>
        <div className={styles.main}>
          {voice && <OnkkoLine place="top" line={VOICE.place} />}
          <div className={styles.cards}>
            <FeaturedCard {...card} href={updatesRoute("navigation", null)} link={Link} />
            <PlaceSwitcher
              href={placesRoute(view.system, view.place)}
              kicker={MAP.changeLocation}
              name={view.place}
              link={Link}
            />
          </div>
          <PlaceOverview {...view.overview} />
          {view.nothingLeft && (
            <EmptyState
              icon="explore"
              title={view.nothingLeft.title}
              line={view.nothingLeft.line}
            />
          )}
          {view.sections.map((section) => (
            <section key={section.id} className={styles.section}>
              <Divider label={section.label} />
              <List label={section.label}>
                {section.groups.map((group) => (
                  <ListEntry key={group.id}>
                    <ListItem
                      href={mapCategoryRoute(group.key, view.system, view.place)}
                      icon={group.icon}
                      symbol={group.symbol}
                      title={group.name}
                      {...(group.mastered && {
                        tag: { kind: "mastered" as const, label: MAP.mastered },
                      })}
                      link={Link}
                    />
                  </ListEntry>
                ))}
              </List>
            </section>
          ))}
        </div>
      </div>
    </Shell>
  );
}
