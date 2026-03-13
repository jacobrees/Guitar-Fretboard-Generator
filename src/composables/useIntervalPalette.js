import { computed, ref } from "vue";
import { useExploreStore } from "@/stores/explore";
import { useScaleStore } from "@/stores/scale";

export const useIntervalPalette = () => {
  const scale = useScaleStore();
  const explore = useExploreStore();

  const activeIntervalPalette = ref(null);

  const activeIntervalHighlight = computed(
    () =>
      scale.chromaticIntervalRows.find(
        (interval) => interval.semitones === activeIntervalPalette.value,
      ) ?? null,
  );

  const closeIntervalPalette = () => {
    activeIntervalPalette.value = null;
  };

  const showIntervalColorModal = computed({
    get: () => activeIntervalHighlight.value !== null,
    set: (isVisible) => {
      if (!isVisible) {
        closeIntervalPalette();
      }
    },
  });

  const activeIntervalColor = computed(() =>
    activeIntervalHighlight.value
      ? explore.getExploreIntervalColor(activeIntervalHighlight.value.semitones)
      : "",
  );

  const toggleIntervalPalette = (semitones) => {
    activeIntervalPalette.value =
      activeIntervalPalette.value === semitones ? null : semitones;
  };

  const setIntervalHighlightColor = (semitones, colorClass) => {
    explore.setExploreIntervalColor(semitones, colorClass);
    closeIntervalPalette();
  };

  const clearIntervalHighlightColor = (semitones) => {
    explore.clearExploreIntervalColor(semitones);
    closeIntervalPalette();
  };

  const setActiveIntervalHighlightColor = (colorClass) => {
    if (!activeIntervalHighlight.value) {
      return;
    }

    setIntervalHighlightColor(
      activeIntervalHighlight.value.semitones,
      colorClass,
    );
  };

  const clearActiveIntervalHighlightColor = () => {
    if (!activeIntervalHighlight.value) {
      return;
    }

    clearIntervalHighlightColor(activeIntervalHighlight.value.semitones);
  };

  return {
    activeIntervalPalette,
    activeIntervalHighlight,
    showIntervalColorModal,
    activeIntervalColor,
    paletteColors: explore.paletteColors,
    toggleIntervalPalette,
    closeIntervalPalette,
    setActiveIntervalHighlightColor,
    clearActiveIntervalHighlightColor,
  };
};
