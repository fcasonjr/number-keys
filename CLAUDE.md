# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev       # Vite dev server (--host, so reachable from a phone on the LAN)
npm test          # vitest run (tests/**/*.test.ts)
npm run build     # tsc --noEmit && vite build. This is the typecheck; there is no linter.
npm run preview   # serve dist/ (needed to see the PWA/service worker; dev doesn't register it)
npx vitest run tests/scales.test.ts -t "<test name>"   # single file / single test
```

## What this is

Number Keys: a flash card PWA for the Nashville number system (name scale degree 1–7 in any of 12 major keys). Client-only React + TypeScript + Vite, no backend; all progress is in `localStorage`. Deployed on Netlify (`npm run build`, publish `dist`), which rebuilds on every push to `main` of github.com/fcasonjr/number-keys.

## Architecture

- **Answer table is the source of truth.** `ANSWERS` in `src/data/deck.ts` is hand-written, with enharmonic spellings that matter (Gb major has Cb, B major has A#). `tests/scales.test.ts` regenerates every scale from the whole/half-step pattern with correct letter spelling (`src/lib/theory.ts`) and must match the table. Run it after touching deck or theory code.
- **Cards are data, views are computed.** A `Card` is `{key, degree, answer}` with id `"<Key>-<degree>"`. The "F# instead of Gb" setting is applied only at display time by `viewCard()` in `src/lib/cards.ts`; stored ids always use `Gb`. Don't leak `F#` into ids or stats.
- **App flow** (`src/App.tsx`): a tab shell (Practice / Study / Progress / Settings) and, when a mode is active, a full-screen session with no tab bar. That is deliberate: the Study chart must be unreachable during a quiz. Keep it that way.
- **Modes** (`src/modes/`) are components that take a card plus `onAnswer(ok, ms)` and `onNext` (`modes/types.ts`). `screens/Session.tsx` runs a single pass for flip/choice/piano/reverse; `SpeedRound` (reuses `MultipleChoice` with `fast`, which auto-advances) and `ChordDrill` run their own loops.
- **Filters and ordering** live in `src/lib/session.ts` (`Filter`, presets, `buildQueue`). `FilterPanel` edits them. Order "smart" uses `smartOrder` in `src/lib/leitner.ts`.
- **Progress state**: `src/state/store.tsx` holds one `Store` in context and saves it to localStorage on every change. `src/lib/storage.ts` defines the shape, the key `number-keys:v1`, and import/export normalization. Mastery rules (Leitner boxes, 3 s "fast", streak) are in `leitner.ts`, and the Progress heat-map reads `masteryScore`. Changing the stored shape needs a version bump or backwards-compatible `normalize()`, since real users' progress and exported JSON files exist.
- **PWA**: configured in `vite.config.ts` (`vite-plugin-pwa`, `autoUpdate`, `base: './'`). An installed copy can keep serving the old build until it is fully closed and reopened.

## Repo notes

- `number-system-app-prompt.md` (the original build brief) is in `.gitignore` on purpose; don't commit it.
- The only history is the published `main`; avoid rewriting it now that it's public.
