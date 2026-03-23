<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useDismissibleControlDock } from "@/composables/fretboard/useDismissibleControlDock";
import { useFretboardViewport } from "@/composables/fretboard/useFretboardViewport";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const explore = useExploreStore();
const instrument = useInstrumentStore();

const fretScrollTrackRef = ref(null);
const isDraggingFretScrollWindow = ref(false);
const fretScrollDragOffsetPx = ref(0);
const { dockRef, closeControls, toggleControl, isControlOpen } =
  useDismissibleControlDock();
const { hasFullFretRangeAccess, effectiveFretViewId, showTwelveFretScroller } =
  useFretboardViewport();

const twelveFretViewId = instrument.twelveFretViewId;
const fullFretViewId = instrument.fullFretViewId;
const fullNeckFretCount = 24;
const twelveFretViewportFretCount = 12;
const fretViewOptions = [
  { id: twelveFretViewId, shortLabel: "12" },
  { id: fullFretViewId, shortLabel: "24" },
];
const fretScrollMarkers = Array.from(
  { length: fullNeckFretCount / 3 + 1 },
  (_, index) => index * 3,
);

const noteSpellingState = computed(() =>
  instrument.sharpsEnabled ? "Sharps Active" : "Flats Active",
);

const exploreViewState = computed(
  () =>
    explore.preferredExploreLabelMode.charAt(0).toUpperCase() +
    explore.preferredExploreLabelMode.slice(1),
);

const visibilityState = computed(() =>
  explore.onlyHighlighted ? "Only Highlighted" : "Show All",
);

const twelveFretWindowState = computed(
  () => instrument.twelveFretViewWindowLabel,
);

const activeFretScrollWindowLabel = computed(() =>
  showTwelveFretScroller.value ? twelveFretWindowState.value : "Full 24",
);

const activeFretScrollWindowStyle = computed(() => ({
  left: showTwelveFretScroller.value
    ? `${(instrument.twelveFretViewStart / fullNeckFretCount) * 100}%`
    : "0%",
  width: showTwelveFretScroller.value
    ? `${(twelveFretViewportFretCount / fullNeckFretCount) * 100}%`
    : "100%",
}));

const isFretViewDisabled = (viewId) =>
  viewId === fullFretViewId && !hasFullFretRangeAccess.value;

const applyFretView = (viewId) => {
  if (isFretViewDisabled(viewId)) {
    return;
  }

  instrument.setFretView(viewId);
  closeControls();
};

const getFretScrollPosition = (value) => (value / fullNeckFretCount) * 100;

const applyExploreLabelMode = (mode) => {
  explore.setPreferredExploreLabelMode(mode);
};

const toggleNoteSpelling = () => {
  instrument.toggleSharpsEnabled();
};

const setHighlightedOnly = (shouldShowOnlyHighlighted) => {
  explore.toggleHighlighted(shouldShowOnlyHighlighted);
  closeControls();
};

const getFretScrollMetrics = () => {
  const trackElement = fretScrollTrackRef.value;

  if (!trackElement) {
    return null;
  }

  const rect = trackElement.getBoundingClientRect();
  const viewportWidth =
    rect.width * (twelveFretViewportFretCount / fullNeckFretCount);

  return {
    rect,
    viewportWidth,
    maxLeft: rect.width - viewportWidth,
  };
};

const setTwelveFretStartFromLeftOffset = (leftOffset) => {
  const metrics = getFretScrollMetrics();

  if (!metrics) {
    return;
  }

  const clampedLeft = Math.min(Math.max(leftOffset, 0), metrics.maxLeft);
  const nextStart = Math.round(
    (clampedLeft / metrics.rect.width) * fullNeckFretCount,
  );

  instrument.setTwelveFretViewStart(
    Math.min(Math.max(nextStart, 0), instrument.maximumTwelveFretStart),
  );
};

