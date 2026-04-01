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

  const normalizeRange = (startValue, endValue) => ({
    start: Math.min(startValue, endValue),
    end: Math.max(startValue, endValue),
  });

  const shouldKeepScrolledOpenStringsVisible = () =>
    currentWorkspaceMode.value === "focus" &&
    instrument.fretView === instrument.twelveFretViewId &&
    instrument.twelveFretViewStart > 0;

  const isNotePositionWithinInteractiveFilterRange = (stringPosition, fret) => {
    if (
      stringPosition < visibleStringRangeStart.value ||
      stringPosition > visibleStringRangeEnd.value
    ) {
      return false;
    }

    if (
      fret >= visibleFretRangeStart.value &&
      fret <= visibleFretRangeEnd.value
    ) {
      return true;
    }

    return fret === 0 && shouldKeepScrolledOpenStringsVisible();
  };

  const applyVisibleRanges = ({
    startFret = visibleFretRangeStart.value,
    endFret = visibleFretRangeEnd.value,
    startString = visibleStringRangeStart.value,
    endString = visibleStringRangeEnd.value,
    resetOverrides = false,
    pruneOverrides = false,
  } = {}) => {
    const nextFretRange = normalizeRange(startFret, endFret);
    const nextStringRange = normalizeRange(startString, endString);

    visibleFretRangeStart.value = nextFretRange.start;
    visibleFretRangeEnd.value = nextFretRange.end;
    visibleStringRangeStart.value = nextStringRange.start;
    visibleStringRangeEnd.value = nextStringRange.end;

    if (resetOverrides) {
      notePositionVisibilityOverrides.value = {};
    } else if (pruneOverrides) {
      pruneNotePositionVisibilityOverrides();
    }
  };

  const resetVisibleFretRange = (startFret, endFret) => {
    applyVisibleRanges({ startFret, endFret });
  };

  const setVisibleFretRange = (startFret, endFret) => {
    applyVisibleRanges({ startFret, endFret, resetOverrides: true });
  };

  const isFretVisible = (fret) =>
    currentWorkspaceMode.value !== "focus" ||
    isPlaybackModeActive.value ||
    (fret >= visibleFretRangeStart.value && fret <= visibleFretRangeEnd.value);

  const resetVisibleStringRange = (startString, endString) => {
    applyVisibleRanges({ startString, endString });
  };

  const setVisibleStringRange = (startString, endString) => {
    applyVisibleRanges({ startString, endString, resetOverrides: true });
  };

  const syncVisibleRanges = ({
    startFret = visibleFretRangeStart.value,
    endFret = visibleFretRangeEnd.value,
    startString = visibleStringRangeStart.value,
    endString = visibleStringRangeEnd.value,
  } = {}) => {
    const nextFretRange = normalizeRange(startFret, endFret);
    const hasFretViewportChanged =
      nextFretRange.start !== visibleFretRangeStart.value ||
      nextFretRange.end !== visibleFretRangeEnd.value;

    applyVisibleRanges({
      startFret: nextFretRange.start,
      endFret: nextFretRange.end,
      startString,
      endString,
    });

    if (hasFretViewportChanged) {
      resetOpenStringVisibilityOverrides();
    }

    pruneNotePositionVisibilityOverrides();
  };

  const isStringVisible = (stringPosition) =>
    currentWorkspaceMode.value !== "focus" ||
    isPlaybackModeActive.value ||
    (stringPosition >= visibleStringRangeStart.value &&
      stringPosition <= visibleStringRangeEnd.value);

  const getNotePositionKey = (stringPosition, fret) =>
    `${stringPosition}:${fret}`;

  const isNotePositionWithinFilterRanges = (stringPosition, fret) =>
    stringPosition >= visibleStringRangeStart.value &&
    stringPosition <= visibleStringRangeEnd.value &&
    fret >= visibleFretRangeStart.value &&
    fret <= visibleFretRangeEnd.value;

  const hasNotePositionVisibilityOverride = (stringPosition, fret) =>
    Object.prototype.hasOwnProperty.call(
      notePositionVisibilityOverrides.value,
      getNotePositionKey(stringPosition, fret),
    );

  const getNotePositionVisibilityOverride = (stringPosition, fret) =>
    notePositionVisibilityOverrides.value[
      getNotePositionKey(stringPosition, fret)
    ];

  const pruneNotePositionVisibilityOverrides = () => {
    if (Object.keys(notePositionVisibilityOverrides.value).length === 0) {
      return;
    }

    notePositionVisibilityOverrides.value = Object.fromEntries(
      Object.entries(notePositionVisibilityOverrides.value).filter(([key]) => {
        const [stringPosition, fret] = key.split(":").map(Number);
        return isNotePositionWithinInteractiveFilterRange(stringPosition, fret);
      }),
    );
  };

  const resetOpenStringVisibilityOverrides = () => {
    if (Object.keys(notePositionVisibilityOverrides.value).length === 0) {
      return;
    }

    notePositionVisibilityOverrides.value = Object.fromEntries(
      Object.entries(notePositionVisibilityOverrides.value).filter(([key]) => {
        const [, fret] = key.split(":").map(Number);
        return fret !== 0;
      }),
    );
  };

  const toggleNotePositionVisibility = (noteIndex, stringPosition, fret) => {
    if (!isNotePositionWithinInteractiveFilterRange(stringPosition, fret)) {
      return false;
    }

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
    return true;
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
    isNotePositionWithinInteractiveFilterRange,
    isNotePositionVisible,
    isNotePositionWithinFilterRanges,
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
    syncVisibleRanges,
    togglePlayback,
    toggleHighlighted,
    toggleNotePositionVisibility,
    visibleFretRangeEnd,
    visibleFretRangeStart,
    visibleStringRangeEnd,
    visibleStringRangeStart,
  };
});
