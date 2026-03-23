import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import { useScaleStore } from "@/stores/scale";
import { defaultIntervalLabels, paletteColors } from "@/stores/constants";

export const useExploreStore = defineStore("explore", () => {
  const instrument = useInstrumentStore();
  const scale = useScaleStore();
  const onlyHighlighted = ref(true);
  const currentWorkspaceMode = ref("config");
  const preferredExploreLabelMode = ref("intervals");
  const exploreIntervalColorOverrides = ref({});
  const useDefaultExploreScaleHighlights = ref(true);
  const visibleFretRangeStart = ref(0);
  const visibleFretRangeEnd = ref(12);
  const visibleStringRangeStart = ref(1);
  const visibleStringRangeEnd = ref(instrument.tuningIndexes.length);

  const effectiveFretLabelMode = computed(() =>
    currentWorkspaceMode.value === "focus"
      ? preferredExploreLabelMode.value
      : "notes",
  );

  const setWorkspaceMode = (mode) => {
    currentWorkspaceMode.value = mode;

    if (mode === "config") {
      onlyHighlighted.value = true;
    }
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
      scale.selectedIntervalSemitoneSet.has(semitones)
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
    const nextOverrides = { ...exploreIntervalColorOverrides.value };
    delete nextOverrides[semitones];
    exploreIntervalColorOverrides.value = nextOverrides;
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

  const resetVisibleFretRange = (startFret, endFret) => {
    const nextStart = Math.min(startFret, endFret);
    const nextEnd = Math.max(startFret, endFret);

    visibleFretRangeStart.value = nextStart;
    visibleFretRangeEnd.value = nextEnd;
  };

  const setVisibleFretRange = (startFret, endFret) => {
    const nextStart = Math.min(startFret, endFret);
    const nextEnd = Math.max(startFret, endFret);

    visibleFretRangeStart.value = nextStart;
    visibleFretRangeEnd.value = nextEnd;
  };

  const isFretVisible = (fret) =>
    fret >= visibleFretRangeStart.value && fret <= visibleFretRangeEnd.value;

  const resetVisibleStringRange = (startString, endString) => {
    const nextStart = Math.min(startString, endString);
    const nextEnd = Math.max(startString, endString);

    visibleStringRangeStart.value = nextStart;
    visibleStringRangeEnd.value = nextEnd;
  };

  const setVisibleStringRange = (startString, endString) => {
    const nextStart = Math.min(startString, endString);
    const nextEnd = Math.max(startString, endString);

    visibleStringRangeStart.value = nextStart;
    visibleStringRangeEnd.value = nextEnd;
  };

  const isStringVisible = (stringPosition) =>
    stringPosition >= visibleStringRangeStart.value &&
    stringPosition <= visibleStringRangeEnd.value;

  const getDisplayLabel = (noteIndex) => {
    if (
      effectiveFretLabelMode.value !== "intervals" ||
      scale.selectedRootNote === null
    ) {
      return instrument.musicalNotes[noteIndex];
    }

    const semitones = (noteIndex - scale.selectedRootNote + 12) % 12;

    return (
      scale.selectedIntervalLabelMap[semitones] ??
      defaultIntervalLabels[semitones]
    );
  };

  const getDisplayColor = (noteIndex) => {
    if (
      currentWorkspaceMode.value === "focus" &&
      scale.selectedRootNote !== null
    ) {
      const semitones = (noteIndex - scale.selectedRootNote + 12) % 12;

      return getExploreIntervalColor(semitones) ?? "bg-zinc-600";
    }

    if (currentWorkspaceMode.value === "config") {
      return scale.highlightedNotes[noteIndex]
        ? paletteColors.rose
        : "bg-zinc-600";
    }
  };

  const isNoteVisible = (noteIndex) => {
    if (!onlyHighlighted.value) {
      return true;
    }

    if (
      currentWorkspaceMode.value === "focus" &&
      scale.selectedRootNote !== null
    ) {
      const semitones = (noteIndex - scale.selectedRootNote + 12) % 12;

      return getExploreIntervalColor(semitones) !== null;
    }

    return Boolean(scale.highlightedNotes[noteIndex]);
  };

  return {
    clearAllExploreIntervalHighlights,
    clearExploreIntervalColor,
    currentWorkspaceMode,
    effectiveFretLabelMode,
    getDisplayColor,
    getDisplayLabel,
    getExploreIntervalColor,
    isFretVisible,
    isNoteVisible,
    isStringVisible,
    onlyHighlighted,
    paletteColors,
    preferredExploreLabelMode,
    resetVisibleFretRange,
    resetVisibleStringRange,
    resetExploreIntervalHighlightsToScale,
    setVisibleFretRange,
    setVisibleStringRange,
    setExploreIntervalColor,
    setPreferredExploreLabelMode,
    setWorkspaceMode,
    toggleHighlighted,
    visibleFretRangeEnd,
    visibleFretRangeStart,
    visibleStringRangeEnd,
    visibleStringRangeStart,
  };
});
