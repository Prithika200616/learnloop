# LearnLoop

LearnLoop turns curiosity into tiny, repeatable learning adventures through short quests, knowledge checks, creative missions, and a local progress trail.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/learnloop run dev
```

The app is a client-only React experience. Progress is stored in the browser with `localStorage`; no account, database, or API key is required.

## Checks

```bash
pnpm --filter @workspace/learnloop run typecheck
pnpm --filter @workspace/learnloop run build
```

## Project map

- `artifacts/learnloop/src/App.tsx` — quests, quiz flow, progress, Forge, badges, and navigation
- `artifacts/learnloop/src/index.css` — visual system, responsive layout, and motion
- `artifacts/learnloop/public/favicon.svg` — LearnLoop app icon
- `screenshots/` — portfolio-ready desktop and mobile captures

## Product notes

- Three starter worlds: Space, Creativity, and Nature
- XP, levels, streaks, badges, Bonus Missions, and Curiosity Forge
- Reset Journey clears locally stored progress on the current device
- The interface is designed to work without sign-in and without a server
