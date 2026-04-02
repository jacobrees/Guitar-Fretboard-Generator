import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { fretboardMarkers } from "@/stores/constants";

export const useInstrumentStore = defineStore("instrument", () => {
  const sharpsEnabled = ref(true);
  const minimumTuningMidiNumber = 21;
  const maximumTuningMidiNumber = 71;
  const tuningMidiNumbers = ref([64, 59, 55, 50, 45, 40]);
  const twelveFretViewId = "twelve-fret";
  const fullFretViewId = "full-24";
  const defaultFretViewId = twelveFretViewId;
  const maximumTwelveFretStart = 12;
  const twelveFretViewStart = ref(0);
  const fretViewPresets = Object.freeze({
    [twelveFretViewId]: {},
    [fullFretViewId]: {
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

  const getNoteIndexFromMidiNumber = (midiNumber) =>
    (((midiNumber - 21) % 12) + 12) % 12;

  const getOctaveFromMidiNumber = (midiNumber) =>
    Math.floor(midiNumber / 12) - 1;

  const getNoteLabelFromMidiNumber = (midiNumber) =>
    musicalNotes.value[getNoteIndexFromMidiNumber(midiNumber)];

  const getScientificNoteLabelFromMidiNumber = (midiNumber) =>
    `${getNoteLabelFromMidiNumber(midiNumber)}${getOctaveFromMidiNumber(midiNumber)}`;

  const clampTuningMidiNumber = (midiNumber) =>
    Math.min(
      Math.max(midiNumber, minimumTuningMidiNumber),
      maximumTuningMidiNumber,
    );

  const tuningIndexes = computed(() =>
    tuningMidiNumbers.value.map((midiNumber) =>
      getNoteIndexFromMidiNumber(midiNumber),
    ),
  );

  const toggleSharpsEnabled = () => {
    sharpsEnabled.value = !sharpsEnabled.value;
  };

  const getOpenStringMidiNumber = (stringCount) =>
    tuningMidiNumbers.value[stringCount - 1];

  const getOpenStringScientificLabel = (stringCount) =>
    getScientificNoteLabelFromMidiNumber(getOpenStringMidiNumber(stringCount));

  const minimumTuningLabel = computed(() =>
    getScientificNoteLabelFromMidiNumber(minimumTuningMidiNumber),
  );

  const maximumTuningLabel = computed(() =>
    getScientificNoteLabelFromMidiNumber(maximumTuningMidiNumber),
  );

  const canRaiseString = (index) =>
    tuningMidiNumbers.value[index] < maximumTuningMidiNumber;

  const canLowerString = (index) =>
    tuningMidiNumbers.value[index] > minimumTuningMidiNumber;

  const getNoteMidiNumber = (stringCount, fret) =>
    getOpenStringMidiNumber(stringCount) + fret;

  const getNote = (stringCount, fret) =>
    getNoteIndexFromMidiNumber(getNoteMidiNumber(stringCount, fret));

  const getNoteDetails = (stringCount, fret) => {
    const midiNumber = getNoteMidiNumber(stringCount, fret);
    const noteIndex = getNoteIndexFromMidiNumber(midiNumber);

    return {
      fret,
      stringNumber: stringCount,
      midiNumber,
      noteIndex,
      note: musicalNotes.value[noteIndex],
      octave: getOctaveFromMidiNumber(midiNumber),
      label: getScientificNoteLabelFromMidiNumber(midiNumber),
    };
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

  const raiseString = (index) => {
    if (!canRaiseString(index)) {
      return;
    }

    tuningMidiNumbers.value[index] = clampTuningMidiNumber(
      tuningMidiNumbers.value[index] + 1,
    );
  };

  const lowerString = (index) => {
    if (!canLowerString(index)) {
      return;
    }

    tuningMidiNumbers.value[index] = clampTuningMidiNumber(
      tuningMidiNumbers.value[index] - 1,
    );
  };

  const removeString = () => {
    if (tuningMidiNumbers.value.length > 5) {
      tuningMidiNumbers.value.pop();
    }
  };

  const addString = () => {
    if (tuningMidiNumbers.value.length >= 9) {
      return;
    }

    const lastStringMidiNumber =
      tuningMidiNumbers.value[tuningMidiNumbers.value.length - 1];
    tuningMidiNumbers.value.push(
      clampTuningMidiNumber(lastStringMidiNumber - 5),
    );
  };

  return {
    addString,
    canLowerString,
    canRaiseString,
    defaultFretViewId,
    fretView,
    fretViewTo12,
    fretboardMarkers,
    fullFretViewId,
    getFretRange,
    getFretViewPreset,
    getNote,
    getNoteDetails,
    getOpenStringScientificLabel,
    lowerString,
    maximumTuningLabel,
    maximumTwelveFretStart,
    minimumTuningLabel,
    musicalNotes,
    raiseString,
    removeString,
    setFretView,
    setTwelveFretViewStart,
    sharpsEnabled,
    twelveFretViewId,
    twelveFretViewStart,
    twelveFretViewWindowLabel,
    toggleSharpsEnabled,
    tuningIndexes,
    tuningMidiNumbers,
  };
});
