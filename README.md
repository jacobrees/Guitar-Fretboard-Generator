# Guitar Fretboard Generator

A Vue 3 + Pinia sandbox for building scales, selecting roots, and exploring
interval relationships across the fretboard.

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## State Architecture

The app now uses split Pinia stores instead of a single global store:

- `src/stores/instrument.js`
  - Owns instrument and board geometry state:
  - tuning, fret range, orientation, enharmonic spelling.
- `src/stores/scale.js`
  - Owns note selection and interval/scale derivations:
  - selected notes/root, recognized mode, interval summaries.
- `src/stores/explore.js`
  - Owns Explore-mode display behavior:
  - note vs interval labeling, highlight visibility mode, interval color overrides.
- `src/stores/constants.js`
  - Shared immutable constants:
  - interval labels/definitions, mode definitions, marker/palette constants.
