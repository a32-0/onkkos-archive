import styles from "./ErrorBand.module.css";

export function ErrorBand({ message }: { message: string }) {
  return (
    <p className={styles.band} role="alert">
      {message}
    </p>
  );
}
