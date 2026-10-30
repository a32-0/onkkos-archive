# Privacy policy

Onkko's Archive is a fan project for Warframe players. This page says what the
app reads, what it keeps, and what leaves your computer. It covers the app from
the Microsoft Store, the app from GitHub Releases and the demo at
`onkkos-archive.vercel.app`.

Last changed on 29 October 2026.

## What the app asks for

One thing: your Warframe account ID, a 24-character code. The game shows the
same public profile to anyone who looks you up, so the app asks for no login,
no password and no email. It never reads your screen or your game files, and
it can't change anything in your account.

## What it keeps, and where

Everything stays on your computer. There's no server of ours in between.

| What                                                                                                               | Where on your computer         | For how long                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ----------------------------------- |
| The fields of your profile it uses, never the whole profile                                                        | The app's folder               | Twelve hours                        |
| Your ID, the update you last played, the last place you opened, whether Onkko speaks, whether you've seen the tour | The app's cookies              | Up to a year                        |
| The steps you tick                                                                                                 | The app's storage              | Until you clear them                |
| The wiki's text and icons, Varzia's stock, the rotations                                                           | Memory, while the app is open  | A day at most; Varzia's ten minutes |
| The game's data                                                                                                    | The app's folder               | Until a newer set replaces it       |
| What went wrong, if anything: DE refusing a read, a failed update. Never your ID                                   | `app.log`, in the app's folder | Until it passes 1 MB                |

The app never keeps anything it works out from your profile.

## What leaves your computer

Only these reads, made from your own connection:

- your public profile, from `api.warframe.com`;
- text and art from `wiki.warframe.com`, `www.warframe.com` and
  `www-static.warframe.com`;
- item art, Varzia's stock and the rotations, from `warframestat.us`;
- the game data from GitHub, and on the GitHub edition, app updates too.

The Microsoft Store edition gets its updates from the Store, under
Microsoft's own terms. The app sends no analytics, shows no ads and shares
nothing with anyone. It sends your ID to nobody but DE, to read your profile.

## The demo

The demo reads no account. It shows two sample players bundled with it. Vercel
counts its page views and how fast its pages load, with no cookie and no ID.

## Removing your data

Disconnect, in Profile, forgets your ID. Uninstalling the app removes its
folder and everything above. On Linux, delete the AppImage and
`~/.config/Onkko's Archive`.

## Children

The app collects no personal information from anyone, children included.

## Changes and contact

If this policy changes, the new version goes on this page with a new date.
Questions go to the project's
[issues on GitHub](https://github.com/a32-0/onkkos-archive/issues).
