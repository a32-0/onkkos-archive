"use client";

import { useActionState } from "react";

import { CONNECT, connectError } from "@/content/onboarding";
import { Button } from "@/ui/Button/Button";
import { ErrorBand } from "@/ui/ErrorBand/ErrorBand";
import { Field } from "@/ui/Field/Field";
import { LoadingCard } from "@/ui/LoadingCard/LoadingCard";

import styles from "./Connect.module.css";
import type { ConnectAction, ConnectState } from "./state";

const FIELD = "account-id";

export function ConnectForm({
  connect,
  initial,
}: {
  connect: ConnectAction;
  initial: ConnectState;
}) {
  const [state, action, pending] = useActionState(connect, initial);
  const message = !pending && state.reason ? connectError(state.reason, state.retryAt) : null;

  return (
    <>
      <form action={action} className={styles.card}>
        <div className={styles.field}>
          <label htmlFor={FIELD} className={styles.label}>
            {CONNECT.fieldLabel}
          </label>
          <Field
            id={FIELD}
            name="accountId"
            defaultValue={state.value}
            placeholder={CONNECT.fieldPlaceholder}
            autoComplete="off"
            spellCheck={false}
            invalid={message !== null}
          />
          {message && <ErrorBand message={message} />}
        </div>
        <Button type="submit" loading={pending}>
          {CONNECT.submit}
        </Button>
      </form>
      {pending && (
        <div className={styles.reading}>
          <LoadingCard line={CONNECT.reading} />
        </div>
      )}
    </>
  );
}
