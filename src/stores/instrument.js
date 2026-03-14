import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { fretboardMarkers } from "@/stores/constants";

export const useInstrumentStore = defineStore("instrument", () => {
  const sharpsEnabled = ref(true);
  const verticalFlip = ref(true);
  const horizontalFlip = ref(false);
  const tuningIndexes = ref([7, 2, 10, 5, 0, 7]);
  const defaultFretViewId = "0-12";
  const fretViewPresets = Object.freeze({
    "0-12": {
      id: "0-12",
      label: "0-12",
      startFret: 0,
      fretCount: 12,
      showOpenStringMarkers: true,
    },
    "3-15": {
      id: "3-15",
      label: "3-15",
      startFret: 3,
      fretCount: 13,
      showOpenStringMarkers: false,
    },
    "6-18": {
      id: "6-18",
      label: "6-18",
      startFret: 6,
      fretCount: 13,
      showOpenStringMarkers: false,
    },
    "9-21": {
      id: "9-21",
      label: "9-21",
      startFret: 9,
      fretCount: 13,
      showOpenStringMarkers: false,
    },
    "12-24": {
      id: "12-24",
      label: "12-24",
      startFret: 12,
      fretCount: 13,
      showOpenStringMarkers: false,
    },
    "full-24": {
      id: "full-24",
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

  const flipVertically = () => {
    verticalFlip.value = !verticalFlip.value;
  };

  const flipHorizontally = () => {
    horizontalFlip.value = !horizontalFlip.value;
  };

  const getNote = (stringCount, fret) => {
    const indexes = verticalFlip.value
      ? tuningIndexes.value
      : tuningIndexes.value.slice().reverse();
    const index = indexes[stringCount - 1];

    return (index + fret) % 12;
  };

  const getFretViewPreset = (viewId = fretView.value) =>
    fretViewPresets[viewId] ?? fretViewPresets[defaultFretViewId];

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

  const fretViewTo12 = () => {
    setFretView(defaultFretViewId);
  };

  const fretViewTo24 = () => {
    setFretView("full-24");
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
    defaultFretViewId,
    fretView,
    fretViewPresets,
    getFretRange,
    getFretViewPreset,
    setFretView,
    fretViewTo12,
    fretViewTo24,
    fretboardMarkers,
    getNote,
    horizontalFlip,
    lowerString,
    musicalNotes,
    raiseString,
    removeString,
    sharpsEnabled,
    toggleSharpsEnabled,
    tuningIndexes,
    verticalFlip,
    visibleTuningIndexes,
  };
});
