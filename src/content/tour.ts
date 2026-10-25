export const TOUR = {
  label: "A first look",
  step: (at: number, of: number) => `${at} of ${of}`,
  skip: "Skip",
  next: "Next",
  done: "Done",
  steps: {
    navigation: {
      title: "Navigation",
      body: "The star chart, one place at a time. Change location to jump to another planet or system. The ring shows how much gear here you’ve mastered, ranked to the max. Only what you can master or collect is listed, not every item in the game.",
    },
    resume: {
      title: "Resume",
      body: "Everything the game added since the update you last played, grouped by category. Name your last update and the app counts from there. Open a category to see each new thing and how to get it.",
    },
    goal: {
      title: "Goal",
      body: "Pick one thing to chase: take a suggestion or search for it. You get the steps in order: what it needs, where each part drops and what to unlock first.",
    },
    profile: {
      title: "Profile",
      body: "Your account, and when it’s read again, every 12 hours. Change your settings or disconnect here. Tutorial plays this tour again.",
    },
  },
} as const;
