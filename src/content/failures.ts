const utc = (retryAt: number) => `${new Date(retryAt * 1000).toISOString().slice(11, 16)} UTC`;

export const BAND = {
  invalidId: "An account ID is 24 characters: digits 0–9 and letters a–f.",
  notFound: "No account answers to this ID. Copy it again from the gid cookie.",
  notAnswering: (retryAt: number | null) =>
    `Warframe isn't answering right now. Your ID is fine; try again ${
      retryAt === null ? "in a few minutes." : `at ${utc(retryAt)}.`
    }`,
  unreadable: "Warframe's answer came back in a form we can't read yet. Your ID is fine.",
  limited: (retryAt: number | null) =>
    retryAt === null
      ? "You've had your two readings for now."
      : `You've had your two readings for now. The next opens at ${utc(retryAt)}.`,
} as const;
