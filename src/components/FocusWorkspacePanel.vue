<script setup>
import IntervalFormulaChips from "@/components/IntervalFormulaChips.vue";
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

const resetHighlights = () => {
  explore.resetExploreIntervalHighlightsToScale();
  emit("close-interval-palette");
};

const clearHighlights = () => {
  explore.clearAllExploreIntervalHighlights();
  emit("close-interval-palette");
};
</script>

<template>
  <div class="my-2 mx-5 w-full max-w-screen-2xl">
    <div
      class="rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <div class="grid gap-4 lg:grid-cols-[1.65fr_1fr] lg:items-start">
          <div class="rounded-2xl border border-gray-500 bg-zinc-900 p-4">
            <div
              class="flex flex-col gap-3 border-b border-gray-500 pb-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <h4 class="text-2xl font-semibold">Interval Highlights</h4>
                <p class="mt-2 text-sm text-gray-300">
                  Color interval roles across the fretboard without changing
                  your note selection.
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  Click a note chip to open the color palette.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  @click="resetHighlights"
                  class="cursor-pointer rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-gray-50 transition hover:bg-rose-800"
                >
                  Reset To Scale
                </button>
                <button
                  @click="clearHighlights"
                  class="cursor-pointer rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-zinc-950"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div
              class="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-700 bg-zinc-800/60 px-3 py-2"
            >
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                Chromatic Order
              </p>
              <div class="flex items-center gap-2">
                <span
                  class="rounded-full border border-rose-400/35 bg-rose-950/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-100"
                >
                  In Scale
                </span>
                <span class="text-xs text-gray-400"
                  >Default highlight: rose</span
                >
              </div>
            </div>

            <div
              class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            >
              <div
                v-for="interval in scale.chromaticIntervalRows"
                :key="`highlight-${interval.semitones}`"
                :class="[
                  'rounded-2xl border p-3 transition',
                  interval.isInScale
                    ? 'border-rose-400/30 bg-linear-to-b from-zinc-800 to-zinc-900 shadow-lg shadow-rose-950/10'
                    : 'border-gray-700 bg-zinc-800/80',
                ]"
              >
                <div class="flex items-center justify-between gap-2">
                  <p
                    class="text-sm font-semibold uppercase tracking-wide text-gray-300"
                  >
                    {{ interval.note }}
                  </p>
                  <span
                    v-if="interval.isInScale"
                    class="rounded-full border border-rose-400/35 bg-rose-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-100"
                  >
                    Scale
                  </span>
                </div>

                <button
                  @click="emit('toggle-interval-palette', interval.semitones)"
                  :class="[
                    'mx-auto mt-3 block w-18 cursor-pointer rounded-xl border px-2 py-4 text-xl font-semibold text-gray-50 transition hover:scale-105',
                    explore.getExploreIntervalColor(interval.semitones) ??
                      'bg-zinc-950',
                    activeIntervalPalette === interval.semitones
                      ? 'border-white shadow-lg shadow-black/40'
                      : interval.isInScale
                        ? 'border-rose-300/35'
                        : 'border-gray-500',
                  ]"
                  :aria-label="`Edit ${interval.label} note color`"
                >
                  {{ interval.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-500 bg-zinc-900 p-4">
            <div class="border-b border-gray-500 pb-4 text-center">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                Interval Helper
              </p>
              <h4 class="mt-1 text-3xl font-semibold">
                {{ scale.selectedScaleSummary?.name }}
              </h4>
              <p class="mt-2 text-base text-gray-200">
                Reference the detected scale and interval formula while
                exploring the fretboard.
              </p>
            </div>

            <div
              class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-start"
            >
              <div>
                <p
                  class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                >
                  Interval Formula
                </p>
                <p class="mt-1 text-base text-gray-300">
                  These interval codes define the scale shape selected above.
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  Hover or focus an interval to reveal its note.
                </p>
              </div>

              <button
                @click="emit('open-interval-helper')"
                class="cursor-pointer rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-zinc-950"
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
              class="mt-4 text-sm text-gray-300"
            >
              This selection is shown as a custom note collection because it
              does not exactly match one of the seven diatonic modes.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
