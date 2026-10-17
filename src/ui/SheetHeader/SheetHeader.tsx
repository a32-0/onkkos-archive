import { Header } from "../Header/Header";
import { Icon } from "../Icon/Icon";
import styles from "./SheetHeader.module.css";

export function SheetHeader({
  wordmark,
  closeLabel,
  onClose,
  back = false,
}: {
  wordmark: string;
  closeLabel: string;
  onClose: () => void;
  back?: boolean;
}) {
  return (
    <Header
      variant="sheet"
      wordmark={wordmark}
      close={
        <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
          <Icon name={back ? "chevron-backward" : "close"} />
        </button>
      }
    />
  );
}
