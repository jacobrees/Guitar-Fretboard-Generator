import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import {
  chromaticIntervalLegend,
  defaultIntervalLabels,
  intervalDefinitions,
  paletteColors,
  scaleDefinitions,
} from "@/stores/constants";

export const useScaleStore = defineStore("scale", () => {
  const instrument = useInstrumentStore();
  const highlightedNotes = ref(Array(12).fill(null));
  const selectedRootNote = ref(null);

  const selectedNotes = computed(() =>
    instrument.musicalNotes.filter(
      (note, index) => highlightedNotes.value[index],
    ),
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
      note: instrument.musicalNotes[index],
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

    const root = instrument.musicalNotes[selectedRootNote.value];
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
          note: instrument.musicalNotes[interval.noteIndex],
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
        note: instrument.musicalNotes[
          (selectedRootNote.value + semitones) % 12
        ],
        isInScale: selectedIntervalSemitoneSet.value.has(semitones),
      };
    });
  });

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

  return {
    chromaticIntervalRows,
    highlightedNotes,
    intervalLegend,
    intervalNotes,
    selectedIntervalLabelMap,
    selectedIntervalSemitoneSet,
    selectedIntervals,
    selectedNoteIndexes,
    selectedNotes,
    selectedRootNote,
    selectedScaleSummary,
    toggleNoteHighlight,
    toggleRootNote,
  };
});
