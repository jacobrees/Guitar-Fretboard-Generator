import { computed, ref } from "vue";

import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";
import { useScaleStore } from "@/stores/scale";

const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export const useWorkspaceMode = () => {
  const instrument = useInstrumentStore();
  const scale = useScaleStore();
  const explore = useExploreStore();

  const showFocusWarning = ref(false);
  const activeMode = computed({
    get: () => explore.currentWorkspaceMode,
    set: (mode) => {
      if (mode === explore.currentWorkspaceMode) {
        return;
      }

      if (mode === "config") {
        instrument.fretViewTo12();
      }

      explore.setWorkspaceMode(mode);
    },
  });

  const canEnterFocus = computed(
    () => scale.selectedNotes.length > 1 && scale.selectedRootNote !== null,
  );

  const modeTitle = computed(() =>
    activeMode.value === "focus" ? "Explore Fretboard" : "Configure Guitar",
  );

  const modeDescription = computed(() =>
    activeMode.value === "focus"
      ? "Explore interval relationships and note placement across the fretboard"
      : "Set your instrument, map the scale, and choose the root",
  );

  const goToConfig = () => {
    activeMode.value = "config";
    scrollToTop();
  };

  const enterFocusMode = () => {
    activeMode.value = "focus";
    scrollToTop();
  };

  const goToFocus = () => {
    if (!canEnterFocus.value) {
      showFocusWarning.value = true;
      return;
    }

    enterFocusMode();
  };

  return {
    activeMode,
    showFocusWarning,
    modeTitle,
    modeDescription,
    goToConfig,
    goToFocus,
  };
};
