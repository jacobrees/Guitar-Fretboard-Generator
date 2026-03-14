<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useMinWidth } from "@/composables/useMinWidth";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const explore = useExploreStore();
const instrument = useInstrumentStore();

const dockRef = ref(null);
const activeControl = ref(null);
const { isMinWidth: hasFullFretRangeAccess } = useMinWidth(1536);

const fullFretViewId = "full-24";
const fretViewOptions = [
  { id: "0-12", label: "0-12" },
  { id: "12-24", label: "12-24" },
  { id: "3-15", label: "3-15" },
  { id: "6-18", label: "6-18" },
  { id: "9-21", label: "9-21" },
  { id: fullFretViewId, label: "Full 24" },
];

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

const closeControls = () => {
  activeControl.value = null;
};

const toggleControl = (controlKey) => {
  activeControl.value = activeControl.value === controlKey ? null : controlKey;
};

const isControlOpen = (controlKey) => activeControl.value === controlKey;

const applyFretView = (viewId) => {
  if (isFretViewDisabled(viewId)) {
    return;
  }

  instrument.setFretView(viewId);
  closeControls();
};

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

const handleDocumentClick = (event) => {
  if (!dockRef.value || dockRef.value.contains(event.target)) {
    return;
  }

  closeControls();
};

const handleEscape = (event) => {
  if (event.key === "Escape") {
    closeControls();
  }
};

onMounted(() => {
  if (typeof document === "undefined") {
    return;
  }

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  if (typeof document === "undefined") {
    return;
  }

  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<template>
  <div
    ref="dockRef"
    class="relative z-30 mx-auto w-full max-w-screen-2xl px-5 pb-5"
  >
    <div class="grid grid-cols-3 gap-3">
      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl border border-gray-600 bg-zinc-900 px-3 py-2 text-left text-gray-100"
          @click="toggleControl('fret-view')"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Fret View
            </p>
            <p class="mt-1 text-sm font-semibold">{{ fretViewState }}</p>
          </div>
          <span class="text-xs uppercase tracking-wide text-gray-400">
            {{ isControlOpen("fret-view") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('fret-view')"
          class="absolute bottom-full left-0 z-40 mb-2 w-72 rounded-2xl border border-gray-500 bg-zinc-900 p-4 shadow-2xl shadow-black/45"
        >
          <p class="text-sm font-semibold text-gray-100">Fret View Options</p>
          <p class="mt-1 text-xs text-gray-400">
            Select a fret span for the board.
          </p>

          <div class="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              v-for="view in fretViewOptions"
              :key="view.id"
              :disabled="isFretViewDisabled(view.id)"
              @click="applyFretView(view.id)"
              :class="[
                'w-full rounded-xl p-2.5 text-sm font-semibold transition',
                isFretViewDisabled(view.id)
                  ? 'cursor-not-allowed bg-zinc-800/70 text-gray-500'
                  : effectiveFretViewId === view.id
                    ? 'cursor-not-allowed bg-rose-700 text-gray-50'
                    : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
              ]"
            >
              {{ view.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl border border-gray-600 bg-zinc-900 px-3 py-2 text-left text-gray-100"
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
          <span class="text-xs uppercase tracking-wide text-gray-400">
            {{ isControlOpen("explore-view") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('explore-view')"
          class="absolute bottom-full left-0 z-40 mb-2 w-72 rounded-2xl border border-gray-500 bg-zinc-900 p-4 shadow-2xl shadow-black/45"
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
                  : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
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
                  : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
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
          class="flex w-full items-center justify-between rounded-xl border border-gray-600 bg-zinc-900 px-3 py-2 text-left text-gray-100"
          @click="toggleControl('visibility')"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Visibility
            </p>
            <p class="mt-1 text-sm font-semibold">{{ visibilityState }}</p>
          </div>
          <span class="text-xs uppercase tracking-wide text-gray-400">
            {{ isControlOpen("visibility") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('visibility')"
          class="absolute bottom-full left-0 z-40 mb-2 w-72 rounded-2xl border border-gray-500 bg-zinc-900 p-4 shadow-2xl shadow-black/45"
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
                  : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
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
                  : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
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
