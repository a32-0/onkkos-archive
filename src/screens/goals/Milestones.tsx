"use client";

import { GOALS } from "@/content/goals";
import { ROUTES } from "@/routes";
import { MilestoneRow } from "@/ui/MilestoneRow/MilestoneRow";

import { Link } from "../shell/Link";
import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import styles from "./Milestones.module.css";
import type { MilestoneRowView } from "./state";

export function Milestones({
  chrome,
  rows,
}: {
  chrome: ShellChrome;
  rows: readonly MilestoneRowView[];
}) {
  return (
    <Shell
      chrome={chrome}
      tab="goal"
      tabs
      bar={{ title: GOALS.milestones.title, back: ROUTES.goals }}
    >
      <div className={styles.page}>
        {rows.map((row) => (
          <MilestoneRow
            key={row.id}
            href={row.href}
            icon={row.icon}
            title={row.title}
            line={row.line}
            link={Link}
          />
        ))}
      </div>
    </Shell>
  );
}
