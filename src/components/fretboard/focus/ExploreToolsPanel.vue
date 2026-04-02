<script setup>
import { computed, ref, watch } from "vue";

import IntervalFormulaChips from "@/components/workspace/shared/IntervalFormulaChips.vue";

import { useDismissibleControlDock } from "@/composables/fretboard/useDismissibleControlDock";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";
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
const instrument = useInstrumentStore();
const showFinderIntervalViewNotice = ref(false);

const {
  dockRef,
  activeControl,
  closeControls,
  toggleControl,
  isControlOpen,
  registerControlElement,
} = useDismissibleControlDock();

const noteSpellingState = computed(() =>
  instrument.sharpsEnabled ? "Sharps Active" : "Flats Active",
);

const exploreViewState = computed(
  () =>
    explore.effectiveFretLabelMode.charAt(0).toUpperCase() +
    explore.effectiveFretLabelMode.slice(1),
);

const visibilityState = computed(() =>
  explore.onlyHighlighted ? "Only Highlighted" : "Show All",
);

const highlightState = computed(() => {
  if (activeControl.value === "interval-highlighting") {
    return "Editing";
  }

  return "Choose Interval";
});

const helperState = computed(
  () => scale.selectedScaleSummary?.name ?? "Helper",
);

const applyExploreLabelMode = (mode) => {
  const didApply = explore.setPreferredExploreLabelMode(mode);

  showFinderIntervalViewNotice.value = !didApply;
};

const toggleNoteSpelling = () => {
  instrument.toggleSharpsEnabled();
};

const setHighlightedOnly = (shouldShowOnlyHighlighted) => {
  explore.toggleHighlighted(shouldShowOnlyHighlighted);
  closeControls();
};

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

watch(
  () => explore.playbackEnabled,
  () => {
    showFinderIntervalViewNotice.value = false;
  },
);
</script>

<template>
  <div
    ref="dockRef"
    class="relative z-30 mx-auto mt-3 w-full max-w-screen-2xl px-5 pb-5"
  >
    <div
      class="rounded-[1.75rem] border border-zinc-500/85 bg-zinc-900/90 text-gray-100 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
    >
      <div class="border-b border-zinc-600/90 px-4 pb-4 pt-4 sm:px-5">
        <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
          Explore Tools and Options
        </p>
        <p class="mt-1 text-sm text-gray-400">
          Switch note labels, manage visibility, adjust interval colors, and
          reference the interval formula while exploring.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3 p-4 sm:p-5">
        <div
          :ref="
            (element) =>
              registerControlElement('interval-highlighting', element)
          "
          class="relative min-w-0"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-950/85 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
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

        <div
          :ref="(element) => registerControlElement('interval-helper', element)"
          class="relative min-w-0"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-950/85 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
            @click="toggleControl('interval-helper')"
          >
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                Interval Helper
              </p>
              <p class="mt-1 truncate text-sm font-semibold">
                {{ helperState }}
              </p>
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
                Reference the detected scale and interval formula while
                exploring.
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
              This selection is shown as a custom note collection because it
              does not exactly match one of the seven diatonic modes.
            </p>
          </div>
        </div>

        <div
          :ref="(element) => registerControlElement('explore-view', element)"
          class="relative min-w-0"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-950/85 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
            @click="toggleControl('explore-view')"
          >
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                Explore View
              </p>
              <p class="mt-1 text-sm font-semibold">{{ exploreViewState }}</p>
            </div>
            <span
              class="rounded-full border border-zinc-600 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
            >
              {{ isControlOpen("explore-view") ? "Close" : "Open" }}
            </span>
          </button>

          <div
            v-if="isControlOpen('explore-view')"
            class="absolute top-full left-0 z-40 mt-2 w-72 rounded-2xl border border-zinc-400/90 bg-zinc-900/96 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
          >
            <p class="text-sm font-semibold text-gray-100">
              Explore View Options
            </p>
            <p class="mt-1 text-xs text-gray-400">
              Switch note labels and note spelling. Finder keeps fretboard
              labels on note names.
            </p>

            <div class="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="applyExploreLabelMode('notes')"
                :disabled="explore.effectiveFretLabelMode === 'notes'"
                :class="[
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  explore.effectiveFretLabelMode === 'notes'
                    ? 'cursor-default bg-rose-700 text-gray-50'
                    : 'cursor-pointer bg-zinc-700 text-gray-100 hover:bg-zinc-600',
                ]"
              >
                Notes
              </button>
              <button
                type="button"
                @click="applyExploreLabelMode('intervals')"
                :disabled="explore.effectiveFretLabelMode === 'intervals'"
                :class="[
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  explore.effectiveFretLabelMode === 'intervals'
                    ? 'cursor-default bg-rose-700 text-gray-50'
                    : !explore.canUseIntervalLabels
                      ? 'cursor-help bg-amber-950/60 text-amber-100 hover:bg-amber-950/80'
                      : 'cursor-pointer bg-zinc-700 text-gray-100 hover:bg-zinc-600',
                ]"
              >
                Intervals
              </button>
            </div>

            <div
              v-if="showFinderIntervalViewNotice"
              class="mt-3 rounded-xl border border-amber-300/35 bg-amber-950/55 px-3 py-3 text-sm text-amber-100"
            >
              Finder keeps note names on the fretboard because interval meaning
              is handled in the chord analysis panel, where the same voicing can
              use a separate root from the bass note.
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

        <div
          :ref="(element) => registerControlElement('visibility', element)"
          class="relative min-w-0"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-[1.25rem] border border-zinc-500/80 bg-zinc-950/85 px-4 py-3 text-left text-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:border-zinc-300/80"
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
            class="absolute top-full left-0 z-40 mt-2 w-72 rounded-2xl border border-zinc-400/90 bg-zinc-900/96 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
          >
            <p class="text-sm font-semibold text-gray-100">
              Visibility Options
            </p>
            <p class="mt-1 text-xs text-gray-400">
              Limit notes or show full chromatic notes.
            </p>

            <div class="mt-3 grid gap-2">
              <button
                type="button"
                :disabled="explore.onlyHighlighted"
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
                type="button"
                :disabled="!explore.onlyHighlighted"
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
  </div>
</template>
