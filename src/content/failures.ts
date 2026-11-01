export const BAND = {
  invalidId: "An account ID is 24 characters: digits 0–9 and letters a–f.",
  notFound: "No account answers to this ID. Copy it again from the gid cookie.",
  notAnswering: (local: string | null) =>
    `Warframe isn't answering right now. Your ID is fine; try again ${
      local === null ? "in a few minutes." : `at ${local}.`
    }`,
  unreadable: "Warframe's answer came back in a form we can't read yet. Your ID is fine.",
  limited: (local: string | null) =>
    local === null
      ? "You've had your two readings for now."
      : `You've had your two readings for now. The next opens at ${local}.`,
} as const;
