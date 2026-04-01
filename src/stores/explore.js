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
  const playbackEnabled = ref(false);
  const exploreIntervalColorOverrides = ref({});
  const useDefaultExploreScaleHighlights = ref(true);
  const notePositionVisibilityOverrides = ref({});
  const visibleFretRangeStart = ref(0);
  const visibleFretRangeEnd = ref(12);
  const visibleStringRangeStart = ref(1);
  const visibleStringRangeEnd = ref(instrument.tuningIndexes.length);
  const isPlaybackModeActive = computed(
    () => currentWorkspaceMode.value === "focus" && playbackEnabled.value,
  );
  const hasNotePositionVisibilityOverrides = computed(
    () => Object.keys(notePositionVisibilityOverrides.value).length > 0,
  );

  const effectiveFretLabelMode = computed(() =>
    currentWorkspaceMode.value === "focus"
      ? preferredExploreLabelMode.value
      : "notes",
  );

  const resetFocusWorkspaceState = () => {
    const defaultFretPreset = instrument.getFretViewPreset(
      instrument.defaultFretViewId,
    );
    const defaultFrets = instrument.getFretRange(instrument.defaultFretViewId);
    const minFret = defaultFretPreset.showOpenStringMarkers
      ? 0
      : defaultFrets[0];
    const maxFret = defaultFrets[defaultFrets.length - 1];

    onlyHighlighted.value = true;
    preferredExploreLabelMode.value = "intervals";
    playbackEnabled.value = false;
    notePositionVisibilityOverrides.value = {};
    resetVisibleFretRange(minFret, maxFret);
    resetVisibleStringRange(1, instrument.tuningIndexes.length);
  };

  const setWorkspaceMode = (mode) => {
    currentWorkspaceMode.value = mode;

    if (mode === "config") {
      resetFocusWorkspaceState();
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

  const togglePlayback = () => {
    playbackEnabled.value = !playbackEnabled.value;
  };

  const setPlaybackEnabled = (value) => {
    playbackEnabled.value = Boolean(value);
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
    currentWorkspaceMode.value !== "focus" ||
    isPlaybackModeActive.value ||
    (fret >= visibleFretRangeStart.value && fret <= visibleFretRangeEnd.value);

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
    currentWorkspaceMode.value !== "focus" ||
    isPlaybackModeActive.value ||
    (stringPosition >= visibleStringRangeStart.value &&
      stringPosition <= visibleStringRangeEnd.value);

  const getNotePositionKey = (stringPosition, fret) =>
    `${stringPosition}:${fret}`;

  const hasNotePositionVisibilityOverride = (stringPosition, fret) =>
    Object.prototype.hasOwnProperty.call(
      notePositionVisibilityOverrides.value,
      getNotePositionKey(stringPosition, fret),
    );

  const getNotePositionVisibilityOverride = (stringPosition, fret) =>
    notePositionVisibilityOverrides.value[
      getNotePositionKey(stringPosition, fret)
    ];

  const toggleNotePositionVisibility = (noteIndex, stringPosition, fret) => {
    const positionKey = getNotePositionKey(stringPosition, fret);
    const baseVisibility = isNoteVisible(noteIndex);
    const currentVisibility = hasNotePositionVisibilityOverride(
      stringPosition,
      fret,
    )
      ? getNotePositionVisibilityOverride(stringPosition, fret)
      : baseVisibility;
    const nextVisibilityOverrides = {
      ...notePositionVisibilityOverrides.value,
    };

    if (currentVisibility === baseVisibility) {
      nextVisibilityOverrides[positionKey] = !currentVisibility;
    } else {
      delete nextVisibilityOverrides[positionKey];
    }

    notePositionVisibilityOverrides.value = nextVisibilityOverrides;
  };

  const resetNotePositionVisibilityOverrides = () => {
    notePositionVisibilityOverrides.value = {};
  };

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
    if (currentWorkspaceMode.value === "config") {
      return scale.highlightedNotes[noteIndex]
        ? paletteColors.rose
        : "bg-zinc-600";
    }

    if (
      currentWorkspaceMode.value === "focus" &&
      scale.selectedRootNote !== null
    ) {
      const semitones = (noteIndex - scale.selectedRootNote + 12) % 12;

      return getExploreIntervalColor(semitones) ?? "bg-zinc-600";
    }
  };

  const isNoteVisible = (noteIndex) => {
    if (currentWorkspaceMode.value === "config") {
      return Boolean(scale.highlightedNotes[noteIndex]);
    }

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

  const isNotePositionVisible = (noteIndex, stringPosition, fret) => {
    if (isPlaybackModeActive.value) {
      return isNoteVisible(noteIndex);
    }

    if (currentWorkspaceMode.value !== "focus") {
      return isNoteVisible(noteIndex);
    }

    if (hasNotePositionVisibilityOverride(stringPosition, fret)) {
      return getNotePositionVisibilityOverride(stringPosition, fret);
    }

    return isNoteVisible(noteIndex);
  };

  return {
    clearAllExploreIntervalHighlights,
    clearExploreIntervalColor,
    currentWorkspaceMode,
    effectiveFretLabelMode,
    getDisplayColor,
    getDisplayLabel,
    getExploreIntervalColor,
    hasNotePositionVisibilityOverrides,
    isFretVisible,
    isNotePositionVisible,
    isNoteVisible,
    isStringVisible,
    onlyHighlighted,
    paletteColors,
    playbackEnabled,
    preferredExploreLabelMode,
    resetFocusWorkspaceState,
    resetNotePositionVisibilityOverrides,
    resetVisibleFretRange,
    resetVisibleStringRange,
    resetExploreIntervalHighlightsToScale,
    setVisibleFretRange,
    setVisibleStringRange,
    setExploreIntervalColor,
    setPlaybackEnabled,
    setPreferredExploreLabelMode,
    setWorkspaceMode,
    togglePlayback,
    toggleHighlighted,
    toggleNotePositionVisibility,
    visibleFretRangeEnd,
    visibleFretRangeStart,
    visibleStringRangeEnd,
    visibleStringRangeStart,
  };
});
