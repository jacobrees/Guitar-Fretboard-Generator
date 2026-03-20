<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { useInstrumentStore } from "@/stores/instrument";

const instrument = useInstrumentStore();

const dockRef = ref(null);
const activeControl = ref(null);

const noteSpellingState = computed(() =>
  instrument.sharpsEnabled ? "Sharps Active" : "Flats Active",
);

const orientationState = computed(
  () =>
    `${instrument.verticalFlip ? "Strings: Standard" : "Strings: Reversed"} · ${
      instrument.horizontalFlip ? "Frets: Mirrored" : "Frets: Standard"
    }`,
);

const closeControls = () => {
  activeControl.value = null;
};

const toggleControl = (controlKey) => {
  activeControl.value = activeControl.value === controlKey ? null : controlKey;
};

const isControlOpen = (controlKey) => activeControl.value === controlKey;

const setNoteSpelling = (useSharps) => {
  if (instrument.sharpsEnabled !== useSharps) {
    instrument.toggleSharpsEnabled();
  }

  closeControls();
};

const setVerticalFlip = (useStandardStringOrder) => {
  if (instrument.verticalFlip !== useStandardStringOrder) {
    instrument.flipVertically();
  }

  closeControls();
};

const setHorizontalFlip = (useMirroredFrets) => {
  if (instrument.horizontalFlip !== useMirroredFrets) {
    instrument.flipHorizontally();
  }

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
    <div class="grid grid-cols-2 gap-3">
      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl border border-gray-600 bg-zinc-900 px-3 py-2 text-left text-gray-100"
          @click="toggleControl('note-spelling')"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Note Naming
            </p>
            <p class="mt-1 text-sm font-semibold">{{ noteSpellingState }}</p>
          </div>
          <span class="text-xs uppercase tracking-wide text-gray-400">
            {{ isControlOpen("note-spelling") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('note-spelling')"
          class="absolute bottom-full left-0 z-40 mb-2 w-72 rounded-2xl border border-gray-500 bg-zinc-900 p-4 shadow-2xl shadow-black/45"
        >
          <p class="text-sm font-semibold text-gray-100">Note Naming</p>
          <p class="mt-1 text-xs text-gray-400">
            Choose how accidentals are displayed.
          </p>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <button
              @click="setNoteSpelling(true)"
              :class="[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                instrument.sharpsEnabled
                  ? 'cursor-default bg-rose-700 text-gray-50'
                  : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
              ]"
            >
              Sharps
            </button>
            <button
              @click="setNoteSpelling(false)"
              :class="[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                !instrument.sharpsEnabled
                  ? 'cursor-default bg-rose-700 text-gray-50'
                  : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
              ]"
            >
              Flats
            </button>
          </div>
        </div>
      </div>

      <div class="relative min-w-0">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl border border-gray-600 bg-zinc-900 px-3 py-2 text-left text-gray-100"
          @click="toggleControl('orientation')"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Board Orientation
            </p>
            <p class="mt-1 text-sm font-semibold">
              {{ orientationState }}
            </p>
          </div>
          <span class="text-xs uppercase tracking-wide text-gray-400">
            {{ isControlOpen("orientation") ? "Close" : "Open" }}
          </span>
        </button>

        <div
          v-if="isControlOpen('orientation')"
          class="absolute bottom-full left-0 z-40 mb-2 w-80 rounded-2xl border border-gray-500 bg-zinc-900 p-4 shadow-2xl shadow-black/45"
        >
          <p class="text-sm font-semibold text-gray-100">Board Orientation</p>
          <p class="mt-1 text-xs text-gray-400">
            Set string order and fret direction.
          </p>

          <div class="mt-3">
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Strings
            </p>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <button
                @click="setVerticalFlip(true)"
                :class="[
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  instrument.verticalFlip
                    ? 'cursor-default bg-rose-700 text-gray-50'
                    : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
                ]"
              >
                Standard
              </button>
              <button
                @click="setVerticalFlip(false)"
                :class="[
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  !instrument.verticalFlip
                    ? 'cursor-default bg-rose-700 text-gray-50'
                    : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
                ]"
              >
                Reversed
              </button>
            </div>
          </div>

          <div class="mt-3 border-t border-gray-700 pt-3">
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Frets
            </p>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <button
                @click="setHorizontalFlip(false)"
                :class="[
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  !instrument.horizontalFlip
                    ? 'cursor-default bg-rose-700 text-gray-50'
                    : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
                ]"
              >
                Standard
              </button>
              <button
                @click="setHorizontalFlip(true)"
                :class="[
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  instrument.horizontalFlip
                    ? 'cursor-default bg-rose-700 text-gray-50'
                    : 'cursor-pointer bg-zinc-800 text-gray-100 hover:bg-zinc-700',
                ]"
              >
                Mirrored
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
