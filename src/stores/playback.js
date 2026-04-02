import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";

import { guitarPlaybackEngine } from "@/audio/guitarPlaybackEngine";
import {
  getBassRelativeIntervalLabel,
  getRootRelativeIntervalLabel,
  identifyChordMatch,
} from "@/music/chordAnalysis";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const toneOptions = Object.freeze([
  { id: "clean", label: "Clean" },
  { id: "overdriven", label: "Overdriven" },
  { id: "distorted", label: "Distorted" },
]);

const clamp = (value, minValue, maxValue) =>
  Math.min(Math.max(value, minValue), maxValue);

const RETRIGGER_RELEASE_MS = 24;
const RETRIGGER_START_LEAD_TIME_SECONDS = 0.035;

let voiceCounter = 0;

const intervalLabelOrder = Object.freeze({
  R: 0,
  "♭2": 1,
  2: 2,
  "♭3": 3,
  3: 4,
  4: 5,
  "#4": 6,
  "♭5": 6,
  5: 7,
  "♭6": 8,
  6: 9,
  "♭7": 10,
  7: 11,
  "♭9": 12,
  9: 13,
  11: 14,
  "#11": 15,
  "♭13": 16,
  13: 17,
});

const createVoiceId = () => `voice-${Date.now()}-${voiceCounter++}`;
const getNotePositionKey = (stringPosition, fret) =>
  `${stringPosition}:${fret}`;
const sortNotesByPitch = (leftNote, rightNote) =>
  leftNote.midiNumber - rightNote.midiNumber ||
  leftNote.stringNumber - rightNote.stringNumber ||
  leftNote.fret - rightNote.fret;
const sortFormulaChips = (leftChip, rightChip) =>
  (intervalLabelOrder[leftChip.label] ?? Number.POSITIVE_INFINITY) -
    (intervalLabelOrder[rightChip.label] ?? Number.POSITIVE_INFINITY) ||
  leftChip.label.localeCompare(rightChip.label);

