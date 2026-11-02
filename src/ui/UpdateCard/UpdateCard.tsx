import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Badge } from "../Badge/Badge";
import type { LinkComponent } from "../link";
import styles from "./UpdateCard.module.css";

export function UpdateCard({
  href,
  name,
  meta,
  art,
  newest,
  selected,
  link,
  field,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "children" | "name"> & {
  href?: string;
  name: string;
  meta: string;
  art: string | null;
  newest?: string;
  selected?: string;
  link?: LinkComponent;
  field?: string;
}) {
  const mark = selected
    ? { kind: "selected" as const, label: selected }
    : newest
      ? { kind: "newest" as const, label: newest }
      : null;
  const body: ReactNode = (
    <>
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.blank} />}
      <span className={styles.over}>
        <span className={mark ? styles[mark.kind] : styles.plain}>
          {mark && <Badge kind={mark.kind} label={mark.label} />}
        </span>
        <span className={styles.band}>
          <span className={styles.name}>{name}</span>
          <span className={styles.meta}>{meta}</span>
        </span>
      </span>
    </>
  );
  if (href === undefined) {
    return (
      <button
        {...rest}
        type="submit"
        name={field}
        aria-current={selected ? "true" : undefined}
        className={styles.button}
      >
        {body}
      </button>
    );
  }
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.card}>
      {body}
    </Link>
  );
}
