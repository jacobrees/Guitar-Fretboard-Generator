<script setup>
import { computed } from "vue";
import InstrumentConfigurator from "@/components/InstrumentConfigurator.vue";
import IntervalFormulaChips from "@/components/IntervalFormulaChips.vue";
import ScaleBuilder from "@/components/ScaleBuilder.vue";
import { useInstrumentStore } from "@/stores/instrument";
import { useScaleStore } from "@/stores/scale";

const emit = defineEmits(["open-interval-helper", "go-to-focus"]);

const instrument = useInstrumentStore();
const scale = useScaleStore();

const noteNamingPreview = computed(() =>
  instrument.sharpsEnabled
    ? ["A#", "C#", "D#", "F#", "G#"]
    : ["B♭", "D♭", "E♭", "G♭", "A♭"],
);
</script>

<template>
  <div class="my-2 mx-5 w-full max-w-screen-2xl">
    <div
      class="rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
    >
      <div class="rounded-2xl bg-zinc-700 p-4">
        <div class="border-b border-gray-500 pb-4 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-300"
          >
            Board Tools
          </p>
          <p class="mt-2 text-base text-gray-200">
            Set note naming and board orientation before dialing in the
            instrument and scale.
          </p>
        </div>

        <div class="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            class="rounded-2xl border border-rose-400/30 bg-linear-to-b from-zinc-800 to-zinc-900 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p
                  class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                >
                  Note Naming
                </p>
                <p class="mt-2 text-sm text-gray-300">
                  Choose how accidentals are spelled while mapping notes.
                </p>
              </div>

              <div
                class="rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
              >
                {{
                  instrument.sharpsEnabled ? "Sharps Active" : "Flats Active"
                }}
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <div
                v-for="note in noteNamingPreview"
                :key="note"
                class="rounded-full border border-gray-500 bg-zinc-950 px-3 py-1.5 text-sm font-semibold text-gray-100"
              >
                {{ note }}
              </div>
            </div>

            <button
              @click="instrument.toggleSharpsEnabled"
              class="mt-4 w-full cursor-pointer rounded-xl bg-rose-700 px-5 py-3 text-base font-semibold text-gray-50 transition hover:bg-rose-800"
            >
              Switch To {{ instrument.sharpsEnabled ? "Flats" : "Sharps" }}
            </button>
          </div>

          <div
            class="rounded-2xl border border-gray-500 bg-linear-to-b from-zinc-800 to-zinc-900 p-4"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p
                  class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                >
                  Board Orientation
                </p>
                <p class="mt-2 text-sm text-gray-300">
                  Flip the fretboard to match the perspective you want while
                  building your scale.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <div
                  class="rounded-full border border-gray-500 bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
                >
                  {{
                    instrument.verticalFlip
                      ? "String Order: Standard"
                      : "String Order: Reversed"
                  }}
                </div>
                <div
                  class="rounded-full border border-gray-500 bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
                >
                  {{
                    instrument.horizontalFlip
                      ? "Frets: Mirrored"
                      : "Frets: Standard"
                  }}
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                @click="instrument.flipVertically"
                class="cursor-pointer rounded-xl border border-rose-400/30 bg-zinc-900 px-5 py-4 text-left font-semibold text-gray-50 transition hover:border-rose-300 hover:bg-zinc-950"
              >
                <span class="block text-base">Flip Vertically</span>
                <span class="mt-1 block text-sm font-normal text-gray-300">
                  Reorder the strings from top to bottom.
                </span>
              </button>
              <button
                @click="instrument.flipHorizontally"
                class="cursor-pointer rounded-xl border border-rose-400/30 bg-zinc-900 px-5 py-4 text-left font-semibold text-gray-50 transition hover:border-rose-300 hover:bg-zinc-950"
              >
                <span class="block text-base">Flip Horizontally</span>
                <span class="mt-1 block text-sm font-normal text-gray-300">
                  Mirror the fret direction left to right.
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="my-2 mx-5 flex items-center gap-4">
    <InstrumentConfigurator />
    <ScaleBuilder />
  </div>

  <div
    v-if="scale.selectedRootNote !== null && scale.selectedScaleSummary"
    class="mb-2 mx-5 w-full max-w-screen-2xl"
  >
    <div
      class="rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <div class="border-b border-gray-500 pb-4 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-300"
          >
            Scale Helper
          </p>
          <h4 class="mt-1 text-3xl font-semibold">
            {{ scale.selectedScaleSummary.name }}
          </h4>
          <p class="mt-2 text-base text-gray-200">
            Confirm the detected scale and interval formula before exploring the
            full fretboard view.
          </p>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-5">
          <div
            class="rounded-2xl border border-gray-500 bg-zinc-900 p-4 lg:col-span-2"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
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
              :intervals="scale.selectedScaleSummary.intervals"
            />
          </div>

          <div
            class="rounded-2xl border border-rose-400/45 bg-zinc-900 p-4 shadow-lg shadow-rose-950/25 lg:col-span-3"
          >
            <div
              class="flex h-full flex-col justify-between rounded-2xl bg-linear-to-b from-zinc-800 to-zinc-900 p-6"
            >
              <div class="text-center">
                <p
                  class="text-base font-semibold uppercase tracking-wide text-rose-300"
                >
                  Next Step
                </p>
                <p class="mt-3 text-3xl font-semibold text-gray-100">
                  Explore this scale on the fretboard.
                </p>
                <p class="mt-3 text-base text-gray-300">
                  Switch modes to inspect interval relationships and note
                  placement across the neck.
                </p>
              </div>

              <button
                @click="emit('go-to-focus')"
                class="mt-6 cursor-pointer rounded-xl bg-rose-700 px-8 py-4 text-2xl font-semibold text-gray-50 transition hover:bg-rose-800"
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
