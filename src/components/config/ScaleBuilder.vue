<script setup>
import { useInstrumentStore } from "@/stores/instrument";
import { useScaleStore } from "@/stores/scale";

const emit = defineEmits(["open-interval-helper", "go-to-focus"]);

const instrument = useInstrumentStore();
const scale = useScaleStore();
</script>

<template>
  <div class="w-full text-gray-50">
    <div class="pb-4">
      <p class="text-xs font-semibold uppercase tracking-wider text-gray-300">
        Scale Setup
      </p>
      <h3 class="mt-2 text-2xl font-semibold">Scale Builder</h3>
      <p class="mt-2 max-w-2xl text-sm text-gray-300">
        Start with a root note and mode, then switch to custom mapping when you
        need a scale outside the preset list.
      </p>
    </div>

    <div
      class="mt-5 rounded-[1.4rem] border border-zinc-600/70 bg-zinc-900/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <div
        class="mb-3 flex flex-col gap-1 px-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400"
        >
          Builder Mode
        </p>
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500"
        >
          Choose one
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          @click="scale.setScaleBuilderMode('preset')"
          :class="[
            'cursor-pointer rounded-2xl border-2 px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-rose-300/70 focus:ring-offset-2 focus:ring-offset-zinc-900',
            scale.scaleBuilderMode === 'preset'
              ? 'border-rose-300 bg-rose-700 text-gray-50 shadow-lg shadow-black/20'
              : 'border-zinc-600 bg-zinc-950 text-gray-200 hover:border-zinc-400 hover:bg-zinc-900',
          ]"
        >
          <span class="block text-sm font-semibold">Preset Scales</span>
          <span
            :class="[
              'mt-1 block text-xs',
              scale.scaleBuilderMode === 'preset'
                ? 'text-rose-100'
                : 'text-gray-400',
            ]"
          >
            Pick a known scale and root.
          </span>
        </button>
        <button
          @click="scale.setScaleBuilderMode('custom')"
          :class="[
            'cursor-pointer rounded-2xl border-2 px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-rose-300/70 focus:ring-offset-2 focus:ring-offset-zinc-900',
            scale.scaleBuilderMode === 'custom'
              ? 'border-rose-300 bg-rose-700 text-gray-50 shadow-lg shadow-black/20'
              : 'border-zinc-600 bg-zinc-950 text-gray-200 hover:border-zinc-400 hover:bg-zinc-900',
          ]"
        >
          <span class="block text-sm font-semibold">Custom Mapping</span>
          <span
            :class="[
              'mt-1 block text-xs',
              scale.scaleBuilderMode === 'custom'
                ? 'text-rose-100'
                : 'text-gray-400',
            ]"
          >
            Build the interval formula manually.
          </span>
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
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          >
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
              Builder Step 1
            </p>
            <h4 class="mt-2 text-2xl font-semibold">Interval Mapping</h4>
            <p class="mt-2 text-sm text-gray-300">
              Build the formula first. The root stays locked in, so select the
              extra intervals you want in the scale.
            </p>
          </div>

          <div class="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            <button
              v-for="interval in scale.customIntervalOptions"
              :key="`custom-interval-${interval.semitones}`"
              :disabled="interval.isRequired"
              @click="scale.toggleIntervalHighlight(interval.semitones)"
              :class="[
                'rounded-xl border-2 px-4 py-3 text-left transition',
                interval.isSelected
                  ? 'border-rose-300 bg-rose-700 text-gray-50 shadow-lg shadow-black/30'
                  : 'border-gray-500 bg-zinc-800 text-gray-100 hover:border-gray-300 hover:bg-zinc-700',
                interval.isRequired
                  ? 'cursor-default'
                  : 'cursor-pointer transform duration-200 ease-in-out hover:scale-[1.02]',
              ]"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-lg font-semibold">{{ interval.label }}</p>
                <span
                  v-if="interval.isRequired"
                  class="rounded-full border border-rose-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-50"
                >
                  Locked
                </span>
                <span
                  v-else-if="interval.isSelected"
                  class="rounded-full border border-rose-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-50"
                >
                  On
                </span>
              </div>
              <p
                :class="[
                  'mt-1 text-sm',
                  interval.isSelected ? 'text-rose-100' : 'text-gray-400',
                ]"
              >
                {{ interval.name }}
              </p>
            </button>

            <div
              class="rounded-xl border border-gray-700 bg-zinc-800/60 px-4 py-3 sm:col-span-2 2xl:col-span-3"
            >
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Current Formula
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <div
                  v-for="interval in scale.customSelectedIntervals"
                  :key="`selected-custom-interval-${interval.semitones}`"
                  class="rounded-full border border-gray-500 bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-gray-100"
                >
                  {{ interval.label }}
                </div>
              </div>
              <p
                v-if="scale.customSelectedIntervalCount <= 1"
                class="mt-3 text-sm text-gray-300"
              >
                The root is always included. Add at least one more interval to
                build the scale.
              </p>
              <p
                v-if="scale.customMatchedScaleDefinition"
                class="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100"
              >
                This interval formula matches
                {{ scale.customMatchedScaleDefinition.name }}.
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-500 bg-zinc-900 p-4">
          <div class="border-b border-gray-500 pb-4 text-center">
            <p
              class="inline-flex rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
            >
              Builder Step 2
            </p>
            <h4 class="mt-2 text-2xl font-semibold">Select Root</h4>
            <p class="mt-2 text-sm text-gray-300">
              Apply your interval formula to whichever root note you want to
              spell on the fretboard.
            </p>
          </div>

          <p
            class="mt-4 rounded-xl border border-gray-700 bg-zinc-800/60 px-3 py-2 text-center text-base text-gray-200"
          >
            {{
              scale.customSelectedIntervalCount > 1
                ? "Choose the note that should act as the root for this interval formula."
                : "Add at least one interval beyond the root in Builder Step 1 to build a full scale."
            }}
          </p>

          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <button
              v-for="rootNote in scale.rootNoteOptions"
              :key="rootNote.index"
              @click="scale.toggleRootNote(rootNote.index)"
              :class="[
                'flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 transition transform duration-200 ease-in-out hover:scale-105',
                rootNote.isRoot
                  ? 'border-rose-300 bg-rose-700 text-gray-50 shadow-lg shadow-black/30'
                  : 'border-gray-500 bg-zinc-800 text-gray-100 hover:border-gray-300 hover:bg-zinc-700',
              ]"
            >
              <p class="font-semibold">{{ rootNote.note }}</p>
            </button>
          </div>

          <p
            v-if="scale.selectedRootNote !== null"
            class="mt-4 text-center text-sm text-gray-300"
          >
            Click the active root again to clear it, or choose another note to
            switch immediately.
          </p>

          <div
            v-if="scale.selectedScaleSummary"
            class="mt-4 rounded-2xl border border-rose-400/35 bg-linear-to-b from-zinc-800 to-zinc-900 p-4"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
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
                :key="`custom-interval-${interval.label}-${interval.note}`"
                class="rounded-full border border-gray-500 bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-gray-100"
              >
                {{ interval.note }} · {{ interval.label }}
              </div>
            </div>
          </div>

          <div
            v-if="
              scale.customSelectedIntervalCount > 1 &&
              scale.selectedRootNote !== null
            "
            class="mt-4 rounded-2xl border border-rose-400/35 bg-linear-to-b from-zinc-800 to-zinc-900 p-3 text-center sm:flex sm:items-center sm:justify-between sm:text-left"
          >
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-rose-300"
              >
                Builder Step 3
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
</template>
