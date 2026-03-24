import { watch } from "vue";

import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

import { useFretboardViewport } from "@/composables/fretboard/useFretboardViewport";

export const useSyncFretboardViewport = (viewport = useFretboardViewport()) => {
  const instrument = useInstrumentStore();
  const explore = useExploreStore();

  watch(
    [viewport.hasFullFretRangeAccess, () => instrument.fretView],
    ([hasAccess, fretView]) => {
      if (!hasAccess && fretView === instrument.fullFretViewId) {
        instrument.fretViewTo12();
      }
    },
    { immediate: true },
  );

  watch(
    [
      () => viewport.visibleFretBounds.value.minFret,
      () => viewport.visibleFretBounds.value.maxFret,
    ],
    ([minFret, maxFret]) => {
      explore.resetVisibleFretRange(minFret, maxFret);
      explore.resetVisibleStringRange(
        viewport.visibleStringBounds.value.minString,
        viewport.visibleStringBounds.value.maxString,
      );
    },
    { immediate: true },
  );

  watch(
    [
      () => viewport.visibleStringBounds.value.minString,
      () => viewport.visibleStringBounds.value.maxString,
    ],
    ([minString, maxString]) => {
      explore.resetVisibleStringRange(minString, maxString);
    },
    { immediate: true },
  );

  return viewport;
};
