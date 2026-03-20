import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { fretboardMarkers } from "@/stores/constants";

export const useInstrumentStore = defineStore("instrument", () => {
  const sharpsEnabled = ref(true);
  const verticalFlip = ref(true);
  const horizontalFlip = ref(false);
  const tuningIndexes = ref([7, 2, 10, 5, 0, 7]);
  const twelveFretViewId = "twelve-fret";
  const fullFretViewId = "full-24";
  const defaultFretViewId = twelveFretViewId;
  const maximumTwelveFretStart = 12;
  const twelveFretViewStart = ref(0);
  const fretViewPresets = Object.freeze({
    [twelveFretViewId]: {
      id: twelveFretViewId,
      label: "12 Fret View",
    },
    [fullFretViewId]: {
      id: fullFretViewId,
      label: "Full 24",
      startFret: 0,
      fretCount: 24,
      showOpenStringMarkers: true,
    },
  });
  const fretView = ref(defaultFretViewId);

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

  const visibleTuningIndexes = computed(() =>
    verticalFlip.value
      ? tuningIndexes.value
      : tuningIndexes.value.slice().reverse(),
  );

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

  const setTwelveFretViewStart = (startFret) => {
    const nextStart = Math.min(Math.max(startFret, 0), maximumTwelveFretStart);

    twelveFretViewStart.value = nextStart;
  };

  const twelveFretViewWindowLabel = computed(() =>
    twelveFretViewStart.value === 0
      ? "Open - 12"
      : `${twelveFretViewStart.value}-${twelveFretViewStart.value + 12}`,
  );

  const getFretViewPreset = (viewId = fretView.value) => {
    if (viewId === fullFretViewId) {
      return fretViewPresets[fullFretViewId];
    }

    return {
      ...fretViewPresets[twelveFretViewId],
      windowLabel: twelveFretViewWindowLabel.value,
      startFret: twelveFretViewStart.value,
      fretCount: twelveFretViewStart.value === 0 ? 12 : 13,
      showOpenStringMarkers: twelveFretViewStart.value === 0,
    };
  };

  const getFretRange = (viewId = fretView.value) => {
    const { startFret, fretCount, showOpenStringMarkers } =
      getFretViewPreset(viewId);
    const firstDisplayedFret = showOpenStringMarkers
      ? startFret + 1
      : startFret;

    return Array.from(
      { length: fretCount },
      (_, index) => firstDisplayedFret + index,
    );
  };

  const setFretView = (viewId) => {
    if (!fretViewPresets[viewId]) {
      return;
    }

    fretView.value = viewId;
  };

  const fretViewTo12 = (shouldResetStart = true) => {
    if (shouldResetStart) {
      setTwelveFretViewStart(0);
    }

    setFretView(defaultFretViewId);
  };

  const fretViewTo24 = () => {
    setFretView(fullFretViewId);
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
    defaultFretViewId,
    fretView,
    fretViewPresets,
    fullFretViewId,
    getFretRange,
    getFretViewPreset,
    setFretView,
    setTwelveFretViewStart,
    fretViewTo12,
    fretViewTo24,
    fretboardMarkers,
    getNote,
    lowerString,
    musicalNotes,
    raiseString,
    removeString,
    sharpsEnabled,
    maximumTwelveFretStart,
    twelveFretViewId,
    twelveFretViewStart,
    twelveFretViewWindowLabel,
    toggleSharpsEnabled,
    tuningIndexes,
    visibleTuningIndexes,
    horizontalFlip,
    verticalFlip,
  };
});