export const usePlaybackStore = defineStore("playback", () => {
  const explore = useExploreStore();
  const instrument = useInstrumentStore();
  const tone = ref("overdriven");
  const volume = ref(70);
  const selectedNotePositionsByString = ref({});
  const selectedRootPositionKey = ref(null);
  const activeNotesByString = ref({});
  const hasAudioSupport = ref(guitarPlaybackEngine.isSupported());
  const selectedVoicing = computed(() =>
    Object.values(selectedNotePositionsByString.value)
      .map(({ fret, stringNumber }) => ({
        ...instrument.getNoteDetails(stringNumber, fret),
        key: getNotePositionKey(stringNumber, fret),
      }))
      .sort(sortNotesByPitch),
  );
  const hasSelectedNotes = computed(() => selectedVoicing.value.length > 0);
  const bassNote = computed(() => selectedVoicing.value[0] ?? null);
  const manualRootNote = computed(
    () =>
      selectedVoicing.value.find(
        (noteDetails) => noteDetails.key === selectedRootPositionKey.value,
      ) ?? null,
  );
  const selectedPitchClassIndexes = computed(() =>
    Array.from(new Set(selectedVoicing.value.map((note) => note.noteIndex))),
  );
  const bassRelativeMatch = computed(() => {
    if (!bassNote.value) {
      return null;
    }

    return identifyChordMatch({
      noteIndexes: selectedPitchClassIndexes.value,
      noteNames: instrument.musicalNotes,
      bassNoteIndex: bassNote.value.noteIndex,
      preferredRootNoteIndex: bassNote.value.noteIndex,
      preferredRootMidiNumber: bassNote.value.midiNumber,
      selectedNotes: selectedVoicing.value,
    });
  });
  const selectedRootMatch = computed(() => {
    if (!manualRootNote.value) {
      return null;
    }

    return identifyChordMatch({
      noteIndexes: selectedPitchClassIndexes.value,
      noteNames: instrument.musicalNotes,
      bassNoteIndex: bassNote.value?.noteIndex ?? null,
      preferredRootNoteIndex: manualRootNote.value?.noteIndex ?? null,
      preferredRootMidiNumber: manualRootNote.value?.midiNumber ?? null,
      selectedNotes: selectedVoicing.value,
    });
  });
  const analysisNotes = computed(() => {
    if (!bassNote.value) {
      return [];
    }

    return selectedVoicing.value.map((noteDetails, index) => {
      const intervalSemitones =
        (noteDetails.noteIndex - bassNote.value.noteIndex + 12) % 12;
      const bassRelativeIntervalLabel = getBassRelativeIntervalLabel({
        rootMidiNumber: bassNote.value.midiNumber,
        rootNoteIndex: bassNote.value.noteIndex,
        noteMidiNumber: noteDetails.midiNumber,
        noteIndex: noteDetails.noteIndex,
      });
      const rootRelativeIntervalLabel = manualRootNote.value
        ? getRootRelativeIntervalLabel({
            rootMidiNumber: manualRootNote.value.midiNumber,
            rootNoteIndex: manualRootNote.value.noteIndex,
            noteMidiNumber: noteDetails.midiNumber,
            noteIndex: noteDetails.noteIndex,
          })
        : null;

      return {
        ...noteDetails,
        intervalSemitones,
        bassRelativeIntervalLabel,
        rootRelativeIntervalLabel,
        displayIntervalLabel:
          rootRelativeIntervalLabel ?? bassRelativeIntervalLabel,
        isBass: index === 0,
        isRoot: manualRootNote.value?.key === noteDetails.key,
        positionLabel: `String ${noteDetails.stringNumber} • Fret ${noteDetails.fret}`,
      };
    });
  });
  const currentFormulaChips = computed(() => {
    const chipsByLabel = new Map();

    analysisNotes.value.forEach((noteDetails) => {
      const currentChip = chipsByLabel.get(noteDetails.displayIntervalLabel);

      if (!currentChip) {
        chipsByLabel.set(noteDetails.displayIntervalLabel, {
          id: manualRootNote.value
            ? `${noteDetails.key}-root`
            : noteDetails.key,
          label: noteDetails.displayIntervalLabel,
          note: noteDetails.label,
        });
        return;
      }

      currentChip.note = `${currentChip.note}, ${noteDetails.label}`;
    });

    return Array.from(chipsByLabel.values()).sort(sortFormulaChips);
  });

  const getActiveNoteForString = (stringPosition) =>
    activeNotesByString.value[stringPosition] ?? null;

  const clearActiveNoteForString = (stringPosition, voiceId = null) => {
    const currentNote = getActiveNoteForString(stringPosition);

    if (!currentNote || (voiceId !== null && currentNote.voiceId !== voiceId)) {
      return;
    }

    const nextActiveNotes = { ...activeNotesByString.value };
    delete nextActiveNotes[stringPosition];
    activeNotesByString.value = nextActiveNotes;
  };

  const setTone = (nextTone) => {
    if (!toneOptions.some((option) => option.id === nextTone)) {
      return;
    }

    tone.value = nextTone;
  };

  const setVolume = (nextVolume) => {
    volume.value = clamp(Number(nextVolume), 0, 100);
  };

  const stopAllAudio = (releaseMs = 90) => {
    activeNotesByString.value = {};
    guitarPlaybackEngine.stopAll({ releaseMs });
  };

  const retriggerSelectedVoicing = async (releaseMs = RETRIGGER_RELEASE_MS) => {
    hasAudioSupport.value = guitarPlaybackEngine.isSupported();

    stopAllAudio(releaseMs);

    if (!hasAudioSupport.value) {
      return false;
    }

    if (
      !explore.playbackEnabled ||
      explore.currentWorkspaceMode !== "focus" ||
      selectedVoicing.value.length === 0
    ) {
      return true;
    }

    const isReady = await guitarPlaybackEngine.ensureReady();

    if (!isReady) {
      hasAudioSupport.value = false;
      return false;
    }

    const startTime =
      guitarPlaybackEngine.getScheduledStartTime(
        RETRIGGER_START_LEAD_TIME_SECONDS,
      ) ?? undefined;
    const nextActiveNotes = {};

    const playResults = await Promise.all(
      selectedVoicing.value.map(async (noteDetails) => {
        const voiceId = createVoiceId();
        const didStart = await guitarPlaybackEngine.playVoice({
          voiceId,
          midiNumber: noteDetails.midiNumber,
          tone: tone.value,
          stringPosition: noteDetails.stringNumber,
          stringCount: instrument.tuningMidiNumbers.length,
          startTime,
          onEnded: () => {
            clearActiveNoteForString(noteDetails.stringNumber, voiceId);
          },
        });

        if (didStart) {
          nextActiveNotes[noteDetails.stringNumber] = {
            voiceId,
            fret: noteDetails.fret,
            key: noteDetails.key,
          };
        }

        return didStart;
      }),
    );

    activeNotesByString.value = nextActiveNotes;

    return playResults.some(Boolean);
  };

  const clearSelectedRootIfUnavailable = () => {
    if (!selectedRootPositionKey.value) {
      return;
    }

    const hasMatchingRootSelection = selectedVoicing.value.some(
      (noteDetails) => noteDetails.key === selectedRootPositionKey.value,
    );

    if (!hasMatchingRootSelection) {
      selectedRootPositionKey.value = null;
    }
  };

  const pruneSelectedNotePositions = () => {
    const maximumStringNumber = instrument.tuningMidiNumbers.length;
    const nextSelectedNotePositions = Object.fromEntries(
      Object.entries(selectedNotePositionsByString.value).filter(
        ([stringNumber]) => Number(stringNumber) <= maximumStringNumber,
      ),
    );

    if (
      Object.keys(nextSelectedNotePositions).length ===
      Object.keys(selectedNotePositionsByString.value).length
    ) {
      return;
    }

    selectedNotePositionsByString.value = nextSelectedNotePositions;
    clearSelectedRootIfUnavailable();
  };

  const isNotePositionSelected = (stringPosition, fret) =>
    selectedNotePositionsByString.value[stringPosition]?.fret === fret;

  const toggleSelectedNote = async (noteDetails) => {
    const { fret, stringNumber } = noteDetails;

    if (isNotePositionSelected(stringNumber, fret)) {
      const nextSelectedNotePositions = {
        ...selectedNotePositionsByString.value,
      };
      delete nextSelectedNotePositions[stringNumber];
      selectedNotePositionsByString.value = nextSelectedNotePositions;
    } else {
      selectedNotePositionsByString.value = {
        ...selectedNotePositionsByString.value,
        [stringNumber]: {
          fret,
          stringNumber,
        },
      };
    }

    clearSelectedRootIfUnavailable();

    return retriggerSelectedVoicing();
  };

  const toggleSelectedRoot = (noteKey) => {
    selectedRootPositionKey.value =
      selectedRootPositionKey.value === noteKey ? null : noteKey;
  };

  const resetAll = () => {
    selectedNotePositionsByString.value = {};
    selectedRootPositionKey.value = null;
    stopAllAudio(70);
  };

  watch(
    tone,
    (nextTone, previousTone) => {
      if (nextTone !== previousTone) {
        void retriggerSelectedVoicing();
      }
    },
    { flush: "sync" },
  );

  watch(
    volume,
    (nextVolume) => {
      guitarPlaybackEngine.setMasterVolume(nextVolume / 100);
    },
    { immediate: true },
  );

  watch(
    () => explore.playbackEnabled,
    (isPlaybackEnabled) => {
      if (!isPlaybackEnabled) {
        resetAll();
      }
    },
  );

  watch(
    () => explore.currentWorkspaceMode,
    (mode) => {
      if (mode !== "focus") {
        stopAllAudio();
      }
    },
  );

  watch(
    () => instrument.tuningMidiNumbers.slice(),
    () => {
      pruneSelectedNotePositions();
      void retriggerSelectedVoicing();
    },
  );

  return {
    analysisNotes,
    bassRelativeMatch,
    currentFormulaChips,
    hasSelectedNotes,
    hasAudioSupport,
    isNotePositionSelected,
    manualRootNote,
    resetAll,
    selectedVoicing,
    selectedRootMatch,
    setTone,
    toggleSelectedRoot,
    toggleSelectedNote,
    setVolume,
    tone,
    toneOptions,
    volume,
  };
});
