"use client";

import Link from "next/link";
import { useState } from "react";

import { Divider } from "@/ui/Divider/Divider";
import { GroupRow } from "@/ui/GroupRow/GroupRow";
import { ItemTile } from "@/ui/ItemTile/ItemTile";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { Rail } from "@/ui/Rail/Rail";

import type { SummarySection } from "./state";
import styles from "./Summary.module.css";

export function SummaryGroups({ sections }: { sections: readonly SummarySection[] }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(open);
    if (!next.delete(id)) next.add(id);
    setOpen(next);
  };

  return sections.map((section) => (
    <section key={section.id} className={styles.section}>
      <Divider label={section.label} />
      <div className={styles.groups}>
        {section.groups.map((group) => (
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
              {group.tiles.length > 0 && (
                <Rail id={`${group.id}-rail`} label={group.name}>
                  {group.tiles.map((tile) => (
                    <ItemTile
                      key={tile.name}
                      href={tile.href}
                      name={tile.name}
                      reading={tile.reading}
                      place={tile.place}
                      art={tile.art}
                      link={Link}
                    />
                  ))}
                </Rail>
              )}
              {group.more && <MoreLine text={group.more} />}
            </div>
          </GroupRow>
        ))}
      </div>
    </section>
  ));
}
