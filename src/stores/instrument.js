import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { fretboardMarkers } from "@/stores/constants";

export const useInstrumentStore = defineStore("instrument", () => {
  const sharpsEnabled = ref(true);
  const verticalFlip = ref(true);
  const horizontalFlip = ref(false);
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
