<script setup>
import { computed } from "vue";

import IntervalFormulaChips from "@/components/workspace/shared/IntervalFormulaChips.vue";

import { useDismissibleControlDock } from "@/composables/fretboard/useDismissibleControlDock";
import { useExploreStore } from "@/stores/explore";
import { useScaleStore } from "@/stores/scale";

defineProps({
  activeIntervalPalette: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits([
  "toggle-interval-palette",
  "close-interval-palette",
  "open-interval-helper",
]);

const scale = useScaleStore();
const explore = useExploreStore();

const { dockRef, activeControl, closeControls, toggleControl, isControlOpen } =
  useDismissibleControlDock();

const highlightState = computed(() => {
  if (activeControl.value === "interval-highlighting") {
    return "Editing";
  }

  return "Choose Interval";
});

const helperState = computed(
  () => scale.selectedScaleSummary?.name ?? "Helper",
);

const resetHighlights = () => {
  explore.resetExploreIntervalHighlightsToScale();
  emit("close-interval-palette");
};

const clearHighlights = () => {
  explore.clearAllExploreIntervalHighlights();
  emit("close-interval-palette");
};

const openIntervalHelper = () => {
  closeControls();
  emit("open-interval-helper");
};
</script>

<template>
  <div
    ref="dockRef"
    class="relative z-30 mx-auto mt-2 w-full max-w-screen-2xl px-5 pb-3"
  >
    <div class="grid grid-cols-2 gap-3">
      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-900/90 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
          @click="toggleControl('interval-highlighting')"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Interval Highlighting
            </p>
            <p class="mt-1 text-sm font-semibold">{{ highlightState }}</p>
          </div>
          <span
            class="rounded-full border border-zinc-600 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
          >
            {{ isControlOpen("interval-highlighting") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('interval-highlighting')"
          class="absolute top-full left-0 z-40 mt-2 w-xl max-w-[min(36rem,calc(100vw-4rem))] rounded-2xl border border-zinc-400/90 bg-zinc-900/96 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-gray-100">
                Interval Highlighting
              </p>
              <p class="mt-1 text-xs text-gray-400">
                Click an interval tile to open the color palette.
              </p>
            </div>

            <div class="flex shrink-0 flex-wrap gap-2">
              <button
                @click="resetHighlights"
                class="cursor-pointer rounded-xl bg-rose-700 px-3 py-2 text-xs font-semibold text-gray-50 transition hover:bg-rose-800"
              >
                Reset To Scale
              </button>
              <button
                @click="clearHighlights"
                class="cursor-pointer rounded-xl bg-zinc-700 px-3 py-2 text-xs font-semibold text-gray-100 transition hover:bg-zinc-600"
              >
                Clear All
              </button>
            </div>
          </div>

          <div
            class="mt-3 flex items-center justify-between rounded-xl border border-gray-600 bg-zinc-700/60 px-3 py-2"
          >
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Chromatic Order
            </p>
            <p class="text-xs text-gray-400">Default highlight: rose</p>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-2">
            <button
              v-for="interval in scale.chromaticIntervalRows"
              :key="`focus-highlight-${interval.semitones}`"
              @click="emit('toggle-interval-palette', interval.semitones)"
              :class="[
                'rounded-xl border px-2.5 py-2 text-left transition',
                explore.getExploreIntervalColor(interval.semitones) ??
                  'bg-zinc-900',
                activeIntervalPalette === interval.semitones
                  ? 'border-white shadow-lg shadow-black/40'
                  : interval.isInScale
                    ? 'border-rose-300/35'
                    : 'border-gray-500',
              ]"
              :aria-label="`Edit ${interval.label} note color`"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold uppercase text-gray-100">
                  {{ interval.note }}
                </p>
                <span
                  v-if="interval.isInScale"
                  class="rounded-full border border-rose-400/35 bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-100"
                >
                  Scale
                </span>
              </div>
              <p class="mt-1 text-base font-semibold text-gray-50">
                {{ interval.label }}
              </p>
            </button>
          </div>
        </div>
      </div>

      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-900/90 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
          @click="toggleControl('interval-helper')"
        >
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Interval Helper
            </p>
            <p class="mt-1 truncate text-sm font-semibold">{{ helperState }}</p>
          </div>
          <span
            class="rounded-full border border-zinc-600 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
          >
            {{ isControlOpen("interval-helper") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('interval-helper')"
          class="absolute top-full left-0 z-40 mt-2 w-lg max-w-[min(32rem,calc(100vw-4rem))] rounded-2xl border border-zinc-400/90 bg-zinc-900/96 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
        >
          <div class="border-b border-gray-700 pb-3">
            <p class="text-sm font-semibold text-gray-100">Interval Helper</p>
            <p class="mt-1 text-xs text-gray-400">
              Reference the detected scale and interval formula while exploring.
            </p>
          </div>

          <div class="mt-3 flex items-end justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                Interval Formula
              </p>
              <p class="mt-1 text-sm text-gray-300">
                Hover or focus an interval to reveal its note.
              </p>
            </div>

            <button
              @click="openIntervalHelper"
              class="shrink-0 cursor-pointer rounded-xl bg-zinc-700 px-3 py-2 text-xs font-semibold text-gray-100 transition hover:bg-zinc-600"
            >
              Open Formula Helper
            </button>
          </div>

          <IntervalFormulaChips
            :intervals="scale.selectedScaleSummary?.intervals ?? []"
          />

          <p
            v-if="
              scale.selectedScaleSummary &&
              !scale.selectedScaleSummary.isKnownScale
            "
            class="mt-3 text-sm text-gray-300"
          >
            This selection is shown as a custom note collection because it does
            not exactly match one of the seven diatonic modes.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
