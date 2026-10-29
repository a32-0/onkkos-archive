import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./ChoiceCard.module.css";

export type ChoiceCardUse = "two-ways-in" | "goal";

export function ChoiceCard({
  use,
  icon,
  title,
  line,
  href,
  link,
  submit,
}: {
  use: ChoiceCardUse;
  icon: IconName;
  title: string;
  line: string;
  href?: string;
  link?: LinkComponent;
  submit?: { name: string; value: string };
}) {
  const body = (
    <>
      <Icon name={icon} size={40} />
      <span className={use === "goal" ? styles.titleUpper : styles.titleCaps}>{title}</span>
      <span className={styles.line}>{line}</span>
    </>
  );
  if (submit || href === undefined) {
    return (
      <button
        type="submit"
        name={submit?.name}
        value={submit?.value}
        className={`${styles[use]} ${styles.button}`}
      >
        {body}
      </button>
    );
  }
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles[use]}>
      {body}
    </Link>
  );
}
