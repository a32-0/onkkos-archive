import { Header } from "../Header/Header";
import { Icon } from "../Icon/Icon";
import styles from "./SheetHeader.module.css";

export function SheetHeader({
  wordmark,
  closeLabel,
  onClose,
}: {
  wordmark: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <Header
      variant="sheet"
      wordmark={wordmark}
      close={
        <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
          <Icon name="close" />
        </button>
      }
    />
  );
}
