import { Alert } from "../Alert/Alert";
import styles from "./Toast.module.css";

export function Toast({
  line,
  onDismiss,
  onHold = () => {},
}: {
  line: string;
  onDismiss: () => void;
  onHold?: (held: boolean) => void;
}) {
  return (
    <div
      className={styles.place}
      onPointerEnter={() => onHold(true)}
      onPointerLeave={() => onHold(false)}
      onFocus={() => onHold(true)}
      onBlur={() => onHold(false)}
    >
      <button type="button" className={styles.toast} onClick={onDismiss}>
        <Alert tone="success" message={line} />
      </button>
    </div>
  );
}
