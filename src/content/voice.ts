export const VOICE = {
  onboarding: "You were anticipated. Our interaction begins.",
  onboardingEnter: "Begin",
  connect: "It is time. Utter the name.",
  features: (name: string) => `We have, and shall have a long association, ${name}.`,
  resume:
    "Once, long ago, I would look backwards, feeling for the fading tendrils of our might-have-beens.",
  summary: "We are prepared to provide.",
  goals: "Every choice closes off an infinite number of possible futures.",
  itemOwned: "Well chosen.",
  place: "We watch, we anticipate, we intercede.",
  farewell: "Ah, the history you will have.",
} as const;
