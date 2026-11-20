import { Alert } from "../Alert/Alert";
import styles from "./Toast.module.css";

const show = (toast: HTMLButtonElement | null) => {
  if (toast && !toast.matches(":popover-open")) toast.showPopover();
};

export function Toast({
  line,
  onDismiss,
  onHold = () => {},
}: {
  line: string | null;
  onDismiss: () => void;
  onHold?: (held: boolean) => void;
}) {
  return (
    <div className={styles.place} role="status">
      {line !== null && (
        <button
          ref={show}
          type="button"
          popover="manual"
          className={styles.toast}
          onClick={onDismiss}
          onPointerEnter={() => onHold(true)}
          onPointerLeave={() => onHold(false)}
          onFocus={() => onHold(true)}
          onBlur={() => onHold(false)}
        >
          <Alert tone="success" message={line} />
        </button>
      )}
    </div>
  );
}
