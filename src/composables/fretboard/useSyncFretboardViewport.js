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
      () => viewport.visibleStringBounds.value.minString,
      () => viewport.visibleStringBounds.value.maxString,
    ],
    ([minFret, maxFret, minString, maxString]) => {
      explore.syncVisibleRanges({
        startFret: minFret,
        endFret: maxFret,
        startString: minString,
        endString: maxString,
      });
    },
    { immediate: true },
  );

  return viewport;
};
