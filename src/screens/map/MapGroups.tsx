"use client";

import Link from "next/link";
import { useState } from "react";

import { Divider } from "@/ui/Divider/Divider";
import { GroupRow } from "@/ui/GroupRow/GroupRow";
import { ItemTile } from "@/ui/ItemTile/ItemTile";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { Rail } from "@/ui/Rail/Rail";

import { shownUnder } from "./lens";
import styles from "./Map.module.css";
import type { Lens, MapSectionView } from "./state";

export function MapGroups({
  sections,
  lens,
}: {
  sections: readonly MapSectionView[];
  lens: Lens | null;
}) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(open);
    if (!next.delete(id)) next.add(id);
    setOpen(next);
  };

  return sections.map((section) => {
    const groups = section.groups.flatMap((group) => {
      const tiles = group.tiles.filter((tile) => shownUnder(tile, lens));
      const more = lens === "mastered" ? null : lens === "new" ? group.more.fresh : group.more.left;
      return tiles.length > 0 || more ? [{ group, tiles, more }] : [];
    });
    if (groups.length === 0) return null;
    return (
      <section key={section.id} className={styles.section}>
        <Divider label={section.label} />
        <div className={styles.groups}>
          {groups.map(({ group, tiles, more }) => (
            <GroupRow
              key={group.id}
              icon={group.icon}
              name={group.name}
              count={group.count}
              open={open.has(group.id)}
              railId={group.id}
              onToggle={() => toggle(group.id)}
            >
              <div id={group.id} className={styles.open}>
                {tiles.length > 0 && (
                  <Rail id={`${group.id}-rail`} label={group.name}>
                    {tiles.map((tile) => (
                      <ItemTile
                        key={tile.name}
                        href={tile.href}
                        name={tile.name}
                        reading={tile.reading}
                        place={tile.place}
                        art={tile.art}
                        state={tile.state}
                        link={Link}
                      />
                    ))}
                  </Rail>
                )}
                {more && <MoreLine text={more} />}
              </div>
            </GroupRow>
          ))}
        </div>
      </section>
    );
  });
}
