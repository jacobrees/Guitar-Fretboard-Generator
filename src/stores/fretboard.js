import { computed, ref } from "vue";
import { defineStore } from "pinia";

const intervalDefinitions = {
  R: "Root",
  b2: "Minor 2nd",
  2: "Major 2nd",
  b3: "Minor 3rd",
  3: "Major 3rd",
  4: "Perfect 4th",
  "#4": "Augmented 4th",
  b5: "Diminished 5th",
  5: "Perfect 5th",
  b6: "Minor 6th",
  6: "Major 6th",
  b7: "Minor 7th",
  7: "Major 7th",
};

const defaultIntervalLabels = {
  0: "R",
  1: "b2",
  2: "2",
  3: "b3",
  4: "3",
  5: "4",
  6: "b5",
  7: "5",
  8: "b6",
  9: "6",
  10: "b7",
  11: "7",
};

const chromaticIntervalLegend = [
  { label: "R", name: "Root" },
  { label: "b2", name: "Minor 2nd" },
  { label: "2", name: "Major 2nd" },
  { label: "b3", name: "Minor 3rd" },
  { label: "3", name: "Major 3rd" },
  { label: "4", name: "Perfect 4th" },
  { label: "#4 / b5", name: "Augmented 4th / Diminished 5th" },
  { label: "5", name: "Perfect 5th" },
  { label: "b6", name: "Minor 6th" },
  { label: "6", name: "Major 6th" },
  { label: "b7", name: "Minor 7th" },
  { label: "7", name: "Major 7th" },
];

const scaleDefinitions = [
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
    labels: ["R", "2", "b3", "4", "5", "6", "b7"],
  },
  {
    id: "phrygian",
    name: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    labels: ["R", "b2", "b3", "4", "5", "b6", "b7"],
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
    labels: ["R", "2", "3", "4", "5", "6", "b7"],
  },
  {
    id: "aeolian",
    name: "Minor (Aeolian)",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    labels: ["R", "2", "b3", "4", "5", "b6", "b7"],
  },
  {
    id: "locrian",
    name: "Locrian",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    labels: ["R", "b2", "b3", "4", "b5", "b6", "b7"],
  },
];

