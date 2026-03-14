<script setup>
import { computed } from "vue";
import { useMinWidth } from "@/composables/useMinWidth";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const explore = useExploreStore();
const instrument = useInstrumentStore();
const { isMinWidth: hasFullFretRangeAccess } = useMinWidth(1536);
const fullFretViewId = "full-24";
const fretViewOptions = [
  { id: "0-12", label: "0-12" },
  { id: "6-18", label: "6-18" },
  { id: "12-24", label: "12-24" },
  { id: fullFretViewId, label: "Full 24" },
];

const noteSpellingState = computed(() =>
  instrument.sharpsEnabled ? "Sharps Active" : "Flats Active",
);

const visibilityState = computed(() =>
  explore.onlyHighlighted ? "Only Highlighted" : "Show All",
);

const verticalOrientationState = computed(() =>
  instrument.verticalFlip ? "Strings: Standard" : "Strings: Reversed",
);

const horizontalOrientationState = computed(() =>
  instrument.horizontalFlip ? "Frets: Mirrored" : "Frets: Standard",
);

const effectiveFretViewId = computed(() =>
  !hasFullFretRangeAccess.value && instrument.fretView === fullFretViewId
    ? instrument.defaultFretViewId
    : instrument.fretView,
);

const effectiveFretPreset = computed(() =>
  instrument.getFretViewPreset(effectiveFretViewId.value),
);

const fretViewState = computed(() => effectiveFretPreset.value.label);

const isFretViewDisabled = (viewId) =>
  viewId === fullFretViewId && !hasFullFretRangeAccess.value;

const applyFretView = (viewId) => {
  if (isFretViewDisabled(viewId)) {
    return;
  }

  instrument.setFretView(viewId);
};
</script>

