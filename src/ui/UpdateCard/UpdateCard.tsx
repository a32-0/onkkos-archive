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
  link,
  field,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "children" | "name"> & {
  href?: string;
  name: string;
  meta: string;
  art: string | null;
  newest?: string;
  link?: LinkComponent;
  field?: string;
}) {
  const body: ReactNode = (
    <>
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.blank} />}
      {newest && (
        <span className={styles.newest}>
          <Badge kind="newest" label={newest} />
        </span>
      )}
      <span className={styles.band}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{meta}</span>
      </span>
    </>
  );
  if (href === undefined) {
    return (
      <button {...rest} type="submit" name={field} className={styles.button}>
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
