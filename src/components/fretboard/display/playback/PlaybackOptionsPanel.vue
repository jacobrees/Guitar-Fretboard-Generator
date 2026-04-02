<script setup>
import { computed } from "vue";

import IntervalFormulaChips from "@/components/workspace/shared/IntervalFormulaChips.vue";
import { usePlaybackStore } from "@/stores/playback";

const playback = usePlaybackStore();

const volumeLabel = computed(() => `${playback.volume}%`);
const activeMatch = computed(() =>
  playback.manualRootNote ? playback.selectedRootMatch : playback.bassRelativeMatch,
);
const matchSectionTitle = computed(() =>
  playback.manualRootNote ? "Selected Root Match" : "Bass-Relative Match",
);
const activeMatchSymbol = computed(() => {
  if (!playback.hasSelectedNotes) {
    return "Select notes";
  }

  return activeMatch.value?.symbol ?? "Custom";
});
const activeMatchDescription = computed(() => {
  if (!playback.hasSelectedNotes) {
    return "Choose notes on the fretboard to analyze the voicing.";
  }

  if (!playback.manualRootNote) {
    return (
      playback.bassRelativeMatch?.description ??
      "The current voicing is being named from the bass note by default."
    );
  }

  if (activeMatch.value?.isKnown) {
    return activeMatch.value.description;
  }

  if (activeMatch.value) {
    return activeMatch.value.description;
  }

  return `No exact chord match yet for ${playback.manualRootNote.note} as the selected root.`;
});
const currentFormulaTitle = computed(() =>
  playback.manualRootNote ? "Selected Root Formula" : "Bass-Relative Formula",
);
const currentFormulaDescription = computed(() =>
  playback.manualRootNote
    ? `Relative to ${playback.manualRootNote.label}. This formula is used for chord naming.`
    : "Relative to the bass note in the current voicing.",
);
</script>

<template>
  <div class="px-4 pb-4 pt-4 text-gray-100">
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
        Finder Controls
      </p>
      <p class="mt-1 text-sm text-gray-300">
        Select up to one note per string to build a voicing and retrigger it
        in sync.
      </p>
      <p v-if="!playback.hasAudioSupport" class="mt-2 text-xs text-rose-200">
        Audio playback is unavailable in this browser.
      </p>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section
        class="rounded-[1.35rem] border border-zinc-600/75 bg-zinc-950/75 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Tone</p>
        <div
          class="mt-3 inline-flex rounded-xl border border-zinc-700/90 bg-zinc-900/90 p-1"
          role="group"
          aria-label="Playback tone"
        >
          <button
            v-for="option in playback.toneOptions"
            :key="option.id"
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            :class="
              playback.tone === option.id
                ? 'bg-zinc-100 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                : 'text-gray-300 hover:bg-zinc-800 hover:text-gray-100'
            "
            @click="playback.setTone(option.id)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section
        class="rounded-[1.35rem] border border-zinc-600/75 bg-zinc-950/75 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
            Volume
          </p>
          <span class="text-xs font-semibold text-gray-300">
            {{ volumeLabel }}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          class="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-200"
          :value="playback.volume"
          aria-label="Playback volume"
          @input="playback.setVolume($event.target.value)"
        />
      </section>

      <section
        class="rounded-[1.35rem] border border-zinc-600/75 bg-zinc-950/75 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)] xl:col-span-2"
      >
        <div class="min-w-0">
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
            Chord Analysis
          </p>
          <p class="mt-1 text-sm text-gray-300">
            Finder starts with bass-relative analysis. Set a root to switch the
            formula and chord match to a root-relative reading.
          </p>
        </div>

        <div v-if="playback.hasSelectedNotes" class="mt-4">
          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                Selected Notes
              </p>
              <p class="mt-1 text-sm text-gray-400">
                Tap a note box to set or clear the root. The chip follows the
                active formula reference.
              </p>
            </div>
            <p class="text-xs text-gray-500">
              {{
                playback.manualRootNote
                  ? "Showing root-relative intervals."
                  : "Showing bass-relative intervals."
              }}
            </p>
          </div>

          <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              v-for="note in playback.analysisNotes"
              :key="note.key"
              type="button"
              class="rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              :class="
                note.isRoot
                  ? 'border-rose-300/60 bg-rose-950/70 text-rose-50 shadow-[0_10px_22px_rgba(0,0,0,0.18)]'
                  : 'border-zinc-700/80 bg-zinc-950/75 text-gray-100 hover:border-zinc-500'
              "
              :aria-pressed="note.isRoot"
              @click="playback.toggleSelectedRoot(note.key)"
            >
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-lg font-semibold">
                  {{ note.label }}
                </p>
                <span
                  class="rounded-full border border-cyan-200/50 bg-cyan-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-950"
                >
                  {{ note.displayIntervalLabel }}
                </span>
              </div>

              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-if="note.isBass"
                  class="rounded-full border border-zinc-600 bg-zinc-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-200"
                >
                  Bass
                </span>
                <span
                  v-if="note.isRoot"
                  class="rounded-full border border-rose-300/60 bg-rose-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-950"
                >
                  Root
                </span>
              </div>

              <p class="mt-2 text-sm text-gray-300">
                {{ note.positionLabel }}
              </p>
              <p class="mt-1 text-xs text-gray-500">
                {{
                  playback.manualRootNote
                    ? `Root: ${note.rootRelativeIntervalLabel} - ${note.note}`
                    : `Bass: ${note.bassRelativeIntervalLabel} - ${note.note}`
                }}
              </p>
            </button>
          </div>

          <div class="mt-4">
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              {{ currentFormulaTitle }}
            </p>
            <p class="mt-1 text-sm text-gray-400">
              {{ currentFormulaDescription }}
            </p>

            <IntervalFormulaChips :intervals="playback.currentFormulaChips" />
          </div>

          <div class="mt-4">
            <div
              class="rounded-2xl border border-zinc-700/80 bg-zinc-900/70 px-4 py-4"
            >
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                {{ matchSectionTitle }}
              </p>
              <p class="mt-2 text-2xl font-semibold text-gray-50">
                {{ activeMatchSymbol }}
              </p>
              <p class="mt-1 text-sm text-gray-300">
                {{ activeMatchDescription }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="mt-4 rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/55 px-4 py-6 text-sm text-gray-300"
        >
          Select notes on the fretboard to build a voicing. The panel starts
          with bass-relative intervals and matching, then switches to a
          root-relative reading after you choose a root note.
        </div>
      </section>

      <section class="xl:col-span-2 flex justify-end">
        <div
          class="w-full max-w-xl rounded-[1.35rem] border border-zinc-600/75 bg-zinc-950/75 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                Reset Finder
              </p>
              <p class="mt-1 text-sm text-gray-300">
                Clears the voicing, root override, and current playback.
              </p>
            </div>

            <button
              type="button"
              class="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              :class="
                playback.hasSelectedNotes
                  ? 'bg-zinc-100 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:bg-white'
                  : 'cursor-not-allowed bg-zinc-800 text-gray-500'
              "
              :disabled="!playback.hasSelectedNotes"
              @click="playback.resetAll()"
            >
              Reset All
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
