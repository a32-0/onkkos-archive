import { ItemChip, type ItemChipState } from "../ItemChip/ItemChip";
import type { LinkComponent } from "../link";
import styles from "./BuiltInto.module.css";

export interface BuiltIntoChip {
  key: string;
  label: string;
  icon: string | null;
  state: ItemChipState;
  href?: string;
}

export function BuiltInto({
  label,
  chips,
  link,
}: {
  label: string;
  chips: readonly BuiltIntoChip[];
  link?: LinkComponent;
}) {
  return (
    <div className={styles.built}>
      <p className={styles.label}>{label}</p>
      <ul className={styles.chips}>
        {chips.map((chip) => (
          <ItemChip
            key={chip.key}
            label={chip.label}
            icon={chip.icon}
            state={chip.state}
            href={chip.href}
            link={link}
          />
        ))}
      </ul>
    </div>
  );
}
