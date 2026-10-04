# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
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
- **Modes** (`src/modes/`) are components that take a card plus `onAnswer(ok, ms)` and `onNext` (`modes/types.ts`). `screens/Session.tsx` runs a single pass for flip/choice/piano/reverse; `SpeedRound` (reuses `MultipleChoice` with `fast`, which auto-advances), `ChordFlip` and `ChordDrill` run their own loops. `LoopSession` repeats Classic Flip cards (the `loop` order) and intentionally does not record results, so repeats can't inflate spaced-repetition stats.
- **Filters and ordering** live in `src/lib/session.ts` (`Filter`, presets, `buildQueue`). `FilterPanel` edits them. Order "smart" uses `smartOrder` in `src/lib/leitner.ts`.
- **Progress state**: `src/state/store.tsx` holds one `Store` in context and saves it to localStorage on every change. `src/lib/storage.ts` defines the shape, the key `number-keys:v1`, and import/export normalization. Mastery rules (Leitner boxes, 3 s "fast", streak) are in `leitner.ts`, and the Progress heat-map reads `masteryScore`. Changing the stored shape needs a version bump or backwards-compatible `normalize()`, since real users' progress and exported JSON files exist.
- **Chord cards share the scale cards' stats.** `Store.cards` also holds chord cards under ids like `chord:maj6-Eb` (`chordCardId` in `src/data/chords.ts`; `<typeId>` never contains "-", so ids split cleanly), using the same Leitner logic but a more generous "fast" threshold (`CHORD_FAST_MS`). Anything iterating `Store.cards` must not assume every id is a scale card (Progress counts via `DECK` ids for that reason).
- **Chord formulas are strings** (`'1','b3','5','b7','9'` in `src/data/chords.ts`), spelled by `chordNotes()` by lowering/raising the scale note without changing its letter, so Db minor is Db Fb Ab (never E). `tests/chords.test.ts` checks every chord in every key against independent semitone counts. Keep that test passing when adding chord types.
- **Spoken answers.** The `speak` setting (default off, independent of `muted`) speaks the answer on flip in Classic Flip, Loop and Chord Flip only. Speech engines mangle "Bb" and "m7b5", so text goes through `noteWords()` and each chord type's `spoken` name in `src/lib/speech.ts`; every new chord type needs a `spoken` value.
- **PWA**: configured in `vite.config.ts` (`vite-plugin-pwa`, `autoUpdate`, `base: './'`). An installed copy can keep serving the old build until it is fully closed and reopened.

## Documentation (keep it updated)

`docs/PROJECT.md` (maintainer docs) and `docs/USER_GUIDE.md` (user guide, with screenshots in `docs/images/`) describe the app as it is. **Whenever a change affects something they state, update them in the same commit as the code.** That includes behavior, screens and labels, card or chord counts, the stored data shape, spaced-repetition numbers, test counts, deployment steps, and the chord types table. Before finishing a change, check both files for statements the change made false. If a screen's look changed, retake the matching screenshot in `docs/images/` (build, `npm run preview`, then capture at about 390 px wide). The two heat-map screenshots use made-up sample progress; label them as sample data. Two online copies of these docs also exist (Claude Docs); they are snapshots and are refreshed only when asked.

## Repo notes

- `number-system-app-prompt.md` (the original build brief) is in `.gitignore` on purpose; don't commit it.
- The only history is the published `main`; avoid rewriting it now that it's public.
