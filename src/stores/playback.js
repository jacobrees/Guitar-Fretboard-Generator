import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";

import { guitarPlaybackEngine } from "@/audio/guitarPlaybackEngine";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const toneOptions = Object.freeze([
  { id: "clean", label: "Clean" },
  { id: "overdriven", label: "Overdriven" },
  { id: "distorted", label: "Distorted" },
]);

const playStyleOptions = Object.freeze([
  { id: "hold", label: "Hold" },
  { id: "fade", label: "Fade" },
]);

const clamp = (value, minValue, maxValue) =>
  Math.min(Math.max(value, minValue), maxValue);

let voiceCounter = 0;

const createVoiceId = () => `voice-${Date.now()}-${voiceCounter++}`;

export const usePlaybackStore = defineStore("playback", () => {
  const explore = useExploreStore();
  const instrument = useInstrumentStore();
  const tone = ref("overdriven");
  const playStyle = ref("fade");
  const fadeOutMs = ref(1200);
  const volume = ref(70);
  const activeNotesByString = ref({});
  const hasAudioSupport = ref(guitarPlaybackEngine.isSupported());
  const hasActiveNotes = computed(
    () => Object.keys(activeNotesByString.value).length > 0,
  );

  const getActiveNoteForString = (stringPosition) =>
    activeNotesByString.value[stringPosition] ?? null;

  const setActiveNoteForString = (stringPosition, nextNote) => {
    activeNotesByString.value = {
      ...activeNotesByString.value,
      [stringPosition]: nextNote,
    };
  };

  const clearActiveNoteForString = (stringPosition, voiceId = null) => {
    const currentNote = getActiveNoteForString(stringPosition);

    if (!currentNote || (voiceId !== null && currentNote.voiceId !== voiceId)) {
      return;
    }

    const nextActiveNotes = { ...activeNotesByString.value };
    delete nextActiveNotes[stringPosition];
    activeNotesByString.value = nextActiveNotes;
  };

  const stopStringNote = (stringPosition, releaseMs = 90) => {
    const activeNote = getActiveNoteForString(stringPosition);

    if (!activeNote) {
      return;
    }

    clearActiveNoteForString(stringPosition);
    guitarPlaybackEngine.stopVoice(activeNote.voiceId, { releaseMs });
  };

  const stopAll = () => {
    activeNotesByString.value = {};
    guitarPlaybackEngine.stopAll({ releaseMs: 90 });
  };

  const setTone = (nextTone) => {
    if (!toneOptions.some((option) => option.id === nextTone)) {
      return;
    }

    tone.value = nextTone;
  };

  const setPlayStyle = (nextStyle) => {
    if (!playStyleOptions.some((option) => option.id === nextStyle)) {
      return;
    }

    playStyle.value = nextStyle;
  };

  const setFadeOutMs = (nextFadeOutMs) => {
    fadeOutMs.value = clamp(Number(nextFadeOutMs), 150, 4000);
  };

  const setVolume = (nextVolume) => {
    volume.value = clamp(Number(nextVolume), 0, 100);
  };

  const getNotePositionPlaybackState = (stringPosition, fret) => {
    const activeNote = getActiveNoteForString(stringPosition);

    if (!activeNote || activeNote.fret !== fret) {
      return null;
    }

    return activeNote.state;
  };

  const isNotePositionActive = (stringPosition, fret) =>
    getNotePositionPlaybackState(stringPosition, fret) !== null;

  const isNotePositionFading = (stringPosition, fret) =>
    getNotePositionPlaybackState(stringPosition, fret) === "fading";

  const triggerNote = async (noteDetails) => {
    hasAudioSupport.value = guitarPlaybackEngine.isSupported();

    if (!hasAudioSupport.value) {
      return false;
    }

    const stringPosition = noteDetails.stringNumber;
    const currentNote = getActiveNoteForString(stringPosition);
    const nextStyle = playStyle.value;

    if (
      nextStyle === "hold" &&
      currentNote &&
      currentNote.fret === noteDetails.fret &&
      currentNote.state === "holding"
    ) {
      stopStringNote(stringPosition, 80);
      return true;
    }

    if (currentNote) {
      stopStringNote(stringPosition, 70);
    }

    const voiceId = createVoiceId();
    const didStart = await guitarPlaybackEngine.playVoice({
      voiceId,
      midiNumber: noteDetails.midiNumber,
      tone: tone.value,
      playStyle: nextStyle,
      fadeOutMs: fadeOutMs.value,
      stringPosition,
      stringCount: instrument.tuningMidiNumbers.length,
      onEnded: () => {
        clearActiveNoteForString(stringPosition, voiceId);
      },
    });

    if (!didStart) {
      return false;
    }

    setActiveNoteForString(stringPosition, {
      voiceId,
      fret: noteDetails.fret,
      noteIndex: noteDetails.noteIndex,
      midiNumber: noteDetails.midiNumber,
      state: nextStyle === "hold" ? "holding" : "fading",
    });

    return true;
  };

  watch(
    tone,
    (nextTone, previousTone) => {
      if (nextTone !== previousTone) {
        stopAll();
      }
    },
    { flush: "sync" },
  );

  watch(
    playStyle,
    (nextStyle, previousStyle) => {
      if (nextStyle !== previousStyle) {
        stopAll();
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
        stopAll();
      }
    },
  );

  watch(
    () => explore.currentWorkspaceMode,
    (mode) => {
      if (mode !== "focus") {
        stopAll();
      }
    },
  );

  return {
    activeNotesByString,
    fadeOutMs,
    hasActiveNotes,
    hasAudioSupport,
    isNotePositionActive,
    isNotePositionFading,
    playStyle,
    playStyleOptions,
    setFadeOutMs,
    setPlayStyle,
    setTone,
    setVolume,
    stopAll,
    stopStringNote,
    tone,
    toneOptions,
    triggerNote,
    volume,
  };
});
