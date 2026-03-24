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

const buildInitialCustomIntervals = () => {
  const nextIntervals = Array(12).fill(null);
  nextIntervals[0] = paletteColors.rose;
  return nextIntervals;
};

export const useScaleStore = defineStore("scale", () => {
  const instrument = useInstrumentStore();
  const scaleBuilderMode = ref("preset");
  const presetRootNote = ref(3);
  const presetScaleDefinitionId = ref(scaleDefinitions[0]?.id ?? null);
  const customHighlightedIntervals = ref(buildInitialCustomIntervals());
  const customSelectedRootNote = ref(null);

  const presetScaleDefinitions = scaleDefinitions;
  const intervalLegend = chromaticIntervalLegend;

  const selectedPresetScaleDefinition = computed(
    () =>
      scaleDefinitions.find(
        (scaleDefinition) =>
          scaleDefinition.id === presetScaleDefinitionId.value,
      ) ?? null,
  );

  const buildPresetHighlights = (rootNote, scaleDefinition) => {
    const nextHighlights = Array(12).fill(null);

    if (!scaleDefinition) {
      return nextHighlights;
    }

    scaleDefinition.intervals.forEach((interval) => {
      const noteIndex = (rootNote + interval) % 12;
      nextHighlights[noteIndex] = paletteColors.rose;
    });

    return nextHighlights;
  };

  const customSelectedIntervalIndexes = computed(() =>
    customHighlightedIntervals.value.reduce((indexes, value, semitones) => {
      if (value) {
        indexes.push(semitones);
      }

      return indexes;
    }, []),
  );

  const customIntervalOptions = computed(() =>
    Array.from({ length: 12 }, (_, semitones) => {
      const legendEntry = chromaticIntervalLegend[semitones];
      const fallbackLabel = defaultIntervalLabels[semitones];

      return {
        semitones,
        label: legendEntry?.label ?? fallbackLabel,
        name: legendEntry?.name ?? intervalDefinitions[fallbackLabel],
        isRequired: semitones === 0,
        isSelected: Boolean(customHighlightedIntervals.value[semitones]),
      };
    }),
  );

  const customSelectedIntervals = computed(() =>
    customIntervalOptions.value.filter((interval) => interval.isSelected),
  );

  const customSelectedIntervalCount = computed(
    () => customSelectedIntervals.value.length,
  );

  const customMatchedScaleDefinition = computed(
    () =>
      scaleDefinitions.find(
        (scale) =>
          scale.intervals.length ===
            customSelectedIntervalIndexes.value.length &&
          scale.intervals.every(
            (interval, index) =>
              interval === customSelectedIntervalIndexes.value[index],
          ),
      ) ?? null,
  );

  const buildCustomHighlights = (rootNote) => {
    const nextHighlights = Array(12).fill(null);

    if (rootNote === null) {
      return nextHighlights;
    }

    customSelectedIntervalIndexes.value.forEach((semitones) => {
      const noteIndex = (rootNote + semitones) % 12;
      nextHighlights[noteIndex] = paletteColors.rose;
    });

    return nextHighlights;
  };

  const highlightedNotes = computed(() =>
    scaleBuilderMode.value === "preset"
      ? buildPresetHighlights(
          presetRootNote.value,
          selectedPresetScaleDefinition.value,
        )
      : buildCustomHighlights(customSelectedRootNote.value),
  );

  const selectedRootNote = computed(() => {
    if (scaleBuilderMode.value === "preset") {
      return selectedPresetScaleDefinition.value === null
        ? null
        : presetRootNote.value;
    }

    return customSelectedRootNote.value;
  });

  const setScaleBuilderMode = (mode) => {
    if (mode === scaleBuilderMode.value) {
      return;
    }

    scaleBuilderMode.value = mode;
  };

  const setPresetRootNote = (noteIndex) => {
    presetRootNote.value = noteIndex;
  };

  const setPresetScaleDefinition = (definitionId) => {
    presetScaleDefinitionId.value = definitionId;
  };

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

  const rootNoteOptions = computed(() =>
    instrument.musicalNotes.map((note, index) => ({
      index,
      note,
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
      modeName: matchedScaleDefinition.value?.name ?? "Custom",
      name: matchedScaleDefinition.value
        ? `${root} - ${matchedScaleDefinition.value.name}`
        : `${root} - Custom`,
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

  const toggleIntervalHighlight = (semitones) => {
    if (scaleBuilderMode.value !== "custom" || semitones === 0) {
      return;
    }

    customHighlightedIntervals.value.splice(
      semitones,
      1,
      customHighlightedIntervals.value[semitones] ? null : paletteColors.rose,
    );
  };

  const toggleRootNote = (note) => {
    if (scaleBuilderMode.value !== "custom") {
      return;
    }

    customSelectedRootNote.value =
      customSelectedRootNote.value === note ? null : note;
  };

  return {
    chromaticIntervalRows,
    customIntervalOptions,
    customMatchedScaleDefinition,
    customSelectedIntervalCount,
    customSelectedIntervals,
    highlightedNotes,
    intervalLegend,
    presetRootNote,
    presetScaleDefinitionId,
    presetScaleDefinitions,
    rootNoteOptions,
    scaleBuilderMode,
    selectedIntervalLabelMap,
    selectedIntervalSemitoneSet,
    selectedNotes,
    selectedRootNote,
    selectedScaleSummary,
    setPresetRootNote,
    setPresetScaleDefinition,
    setScaleBuilderMode,
    toggleIntervalHighlight,
    toggleRootNote,
  };
});
