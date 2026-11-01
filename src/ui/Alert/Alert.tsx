import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import styles from "./Alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "error";

const ICONS: Record<AlertTone, IconName> = {
  info: "info",
  success: "check-circle",
  warning: "warning",
  error: "error",
};

export function Alert({ tone, message }: { tone: AlertTone; message: string }) {
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={ICONS[tone]} size={18} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