<template>
  <div
    class="m-auto flex w-full max-w-screen-2xl items-center justify-center px-5"
  >
    <div
      class="w-full rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <div class="border-b border-gray-500 pb-4 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200"
          >
            Fretboard Tools
          </p>
          <h3 class="mt-2 text-3xl font-semibold tracking-tight">
            Display Controls
          </h3>
          <p class="mt-2 text-base text-gray-200">
            Choose how the fretboard is labeled, shown, and framed.
          </p>
        </div>

        <div
          :class="[
            'mt-5 grid gap-3',
            explore.effectiveFretLabelMode === 'intervals'
              ? 'md:grid-cols-2 xl:grid-cols-4'
              : 'md:grid-cols-2 xl:grid-cols-5',
          ]"
        >
          <div class="rounded-2xl bg-zinc-800 p-4">
            <h4 class="text-xl font-semibold text-center">Explore View</h4>
            <div class="mt-2 flex justify-center">
              <span
                class="rounded-full border border-rose-400/35 bg-rose-950/55 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
              >
                {{ explore.preferredExploreLabelMode }} Active
              </span>
            </div>
            <p class="mt-2 text-sm text-center text-gray-300">
              Switch between note names and interval shorthand.
            </p>

            <div class="mt-4 rounded-xl bg-zinc-900 p-1">
              <div class="grid grid-cols-2 gap-1">
                <button
                  @click="explore.setPreferredExploreLabelMode('notes')"
                  :class="[
                    'rounded-lg px-3 py-2.5 font-semibold transition',
                    explore.preferredExploreLabelMode === 'notes'
                      ? 'cursor-default bg-rose-700 text-gray-50'
                      : 'cursor-pointer text-gray-300 hover:bg-zinc-800 hover:text-gray-100',
                  ]"
                >
                  Notes
                </button>
                <button
                  @click="explore.setPreferredExploreLabelMode('intervals')"
                  :class="[
                    'rounded-lg px-3 py-2.5 font-semibold transition',
                    explore.preferredExploreLabelMode === 'intervals'
                      ? 'cursor-default bg-rose-700 text-gray-50'
                      : 'cursor-pointer text-gray-300 hover:bg-zinc-800 hover:text-gray-100',
                  ]"
                >
                  Intervals
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-zinc-800 p-4">
            <h4 class="text-xl font-semibold text-center">Fret View</h4>
            <div class="mt-2 flex justify-center">
              <span
                class="rounded-full border border-gray-500 bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
              >
                {{ fretViewState }}
              </span>
            </div>
            <p class="mt-2 text-sm text-center text-gray-300">
              Choose a focused 12-fret window. Full 24 is available on screens
              that are at least 1536px wide.
            </p>

            <div class="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                v-for="view in fretViewOptions"
                :key="view.id"
                :disabled="isFretViewDisabled(view.id)"
                @click="applyFretView(view.id)"
                :class="[
                  'w-full rounded-xl p-3 font-semibold transition',
                  isFretViewDisabled(view.id)
                    ? 'cursor-not-allowed bg-zinc-900/70 text-gray-500'
                    : effectiveFretViewId === view.id
                      ? 'cursor-not-allowed bg-rose-700'
                      : 'cursor-pointer bg-zinc-900 text-gray-50 hover:bg-zinc-950',
                ]"
              >
                {{ view.label }}
              </button>
            </div>

            <div
              v-if="!hasFullFretRangeAccess"
              class="mt-4 rounded-xl border border-amber-300/35 bg-amber-950/35 p-3 text-sm text-amber-100"
            >
              <p class="font-semibold">
                Full 24 Fret View Is Not Available At This Size
              </p>
              <p class="mt-1 text-amber-50/90">
                On screens below 1536px, Full 24 is limited to 12-fret spans.
              </p>
            </div>
          </div>

          <div
            v-if="explore.effectiveFretLabelMode !== 'intervals'"
            class="rounded-2xl bg-zinc-800 p-4"
          >
            <h4 class="text-xl font-semibold text-center">♯ / ♭</h4>
            <div class="mt-2 flex justify-center">
              <span
                class="rounded-full border border-rose-400/35 bg-rose-950/55 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
              >
                {{ noteSpellingState }}
              </span>
            </div>
            <p class="mt-2 text-sm text-center text-gray-300">
              Switch enharmonic spelling for note labels across the fretboard,
              open strings, and helper note mappings.
            </p>

            <button
              @click="instrument.toggleSharpsEnabled"
              class="mt-4 w-full cursor-pointer rounded-xl bg-rose-700 p-3 font-semibold text-gray-50 transition hover:bg-rose-800"
            >
              Switch To {{ instrument.sharpsEnabled ? "Flats" : "Sharps" }}
            </button>
          </div>

          <div class="rounded-2xl bg-zinc-800 p-4">
            <h4 class="text-xl font-semibold text-center">Orientation</h4>
            <div class="mt-2 flex flex-wrap justify-center gap-2">
              <span
                class="rounded-full border border-gray-500 bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
              >
                {{ verticalOrientationState }}
              </span>
              <span
                class="rounded-full border border-gray-500 bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
              >
                {{ horizontalOrientationState }}
              </span>
            </div>
            <p class="mt-2 text-sm text-center text-gray-300">
              Flip the layout to match your preferred fretboard perspective.
            </p>

            <div class="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                @click="instrument.flipVertically"
                class="w-full cursor-pointer rounded-xl bg-zinc-900 p-4 text-left font-semibold text-gray-50 transition hover:bg-zinc-950"
              >
                <span class="block text-base">Flip Vertically</span>
                <span class="mt-1 block text-sm font-normal text-gray-300">
                  Reorder the strings from top to bottom.
                </span>
              </button>
              <button
                @click="instrument.flipHorizontally"
                class="w-full cursor-pointer rounded-xl bg-zinc-900 p-4 text-left font-semibold text-gray-50 transition hover:bg-zinc-950"
              >
                <span class="block text-base">Flip Horizontally</span>
                <span class="mt-1 block text-sm font-normal text-gray-300">
                  Mirror fret travel from left to right.
                </span>
              </button>
            </div>
          </div>

          <div class="rounded-2xl bg-zinc-800 p-4">
            <h4 class="text-xl font-semibold text-center">Visibility</h4>
            <div class="mt-2 flex justify-center">
              <span
                class="rounded-full border border-gray-500 bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
              >
                {{ visibilityState }}
              </span>
            </div>
            <p class="mt-2 text-sm text-center text-gray-300">
              Focus only on the intervals you have highlighted, or widen the
              view to see the full chromatic neck.
            </p>

            <div class="mt-4 grid gap-2">
              <button
                :class="[
                  'w-full rounded-xl p-3 font-semibold text-gray-50 transition',
                  explore.onlyHighlighted
                    ? 'cursor-not-allowed bg-rose-700'
                    : 'cursor-pointer bg-zinc-900 hover:bg-zinc-950',
                ]"
                @click="explore.toggleHighlighted(true)"
              >
                Show Only Highlighted
              </button>
              <button
                :class="[
                  'w-full rounded-xl p-3 font-semibold text-gray-50 transition',
                  !explore.onlyHighlighted
                    ? 'cursor-not-allowed bg-rose-700'
                    : 'cursor-pointer bg-zinc-900 hover:bg-zinc-950',
                ]"
                @click="explore.toggleHighlighted(false)"
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
