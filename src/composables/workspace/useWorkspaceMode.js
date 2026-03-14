import { computed, ref, watch } from "vue";

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

  const activeMode = ref("config");
  const showFocusWarning = ref(false);

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

  watch(
    activeMode,
    (mode) => {
      if (mode === "config") {
        instrument.fretViewTo12();
      }

      explore.setWorkspaceMode(mode);
    },
    { immediate: true },
  );

  const goToConfig = () => {
    activeMode.value = "config";
    scrollToTop();
  };

  const goToFocus = () => {
    activeMode.value = "focus";
    scrollToTop();
  };

  const handleFocusClick = () => {
    if (!canEnterFocus.value) {
      showFocusWarning.value = true;
      return;
    }

    goToFocus();
  };

  return {
    activeMode,
    showFocusWarning,
    modeTitle,
    modeDescription,
    goToConfig,
    goToFocus,
    handleFocusClick,
  };
};
