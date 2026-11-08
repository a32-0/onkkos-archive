# docs/

These pages explain what the code can't say for itself: what the app is, the
decisions behind it, and how to keep it running. The code has no comments, so
anything worth explaining is written here instead.

Start with [`maintaining.md`](maintaining.md): how to update, fix, change and
release the app, step by step, without anyone who built it.

- [`specs/`](specs/README.md): the constitution and one spec per screen or
  service. They describe the app as it is, and change before the code does.
- [`history/`](history/README.md): how the app was planned and built, kept as
  a record and no longer maintained.

The reference pages:

| Page                                                                   | What it answers                                                 |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`business-rules.md`](business-rules.md)                               | The rules the owner pinned to the Figma frames, BR-33 first     |
| [`development.md`](development.md)                                     | How to run, check and change the code                           |
| [`cetus.md`](cetus.md)                                                 | Why the app looks as it does: colour, type and icons            |
| [`curated-files.md`](curated-files.md)                                 | The hand-written files in `data/`, field by field               |
| [`engine.md`](engine.md)                                               | The rules engine over `grafo.yaml`, and which goals it offers   |
| [`narrative.md`](narrative.md)                                         | What the profile can prove of the story                         |
| [`deferred.md`](deferred.md)                                           | What was set aside for a later version                          |
| [`equipment-unlock-requirements.md`](equipment-unlock-requirements.md) | Every gate an item can have, and whether the profile shows it   |
| [`place-index.md`](place-index.md)                                     | Where the place index comes from, and what it cannot answer     |
| [`system.md`](system.md)                                               | How the world and the player join, and the states that follow   |
| [`items.md`](items.md)                                                 | The item catalog under the item page and the Overview           |
| [`scenario-guidelines.md`](scenario-guidelines.md)                     | The grammar every item view shares                              |
| [`acquisition-scenarios.md`](acquisition-scenarios.md)                 | How an item's parts group into a scenario                       |
| [`api.md`](api.md)                                                     | The outside sources, DE's profile endpoint first, and its locks |
| [`step-by-step.md`](step-by-step.md)                                   | What Step by step draws and where its words come from           |
| [`content-updates.md`](content-updates.md)                             | How a new Warframe update enters the app                        |
| [`ui.md`](ui.md)                                                       | Every route with its spec and frames, and where each link goes  |
| [`desktop.md`](desktop.md)                                             | How the desktop app is built, run, packaged and updated         |
| [`privacy.md`](privacy.md)                                             | The privacy policy: what the app reads, keeps and sends         |

All documentation is written in English.
