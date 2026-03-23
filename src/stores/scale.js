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
  const scaleBuilderMode = ref("preset");
  const presetRootNote = ref(3);
  const presetScaleDefinitionId = ref(scaleDefinitions[0]?.id ?? null);
  const customHighlightedNotes = ref(Array(12).fill(null));
  const customSelectedRootNote = ref(null);

  const presetScaleDefinitions = computed(() => scaleDefinitions);

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

  const applyPresetSelection = () => {
    highlightedNotes.value = buildPresetHighlights(
      presetRootNote.value,
      selectedPresetScaleDefinition.value,
    );
    selectedRootNote.value =
      selectedPresetScaleDefinition.value === null
        ? null
        : presetRootNote.value;
  };

  const applyCustomSelection = () => {
    highlightedNotes.value = [...customHighlightedNotes.value];

    const hasValidRoot =
      customSelectedRootNote.value !== null &&
      Boolean(customHighlightedNotes.value[customSelectedRootNote.value]);

    selectedRootNote.value = hasValidRoot ? customSelectedRootNote.value : null;

    if (!hasValidRoot) {
      customSelectedRootNote.value = null;
    }
  };

  const setScaleBuilderMode = (mode) => {
    if (mode === scaleBuilderMode.value) {
      return;
    }

    scaleBuilderMode.value = mode;

    if (scaleBuilderMode.value === "preset") {
      applyPresetSelection();
      return;
    }

    applyCustomSelection();
  };

  const setPresetRootNote = (noteIndex) => {
    presetRootNote.value = noteIndex;

    if (scaleBuilderMode.value === "preset") {
      applyPresetSelection();
    }
  };

  const setPresetScaleDefinition = (definitionId) => {
    presetScaleDefinitionId.value = definitionId;

    if (scaleBuilderMode.value === "preset") {
      applyPresetSelection();
    }
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
    if (scaleBuilderMode.value !== "custom") {
      return;
    }

    if (
      customHighlightedNotes.value[note] &&
      customSelectedRootNote.value === note
    ) {
      customSelectedRootNote.value = null;
    }

    customHighlightedNotes.value.splice(
      note,
      1,
      customHighlightedNotes.value[note] ? null : paletteColors.rose,
    );

    applyCustomSelection();
  };

  const toggleRootNote = (note) => {
    if (
      scaleBuilderMode.value !== "custom" ||
      !customHighlightedNotes.value[note]
    ) {
      return;
    }

    customSelectedRootNote.value =
      customSelectedRootNote.value === note ? null : note;
    selectedRootNote.value = customSelectedRootNote.value;
  };

  applyPresetSelection();

  return {
    chromaticIntervalRows,
    highlightedNotes,
    intervalLegend,
    intervalNotes,
    presetRootNote,
    presetScaleDefinitionId,
    presetScaleDefinitions,
    scaleBuilderMode,
    selectedIntervalLabelMap,
    selectedIntervalSemitoneSet,
    selectedNotes,
    selectedRootNote,
    selectedScaleSummary,
    setPresetRootNote,
    setPresetScaleDefinition,
    setScaleBuilderMode,
    toggleNoteHighlight,
    toggleRootNote,
  };
});
