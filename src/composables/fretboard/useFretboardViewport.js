import { computed, inject, provide } from "vue";

import { useMinWidth } from "@/composables/useMinWidth";
import { useInstrumentStore } from "@/stores/instrument";

const fretboardViewportKey = Symbol("fretboardViewport");

const createFretboardViewport = () => {
  const instrument = useInstrumentStore();
  const { isMinWidth: hasFullFretRangeAccess } = useMinWidth(1536);
  const fullFretViewId = instrument.fullFretViewId;

  const effectiveFretViewId = computed(() =>
    !hasFullFretRangeAccess.value && instrument.fretView === fullFretViewId
      ? instrument.defaultFretViewId
      : instrument.fretView,
  );

  const effectiveFretPreset = computed(() =>
    instrument.getFretViewPreset(effectiveFretViewId.value),
  );

  const effectiveFrets = computed(() =>
    instrument.getFretRange(effectiveFretViewId.value),
  );

  const showOpenStringMarkers = computed(
    () => effectiveFretPreset.value.showOpenStringMarkers,
  );

  const visibleFretBounds = computed(() => ({
    minFret: showOpenStringMarkers.value ? 0 : effectiveFrets.value[0],
    maxFret: effectiveFrets.value[effectiveFrets.value.length - 1],
  }));

  const visibleStringRows = computed(() =>
    instrument.tuningIndexes.map((noteIndex, index) => ({
      position: index + 1,
      noteIndex,
      stringNumber: index + 1,
    })),
  );

  const visibleStringBounds = computed(() => ({
    minString: 1,
    maxString: visibleStringRows.value.length,
  }));

  const stringMarkers = computed(() =>
    visibleStringRows.value.map((row) => ({
      value: row.position,
      label: `${row.stringNumber}`,
    })),
  );

  const fretCellStyle = computed(() => ({
    width: `${100 / effectiveFrets.value.length}%`,
  }));

  const openStringColumnStyle = computed(() => ({
    width: `${100 / (effectiveFrets.value.length + 1)}%`,
  }));

  const showTwelveFretScroller = computed(
    () => effectiveFretViewId.value === instrument.twelveFretViewId,
  );

  return {
    hasFullFretRangeAccess,
    effectiveFretViewId,
    effectiveFrets,
    showOpenStringMarkers,
    visibleFretBounds,
    visibleStringRows,
    visibleStringBounds,
    stringMarkers,
    fretCellStyle,
    openStringColumnStyle,
    showTwelveFretScroller,
  };
};

export const provideFretboardViewport = () => {
  const viewport = createFretboardViewport();
  provide(fretboardViewportKey, viewport);
  return viewport;
};

export const useFretboardViewport = () => {
  const viewport = inject(fretboardViewportKey, null);

  if (!viewport) {
    throw new Error(
      "useFretboardViewport must be used within provideFretboardViewport()",
    );
  }

  return viewport;
};
