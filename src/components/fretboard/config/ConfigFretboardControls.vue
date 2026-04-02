<script setup>
import { computed } from "vue";

import { useInstrumentStore } from "@/stores/instrument";

const instrument = useInstrumentStore();

const noteSpellingState = computed(() =>
  instrument.sharpsEnabled ? "Sharps Active" : "Flats Active",
);

const noteNamingOptions = [
  {
    id: "sharps",
    label: "Sharps",
    examples: "A# C# F#",
    usesSharps: true,
  },
  {
    id: "flats",
    label: "Flats",
    examples: "B♭ D♭ G♭",
    usesSharps: false,
  },
];

const setNoteSpelling = (useSharps) => {
  if (instrument.sharpsEnabled !== useSharps) {
    instrument.toggleSharpsEnabled();
  }
};
</script>

<template>
  <div class="w-full text-gray-100">
    <div
      class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
    >
      <div class="max-w-xl">
        <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
          Note Naming
        </p>
        <h3 class="mt-2 text-2xl font-semibold text-gray-100">
          {{ noteSpellingState }}
        </h3>
        <p class="mt-2 text-sm text-gray-300">
          Choose how accidental notes are displayed while configuring the
          fretboard.
        </p>
      </div>

      <div class="grid gap-2 sm:grid-cols-2 lg:min-w-88">
        <button
          v-for="option in noteNamingOptions"
          :key="option.id"
          type="button"
          :class="[
            'rounded-2xl border px-4 py-3 text-left transition',
            instrument.sharpsEnabled === option.usesSharps
              ? 'border-rose-900/80 bg-rose-700 text-gray-50 shadow-lg shadow-black/20'
              : 'border-zinc-600 bg-zinc-800/92 text-gray-100 hover:border-zinc-400 hover:bg-zinc-700',
          ]"
          @click="setNoteSpelling(option.usesSharps)"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-base font-semibold">{{ option.label }}</p>
            <span
              v-if="instrument.sharpsEnabled === option.usesSharps"
              class="rounded-full border border-rose-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-50"
            >
              Active
            </span>
          </div>
          <p
            :class="[
              'mt-1 text-sm',
              instrument.sharpsEnabled === option.usesSharps
                ? 'text-rose-100'
                : 'text-gray-400',
            ]"
          >
            {{ option.examples }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
