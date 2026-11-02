import { GameIcon } from "../GameIcon/GameIcon";
import type { LinkComponent } from "../link";
import styles from "./ItemChip.module.css";

export type ItemChipState = "default" | "done" | "more";

const CLASSES: Readonly<Record<ItemChipState, string | undefined>> = {
  default: styles.chip,
  done: styles.done,
  more: styles.more,
};

export function ItemChip({
  label,
  icon = null,
  state = "default",
  name,
  href,
  link,
}: {
  label: string;
  icon?: string | null;
  state?: ItemChipState;
  name?: string;
  href?: string;
  link?: LinkComponent;
}) {
  const content = (
    <>
      {state !== "more" && <GameIcon url={icon} />}
      <span className={styles.label}>{label}</span>
    </>
  );
  if (href === undefined || state === "more") {
    return (
      <li className={CLASSES[state]} aria-label={name}>
        {content}
      </li>
    );
  }
  const Link = link ?? "a";
  return (
    <li className={styles.item}>
      <Link href={href} className={`${CLASSES[state]} ${styles.link}`} aria-label={name}>
        {content}
      </Link>
    </li>
  );
}
