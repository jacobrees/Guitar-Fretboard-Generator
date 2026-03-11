import { computed, ref } from "vue";
import { defineStore } from "pinia";

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

  const visibleTuningIndexes = computed(() =>
    verticalFlip.value
      ? tuningIndexes.value
      : tuningIndexes.value.slice().reverse(),
  );

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
    highlightedNotes,
    horizontalFlip,
    lowerString,
    musicalNotes,
    onlyHighlighted,
    paletteColors,
    raiseString,
    removeString,
    selectedNoteIndexes,
    selectedNotes,
    selectedRootNote,
    sharpsEnabled,
    toggleRootNote,
    toggleNoteHighlight,
    toggleHighlighted,
    toggleSharpsEnabled,
    tuningIndexes,
    verticalFlip,
    visibleTuningIndexes,
    intervalNotes,
  };
});
