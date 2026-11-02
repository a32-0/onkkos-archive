import type { LinkComponent } from "../link";
import styles from "./RankCard.module.css";

export function RankCard({
  seal,
  title,
  line,
  href,
  link,
}: {
  seal: string;
  title: string;
  line: string;
  href: string;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.card}>
      <span className={styles.seal} aria-hidden>
        {seal}
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.line}>{line}</span>
    </Link>
  );
}
