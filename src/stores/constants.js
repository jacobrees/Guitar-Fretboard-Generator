export const paletteColors = {
  rose: "bg-rose-700",
  orange: "bg-orange-600",
  yellow: "bg-yellow-500",
  lime: "bg-lime-600",
  emerald: "bg-emerald-600",
  cyan: "bg-cyan-600",
  navy: "bg-blue-900",
  violet: "bg-violet-600",
  fuchsia: "bg-fuchsia-600",
};

export const fretboardMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export const intervalDefinitions = {
  R: "Root",
  "♭2": "Minor 2nd",
  2: "Major 2nd",
  "♭3": "Minor 3rd",
  3: "Major 3rd",
  4: "Perfect 4th",
  "#4": "Augmented 4th",
  "♭5": "Diminished 5th",
  5: "Perfect 5th",
  "♭6": "Minor 6th",
  6: "Major 6th",
  "♭7": "Minor 7th",
  7: "Major 7th",
};

export const defaultIntervalLabels = {
  0: "R",
  1: "♭2",
  2: "2",
  3: "♭3",
  4: "3",
  5: "4",
  6: "♭5",
  7: "5",
  8: "♭6",
  9: "6",
  10: "♭7",
  11: "7",
};

export const chromaticIntervalLegend = [
  { label: "R", name: "Root" },
  { label: "♭2", name: "Minor 2nd" },
  { label: "2", name: "Major 2nd" },
  { label: "♭3", name: "Minor 3rd" },
  { label: "3", name: "Major 3rd" },
  { label: "4", name: "Perfect 4th" },
  { label: "#4 / ♭5", name: "Augmented 4th / Diminished 5th" },
  { label: "5", name: "Perfect 5th" },
  { label: "♭6", name: "Minor 6th" },
  { label: "6", name: "Major 6th" },
  { label: "♭7", name: "Minor 7th" },
  { label: "7", name: "Major 7th" },
];

export const scaleDefinitions = [
  {
    id: "ionian",
    name: "Major (Ionian)",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    labels: ["R", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "dorian",
    name: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    labels: ["R", "2", "♭3", "4", "5", "6", "♭7"],
  },
  {
    id: "phrygian",
    name: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    labels: ["R", "♭2", "♭3", "4", "5", "♭6", "♭7"],
  },
  {
    id: "lydian",
    name: "Lydian",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    labels: ["R", "2", "3", "#4", "5", "6", "7"],
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    labels: ["R", "2", "3", "4", "5", "6", "♭7"],
  },
  {
    id: "aeolian",
    name: "Minor (Aeolian)",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    labels: ["R", "2", "♭3", "4", "5", "♭6", "♭7"],
  },
  {
    id: "locrian",
    name: "Locrian",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    labels: ["R", "♭2", "♭3", "4", "♭5", "♭6", "♭7"],
  },
];