export const useFretboardStore = defineStore("fretboard", () => {
  const paletteColors = {
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

  const fretboardMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

  const onlyHighlighted = ref(true);
  const sharpsEnabled = ref(true);
  const verticalFlip = ref(true);
  const horizontalFlip = ref(false);
  const currentWorkspaceMode = ref("config");
  const preferredExploreLabelMode = ref("intervals");
  const exploreIntervalColorOverrides = ref({});
  const useDefaultExploreScaleHighlights = ref(true);
  const highlightedNotes = ref(Array(12).fill(null));
  const selectedRootNote = ref(null);
  const tuningIndexes = ref([7, 2, 10, 5, 0, 7]);
  const fretView = ref(12);

  const musicalNotes = computed(() => [
    "A",
    sharpsEnabled.value ? "A#" : "B♭",
    "B",
    "C",
    sharpsEnabled.value ? "C#" : "D♭",
    "D",
    sharpsEnabled.value ? "D#" : "E♭",
    "E",
    "F",
    sharpsEnabled.value ? "F#" : "G♭",
    "G",
    sharpsEnabled.value ? "G#" : "A♭",
  ]);

  const selectedNotes = computed(() =>
    musicalNotes.value.filter((note, index) => highlightedNotes.value[index]),
  );

  const selectedNoteIndexes = computed(() =>
    highlightedNotes.value.reduce((indexes, value, index) => {
      if (value) {
        indexes.push(index);
      }

      return indexes;
    }, []),
  );

  const intervalNotes = computed(() =>
    selectedNoteIndexes.value.map((index) => ({
      index,
      note: musicalNotes.value[index],
      isRoot: selectedRootNote.value === index,
    })),
  );

  const selectedIntervals = computed(() => {
    if (selectedRootNote.value === null) {
      return [];
    }

    return selectedNoteIndexes.value
      .map((index) => ({
        noteIndex: index,
        semitones: (index - selectedRootNote.value + 12) % 12,
      }))
      .sort((left, right) => left.semitones - right.semitones);
  });

  const selectedIntervalSemitoneSet = computed(
    () =>
      new Set(selectedIntervals.value.map((interval) => interval.semitones)),
  );

  const matchedScaleDefinition = computed(
    () =>
      scaleDefinitions.find(
        (scale) =>
          scale.intervals.length === selectedIntervals.value.length &&
          scale.intervals.every(
            (interval, index) =>
              interval === selectedIntervals.value[index]?.semitones,
          ),
      ) ?? null,
  );

  const selectedScaleSummary = computed(() => {
    if (selectedRootNote.value === null) {
      return null;
    }

    const root = musicalNotes.value[selectedRootNote.value];
    const intervalLabels =
      matchedScaleDefinition.value?.labels ??
      selectedIntervals.value.map(
        (interval) => defaultIntervalLabels[interval.semitones],
      );

    return {
      root,
      modeName: matchedScaleDefinition.value?.name ?? "Custom Selection",
      name: matchedScaleDefinition.value
        ? `${root} - ${matchedScaleDefinition.value.name}`
        : `${root} - Custom Selection`,
      isKnownScale: matchedScaleDefinition.value !== null,
      formula: intervalLabels.join(" - "),
      intervals: selectedIntervals.value.map((interval, index) => {
        const label = intervalLabels[index];

        return {
          label,
          name: intervalDefinitions[label],
          note: musicalNotes.value[interval.noteIndex],
        };
      }),
    };
  });

  const intervalLegend = computed(() => chromaticIntervalLegend);

  const selectedIntervalLabelMap = computed(() => {
    if (selectedRootNote.value === null) {
      return {};
    }

    return selectedIntervals.value.reduce((labels, interval, index) => {
      const label =
        matchedScaleDefinition.value?.labels[index] ??
        defaultIntervalLabels[interval.semitones];

      labels[interval.semitones] = label;
      return labels;
    }, {});
  });

  const effectiveFretLabelMode = computed(() =>
    currentWorkspaceMode.value === "focus"
      ? preferredExploreLabelMode.value
      : "notes",
  );

  const chromaticIntervalRows = computed(() => {
    if (selectedRootNote.value === null) {
      return [];
    }

    return Array.from({ length: 12 }, (_, semitones) => {
      const label =
        selectedIntervalLabelMap.value[semitones] ??
        defaultIntervalLabels[semitones];

      return {
        semitones,
        label,
        name: intervalDefinitions[label],
        note: musicalNotes.value[(selectedRootNote.value + semitones) % 12],
        isInScale: selectedIntervalSemitoneSet.value.has(semitones),
      };
    });
  });

  const visibleTuningIndexes = computed(() =>
    verticalFlip.value
      ? tuningIndexes.value
      : tuningIndexes.value.slice().reverse(),
  );

  const setWorkspaceMode = (mode) => {
    currentWorkspaceMode.value = mode;
  };

  const setPreferredExploreLabelMode = (mode) => {
    preferredExploreLabelMode.value = mode;
  };

  const getExploreIntervalColor = (semitones) => {
    if (
      Object.prototype.hasOwnProperty.call(
        exploreIntervalColorOverrides.value,
        semitones,
      )
    ) {
      return exploreIntervalColorOverrides.value[semitones];
    }

    if (
      useDefaultExploreScaleHighlights.value &&
      selectedIntervalSemitoneSet.value.has(semitones)
    ) {
      return paletteColors.rose;
    }

    return null;
  };

  const setExploreIntervalColor = (semitones, colorClass) => {
    exploreIntervalColorOverrides.value = {
      ...exploreIntervalColorOverrides.value,
      [semitones]: colorClass,
    };
  };

  const clearExploreIntervalColor = (semitones) => {
    exploreIntervalColorOverrides.value = {
      ...exploreIntervalColorOverrides.value,
      [semitones]: null,
    };
  };

  const resetExploreIntervalHighlightsToScale = () => {
    useDefaultExploreScaleHighlights.value = true;
    exploreIntervalColorOverrides.value = {};
  };

  const clearAllExploreIntervalHighlights = () => {
    useDefaultExploreScaleHighlights.value = false;
    exploreIntervalColorOverrides.value = {};
  };

  const toggleHighlighted = (value) => {
    onlyHighlighted.value = value;
  };

  const toggleNoteHighlight = (note) => {
    if (highlightedNotes.value[note] && selectedRootNote.value === note) {
      selectedRootNote.value = null;
    }

    highlightedNotes.value.splice(
      note,
      1,
      highlightedNotes.value[note] ? null : paletteColors.rose,
    );
  };

  const toggleRootNote = (note) => {
    if (!highlightedNotes.value[note]) {
      return;
    }

    selectedRootNote.value = selectedRootNote.value === note ? null : note;
  };

  const flipVertically = () => {
    verticalFlip.value = !verticalFlip.value;
  };

  const flipHorizontally = () => {
    horizontalFlip.value = !horizontalFlip.value;
  };

  const toggleSharpsEnabled = () => {
    sharpsEnabled.value = !sharpsEnabled.value;
  };

  const getNote = (stringCount, fret) => {
    const indexes = verticalFlip.value
      ? tuningIndexes.value
      : tuningIndexes.value.slice().reverse();
    const index = indexes[stringCount - 1];

    return (index + fret) % 12;
  };

  const getDisplayLabel = (noteIndex) => {
    if (
      effectiveFretLabelMode.value !== "intervals" ||
      selectedRootNote.value === null
    ) {
      return musicalNotes.value[noteIndex];
    }

    const semitones = (noteIndex - selectedRootNote.value + 12) % 12;

    return (
      selectedIntervalLabelMap.value[semitones] ??
      defaultIntervalLabels[semitones]
    );
  };

  const getDisplayColor = (noteIndex) => {
    if (
      currentWorkspaceMode.value === "focus" &&
      selectedRootNote.value !== null
    ) {
      const semitones = (noteIndex - selectedRootNote.value + 12) % 12;

      return getExploreIntervalColor(semitones) ?? "bg-zinc-600";
    }

    return highlightedNotes.value[noteIndex] ?? "bg-zinc-600";
  };

  const isNoteVisible = (noteIndex) => {
    if (!onlyHighlighted.value) {
      return true;
    }

    if (
      currentWorkspaceMode.value === "focus" &&
      selectedRootNote.value !== null
    ) {
      const semitones = (noteIndex - selectedRootNote.value + 12) % 12;

      return getExploreIntervalColor(semitones) !== null;
    }

    return Boolean(highlightedNotes.value[noteIndex]);
  };

  const fretViewTo12 = () => {
    fretView.value = 12;
  };

  const fretViewTo24 = () => {
    fretView.value = 24;
  };

  const raiseString = (index) => {
    tuningIndexes.value[index] = (tuningIndexes.value[index] + 1) % 12;
  };

  const lowerString = (index) => {
    tuningIndexes.value[index] = (tuningIndexes.value[index] + 11) % 12;
  };

  const removeString = () => {
    if (tuningIndexes.value.length > 5) {
      tuningIndexes.value.pop();
    }
  };

  const addString = () => {
    if (tuningIndexes.value.length >= 9) {
      return;
    }

    const lastStringNote = tuningIndexes.value[tuningIndexes.value.length - 1];
    tuningIndexes.value.push((lastStringNote + 7) % 12);
  };

  return {
    addString,
    flipHorizontally,
    flipVertically,
    fretView,
    fretViewTo12,
    fretViewTo24,
    fretboardMarkers,
    chromaticIntervalRows,
    clearAllExploreIntervalHighlights,
    clearExploreIntervalColor,
    currentWorkspaceMode,
    effectiveFretLabelMode,
    getDisplayColor,
    getNote,
    getDisplayLabel,
    getExploreIntervalColor,
    isNoteVisible,
    highlightedNotes,
    horizontalFlip,
    intervalLegend,
    intervalNotes,
    lowerString,
    musicalNotes,
    onlyHighlighted,
    paletteColors,
    preferredExploreLabelMode,
    raiseString,
    removeString,
    resetExploreIntervalHighlightsToScale,
    selectedNoteIndexes,
    selectedNotes,
    selectedRootNote,
    selectedScaleSummary,
    setExploreIntervalColor,
    setPreferredExploreLabelMode,
    setWorkspaceMode,
    sharpsEnabled,
    toggleRootNote,
    toggleNoteHighlight,
    toggleHighlighted,
    toggleSharpsEnabled,
    tuningIndexes,
    verticalFlip,
    visibleTuningIndexes,
  };
});