const handleFretScrollPointerMove = (event) => {
  if (!isDraggingFretScrollWindow.value) {
    return;
  }

  event.preventDefault();

  const metrics = getFretScrollMetrics();

  if (!metrics) {
    return;
  }

  setTwelveFretStartFromLeftOffset(
    event.clientX - metrics.rect.left - fretScrollDragOffsetPx.value,
  );
};

const stopFretScrollDragging = () => {
  isDraggingFretScrollWindow.value = false;

  if (typeof window === "undefined") {
    return;
  }

  window.removeEventListener("pointermove", handleFretScrollPointerMove);
  window.removeEventListener("pointerup", stopFretScrollDragging);
};

const startFretScrollDragging = (event, dragOffsetPx) => {
  if (!showTwelveFretScroller.value) {
    return;
  }

  event.preventDefault();
  isDraggingFretScrollWindow.value = true;
  fretScrollDragOffsetPx.value = dragOffsetPx;

  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("pointermove", handleFretScrollPointerMove);
  window.addEventListener("pointerup", stopFretScrollDragging);
};

const handleFretScrollTrackPointerDown = (event) => {
  if (!showTwelveFretScroller.value) {
    return;
  }

  if (event.target?.closest?.("[data-fret-scroll-window]")) {
    return;
  }

  const metrics = getFretScrollMetrics();

  if (!metrics) {
    return;
  }

  const centeredLeft =
    event.clientX - metrics.rect.left - metrics.viewportWidth / 2;

  setTwelveFretStartFromLeftOffset(centeredLeft);
  startFretScrollDragging(event, metrics.viewportWidth / 2);
};

const handleFretScrollWindowPointerDown = (event) => {
  if (!showTwelveFretScroller.value) {
    return;
  }

  const metrics = getFretScrollMetrics();

  if (!metrics) {
    return;
  }

  const currentLeft =
    (instrument.twelveFretViewStart / fullNeckFretCount) * metrics.rect.width;

  startFretScrollDragging(
    event,
    event.clientX - metrics.rect.left - currentLeft,
  );
};

