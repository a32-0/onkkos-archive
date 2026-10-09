import styles from "./WikiLink.module.css";

export type WikiLinkTarget = "wiki" | "page";

export function WikiLink({
  href,
  label,
  target,
}: {
  href: string;
  label: string;
  target: WikiLinkTarget;
}) {
  if (target === "page") {
    return (
      <a className={styles.link} href={href}>
        {label}
      </a>
    );
  }
  return (
    <a className={styles.link} href={href} target="_blank" rel="noreferrer">
      {label}
      <span aria-hidden>↗</span>
    </a>
  );
}
