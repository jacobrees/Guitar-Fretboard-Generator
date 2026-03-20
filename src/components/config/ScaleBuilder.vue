<script setup>
import { useInstrumentStore } from "@/stores/instrument";
import { useScaleStore } from "@/stores/scale";

const emit = defineEmits(["open-interval-helper", "go-to-focus"]);

const instrument = useInstrumentStore();
const scale = useScaleStore();
</script>

<template>
  <div
    class="w-full max-w-2xl rounded-2xl border border-gray-400 bg-gray-950 p-3"
  >
    <div class="rounded-2xl bg-zinc-700 p-5 text-gray-50">
      <div class="border-b border-gray-500 pb-4 text-center">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Scale Setup
        </p>
        <h3 class="mt-1 text-3xl font-semibold">Scale Builder</h3>
        <p class="mt-2 text-base text-gray-200">
          Start with a root note and mode, then switch to custom mapping when
          you need a scale outside the preset list.
        </p>
      </div>

      <div class="mt-5 rounded-2xl bg-zinc-800 p-2">
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="scale.setScaleBuilderMode('preset')"
            :class="[
              'cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              scale.scaleBuilderMode === 'preset'
                ? 'bg-rose-700 text-gray-50'
                : 'bg-zinc-900 text-gray-200 hover:bg-zinc-950',
            ]"
          >
            Preset Scales
          </button>
          <button
            @click="scale.setScaleBuilderMode('custom')"
            :class="[
              'cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              scale.scaleBuilderMode === 'custom'
                ? 'bg-rose-700 text-gray-50'
                : 'bg-zinc-900 text-gray-200 hover:bg-zinc-950',
            ]"
          >
            Custom Mapping
          </button>
        </div>
      </div>

      <div class="mt-4 space-y-4">
        <div
          v-if="scale.scaleBuilderMode === 'preset'"
          class="rounded-2xl bg-zinc-800 p-4"
        >
          <div class="border-b border-gray-500 pb-3 text-center">
            <h4 class="text-2xl font-semibold">Preset Scale</h4>
            <p class="mt-2 text-sm text-gray-300">
              Choose a root note and mode to load a complete interval map
              instantly.
            </p>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Root Note
              </span>
              <select
                :value="scale.presetRootNote"
                @change="scale.setPresetRootNote(Number($event.target.value))"
                class="mt-2 w-full cursor-pointer rounded-xl border border-gray-500 bg-zinc-900 px-3 py-2.5 text-base font-semibold text-gray-100 outline-none transition focus:border-rose-300"
              >
                <option
                  v-for="(note, index) in instrument.musicalNotes"
                  :key="`preset-root-${note}`"
                  :value="index"
                >
                  {{ note }}
                </option>
              </select>
            </label>

            <label class="block">
              <span
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Mode
              </span>
              <select
                :value="scale.presetScaleDefinitionId"
                @change="scale.setPresetScaleDefinition($event.target.value)"
                class="mt-2 w-full cursor-pointer rounded-xl border border-gray-500 bg-zinc-900 px-3 py-2.5 text-base font-semibold text-gray-100 outline-none transition focus:border-rose-300"
              >
                <option
                  v-for="mode in scale.presetScaleDefinitions"
                  :key="`preset-mode-${mode.id}`"
                  :value="mode.id"
                >
                  {{ mode.name }}
                </option>
              </select>
            </label>
          </div>

          <div
            v-if="scale.selectedScaleSummary"
            class="mt-4 rounded-2xl border border-rose-400/30 bg-linear-to-b from-zinc-800 to-zinc-900 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-lg font-semibold text-gray-100">
                  {{ scale.selectedScaleSummary.name }}
                </p>
                <p class="mt-1 text-sm text-gray-300">
                  Formula: {{ scale.selectedScaleSummary.formula }}
                </p>
              </div>

              <button
                @click="emit('open-interval-helper')"
                class="shrink-0 cursor-pointer rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-gray-100 transition hover:bg-zinc-950"
              >
                Formula Helper
              </button>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <div
                v-for="interval in scale.selectedScaleSummary.intervals"
                :key="`preset-interval-${interval.label}-${interval.note}`"
                class="rounded-full border border-gray-500 bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-gray-100"
              >
                {{ interval.note }} · {{ interval.label }}
              </div>
            </div>

            <div
              class="mt-4 border-t border-rose-300/25 pt-3 text-center sm:flex sm:items-center sm:justify-between sm:text-left"
            >
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-rose-300"
                >
                  Next Step
                </p>
                <p class="mt-1 text-sm text-gray-200">
                  Explore this scale on the fretboard.
                </p>
              </div>

              <button
                @click="emit('go-to-focus')"
                class="mt-3 w-full cursor-pointer rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-gray-50 transition hover:bg-rose-800 sm:mt-0 sm:w-auto"
              >
                Explore Fretboard
              </button>
            </div>
          </div>

          <button
            @click="scale.setScaleBuilderMode('custom')"
            class="mt-4 w-full cursor-pointer rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-gray-100 transition hover:bg-zinc-950"
          >
            Need something else? Switch to Custom Mapping
          </button>
        </div>

        <div v-else class="space-y-3">
          <div class="rounded-2xl border border-gray-500 bg-zinc-900 p-4">
            <div class="border-b border-gray-500 pb-4 text-center">
              <p
                class="inline-flex rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
              >
                Step 1
              </p>
              <h4 class="mt-2 text-2xl font-semibold">Note Mapping</h4>
              <div
                class="mt-3 flex items-start justify-center gap-2 text-center text-base text-gray-300"
              >
                <p>
                  Choose the notes that best describe the song&apos;s tonal
                  center and overall mood.
                </p>

                <div class="group relative flex shrink-0 items-center">
                  <button
                    type="button"
                    class="flex size-7 cursor-help items-center justify-center rounded-full border border-gray-500 bg-zinc-800 text-sm font-semibold text-gray-100"
                    aria-label="Explain borrowed notes in minor keys"
                  >
                    ?
                  </button>

                  <div
                    class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-gray-500 bg-gray-950 p-3 text-left text-sm text-gray-200 shadow-xl group-hover:block"
                  >
                    Songs in a minor key often mix notes from natural minor,
                    harmonic minor, and melodic minor. Pick the note set that
                    best captures the overall home sound of the music.
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                v-for="(note, index) in instrument.musicalNotes"
                :key="note"
                @click="scale.toggleNoteHighlight(index)"
                :class="[
                  'flex size-14 cursor-pointer items-center justify-center rounded-xl border-2 transition transform duration-200 ease-in-out hover:scale-105',
                  scale.highlightedNotes[index]
                    ? `${scale.highlightedNotes[index]} border-rose-300 text-gray-50 shadow-lg shadow-black/30`
                    : 'border-gray-500 bg-zinc-800 text-gray-100 hover:border-gray-300 hover:bg-zinc-700',
                ]"
              >
                <p class="text-lg font-semibold">
                  {{ instrument.musicalNotes[index] }}
                </p>
              </button>
            </div>

            <p
              class="mt-4 rounded-xl border border-gray-700 bg-zinc-800/60 px-3 py-2 text-center text-sm text-gray-300"
            >
              Build any non-diatonic note set, then choose a root below.
            </p>
          </div>

          <div class="rounded-2xl border border-gray-500 bg-zinc-900 p-4">
            <div class="border-b border-gray-500 pb-4 text-center">
              <p
                class="inline-flex rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
              >
                Step 2
              </p>
              <h4 class="mt-2 text-2xl font-semibold">Select Root</h4>
              <p class="mt-2 text-sm text-gray-300">
                Pick the root note that turns your selection into an interval
                map.
              </p>
            </div>

            <p
              v-if="scale.selectedNotes.length > 1"
              class="mt-4 rounded-xl border border-gray-700 bg-zinc-800/60 px-3 py-2 text-center text-base text-gray-200"
            >
              Select the root note to display its interval relationships on the
              fretboard
            </p>
            <p
              v-else
              class="mt-4 rounded-xl border border-gray-700 bg-zinc-800/60 px-3 py-2 text-center text-base text-gray-200"
            >
              Highlight more than one note in Step 1 to enable root selection.
            </p>

            <div
              v-if="scale.selectedNotes.length > 1"
              class="mt-4 flex flex-wrap justify-center gap-2"
            >
              <button
                v-for="intervalNote in scale.intervalNotes"
                :key="intervalNote.index"
                @click="scale.toggleRootNote(intervalNote.index)"
                :class="[
                  'flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 transition transform duration-200 ease-in-out hover:scale-105',
                  intervalNote.isRoot
                    ? 'border-rose-300 bg-rose-700 text-gray-50 shadow-lg shadow-black/30'
                    : 'border-gray-500 bg-zinc-800 text-gray-100 hover:border-gray-300 hover:bg-zinc-700',
                ]"
              >
                <p class="font-semibold">{{ intervalNote.note }}</p>
              </button>
            </div>

            <p
              v-if="scale.selectedNotes.length > 1"
              class="mt-4 text-center text-sm text-gray-300"
            >
              Click the active root again to clear it, or choose another note to
              switch immediately.
            </p>

            <div v-if="scale.selectedScaleSummary" class="mt-4">
              <button
                @click="emit('open-interval-helper')"
                class="w-full cursor-pointer rounded-xl border border-gray-500 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-gray-100 transition hover:bg-zinc-700"
              >
                Open Formula Helper
              </button>
            </div>

            <div
              v-if="
                scale.selectedNotes.length > 1 && scale.selectedRootNote !== null
              "
              class="mt-4 rounded-2xl border border-rose-400/35 bg-linear-to-b from-zinc-800 to-zinc-900 p-3 text-center sm:flex sm:items-center sm:justify-between sm:text-left"
            >
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-rose-300"
                >
                  Step 3
                </p>
                <p class="mt-1 text-sm text-gray-200">
                  Explore your custom mapping on the fretboard.
                </p>
              </div>

              <button
                @click="emit('go-to-focus')"
                class="mt-3 w-full cursor-pointer rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-gray-50 transition hover:bg-rose-800 sm:mt-0 sm:w-auto"
              >
                Explore Fretboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