const handleFretScrollWindowKeydown = (event) => {
  if (!showTwelveFretScroller.value) {
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();
    instrument.setTwelveFretViewStart(instrument.twelveFretViewStart - 1);
  }

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();
    instrument.setTwelveFretViewStart(instrument.twelveFretViewStart + 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    instrument.setTwelveFretViewStart(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    instrument.setTwelveFretViewStart(instrument.maximumTwelveFretStart);
  }
};

onBeforeUnmount(() => {
  stopFretScrollDragging();
});
</script>

<template>
  <div
    ref="dockRef"
    class="relative z-30 mx-auto w-full max-w-screen-2xl px-5 pb-5"
  >
    <div class="grid grid-cols-[6rem_minmax(0,1fr)] items-stretch">
      <div
        class="-mt-px flex flex-col rounded-bl-[1.75rem] border border-t-0 border-r-0 border-zinc-500/85 bg-zinc-900/90 px-3 pb-4 pt-0 text-gray-100 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
      >
        <div class="-mx-3 border-t border-zinc-500/90 px-3 pt-3">
          <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400">
            View
          </p>
          <p class="mt-1 text-[11px] text-gray-500">12 / 24</p>

          <div
            class="mt-3 overflow-hidden rounded-2xl border border-zinc-700/90 bg-zinc-800/75"
          >
            <button
              v-for="view in fretViewOptions"
              :key="view.id"
              type="button"
              :disabled="isFretViewDisabled(view.id)"
              :class="[
                'block w-full border-b border-zinc-800/90 px-0 py-2.5 text-sm font-semibold transition last:border-b-0',
                isFretViewDisabled(view.id)
                  ? 'cursor-not-allowed bg-zinc-800/70 text-gray-600'
                  : effectiveFretViewId === view.id
                    ? 'cursor-default bg-amber-50 text-zinc-950'
                    : 'cursor-pointer bg-transparent text-gray-100 hover:bg-zinc-700/80',
              ]"
              @click="applyFretView(view.id)"
            >
              {{ view.shortLabel }}
            </button>
          </div>
        </div>
      </div>

      <div
        class="-mt-px min-w-0 rounded-br-[1.75rem] border border-t-0 border-zinc-500/85 bg-zinc-900/90 text-gray-100 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
      >
        <div class="border-t border-zinc-600/90">
          <div class="flex items-end justify-between gap-3 px-4 pb-3 pt-3">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                Fret Scroll
              </p>
              <p class="mt-1 text-xs text-gray-500">
                {{
                  showTwelveFretScroller
                    ? twelveFretWindowState
                    : "Full neck visible"
                }}
              </p>
            </div>
          </div>

          <div class="border-t border-zinc-700/80 px-4 pb-4 pt-5">
            <div class="relative pb-1 pt-5">
              <div
                v-for="marker in fretScrollMarkers"
                :key="`fret-scroll-marker-${marker}`"
                :class="[
                  'absolute top-0 flex flex-col',
                  marker === 0
                    ? 'translate-x-0 items-start'
                    : marker === fullNeckFretCount
                      ? '-translate-x-full items-end'
                      : '-translate-x-1/2 items-center',
                ]"
                :style="{ left: `${getFretScrollPosition(marker)}%` }"
              >
                <span
                  :class="[
                    'rounded-md px-2 py-0.5 text-[11px] font-semibold',
                    marker === 12 || marker === fullNeckFretCount
                      ? 'border border-amber-200/80 bg-amber-50 text-zinc-900'
                      : 'text-gray-500',
                  ]"
                >
                  {{ marker }}
                </span>
              </div>

              <div
                ref="fretScrollTrackRef"
                class="relative h-12 select-none touch-none"
                @pointerdown="handleFretScrollTrackPointerDown"
              >
                <div
                  class="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-2xl border border-zinc-600/85 bg-zinc-800/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                ></div>

                <div
                  v-for="marker in fretScrollMarkers"
                  :key="`fret-scroll-tick-${marker}`"
                  class="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2"
                  :style="{
                    left: `${getFretScrollPosition(marker)}%`,
                    transform:
                      marker === 0
                        ? 'translateY(-50%)'
                        : marker === fullNeckFretCount
                          ? 'translate(-100%, -50%)'
                          : 'translate(-50%, -50%)',
                  }"
                >
                  <div
                    :class="[
                      'rounded-full',
                      marker === 12 || marker === fullNeckFretCount
                        ? 'h-6 w-1 bg-amber-50'
                        : 'h-5 w-px bg-zinc-600',
                    ]"
                  ></div>
                </div>

                <button
                  type="button"
                  data-fret-scroll-window
                  class="absolute top-1/2 z-20 flex h-10 items-center justify-between gap-3 overflow-hidden rounded-[0.95rem] border px-3 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition focus:outline-none"
                  :class="
                    showTwelveFretScroller
                      ? 'cursor-ew-resize border-rose-200/70 bg-linear-to-r from-rose-700 via-rose-600 to-rose-700 text-rose-50 focus:ring-2 focus:ring-rose-200/70'
                      : 'cursor-default border-zinc-600/85 bg-zinc-700/90 text-gray-200'
                  "
                  :style="{
                    ...activeFretScrollWindowStyle,
                    transform: 'translateY(-50%)',
                  }"
                  :tabindex="showTwelveFretScroller ? 0 : -1"
                  :aria-label="activeFretScrollWindowLabel"
                  @keydown="handleFretScrollWindowKeydown"
                  @pointerdown.stop="handleFretScrollWindowPointerDown"
                >
                  <span
                    :class="[
                      'text-[11px] uppercase tracking-[0.2em]',
                      showTwelveFretScroller
                        ? 'text-rose-100/85'
                        : 'text-gray-500',
                    ]"
                  >
                    Viewport
                  </span>
                  <span class="truncate">{{
                    activeFretScrollWindowLabel
                  }}</span>
                  <span
                    v-if="showTwelveFretScroller"
                    class="flex items-center gap-1 text-rose-100/80"
                  >
                    <span class="h-4 w-px rounded-full bg-rose-100/55"></span>
                    <span class="h-4 w-px rounded-full bg-rose-100/55"></span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-3">
      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-900/90 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
          @click="toggleControl('explore-view')"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Explore View
            </p>
            <p class="mt-1 text-sm font-semibold">
              {{ exploreViewState }}
            </p>
          </div>
          <span
            class="rounded-full border border-zinc-600 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
          >
            {{ isControlOpen("explore-view") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('explore-view')"
          class="absolute bottom-full left-0 z-40 mb-2 w-72 rounded-2xl border border-zinc-400/90 bg-zinc-900/96 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
        >
          <p class="text-sm font-semibold text-gray-100">
            Explore View Options
          </p>
          <p class="mt-1 text-xs text-gray-400">
            Switch note labels and note spelling.
          </p>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <button
              @click="applyExploreLabelMode('notes')"
              :class="[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                explore.preferredExploreLabelMode === 'notes'
                  ? 'cursor-default bg-rose-700 text-gray-50'
                  : 'cursor-pointer bg-zinc-700 text-gray-100 hover:bg-zinc-600',
              ]"
            >
              Notes
            </button>
            <button
              @click="applyExploreLabelMode('intervals')"
              :class="[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                explore.preferredExploreLabelMode === 'intervals'
                  ? 'cursor-default bg-rose-700 text-gray-50'
                  : 'cursor-pointer bg-zinc-700 text-gray-100 hover:bg-zinc-600',
              ]"
            >
              Intervals
            </button>
          </div>

          <div
            v-if="explore.effectiveFretLabelMode !== 'intervals'"
            class="mt-3 border-t border-gray-700 pt-3"
          >
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Note Spelling
            </p>
            <p class="mt-1 text-sm font-semibold text-gray-200">
              {{ noteSpellingState }}
            </p>

            <button
              @click="toggleNoteSpelling"
              class="mt-3 w-full rounded-xl bg-rose-700 p-2.5 text-sm font-semibold text-gray-50 transition hover:bg-rose-800"
            >
              Switch To {{ instrument.sharpsEnabled ? "Flats" : "Sharps" }}
            </button>
          </div>
        </div>
      </div>

      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-900/90 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
          @click="toggleControl('visibility')"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Visibility
            </p>
            <p class="mt-1 text-sm font-semibold">{{ visibilityState }}</p>
          </div>
          <span
            class="rounded-full border border-zinc-600 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
          >
            {{ isControlOpen("visibility") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('visibility')"
          class="absolute bottom-full left-0 z-40 mb-2 w-72 rounded-2xl border border-zinc-400/90 bg-zinc-900/96 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
        >
          <p class="text-sm font-semibold text-gray-100">Visibility Options</p>
          <p class="mt-1 text-xs text-gray-400">
            Limit notes or show full chromatic notes.
          </p>

          <div class="mt-3 grid gap-2">
            <button
              :class="[
                'w-full rounded-xl p-2.5 text-sm font-semibold transition',
                explore.onlyHighlighted
                  ? 'cursor-not-allowed bg-rose-700 text-gray-50'
                  : 'cursor-pointer bg-zinc-700 text-gray-100 hover:bg-zinc-600',
              ]"
              @click="setHighlightedOnly(true)"
            >
              Show Only Highlighted
            </button>
            <button
              :class="[
                'w-full rounded-xl p-2.5 text-sm font-semibold transition',
                !explore.onlyHighlighted
                  ? 'cursor-not-allowed bg-rose-700 text-gray-50'
                  : 'cursor-pointer bg-zinc-700 text-gray-100 hover:bg-zinc-600',
              ]"
              @click="setHighlightedOnly(false)"
            >
              Show All
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
