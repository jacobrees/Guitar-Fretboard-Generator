<script setup>
import caretDownSVG from "@/assets/caret-down.svg";
import caretUpSVG from "@/assets/caret-up.svg";

import { useInstrumentStore } from "@/stores/instrument";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
});

const instrument = useInstrumentStore();
</script>

<template>
  <div
    :class="[
      props.embedded
        ? 'w-full text-gray-50'
        : 'w-full max-w-2xl rounded-2xl border border-gray-400 bg-gray-950 p-3',
    ]"
  >
    <div
      :class="[
        props.embedded ? '' : 'rounded-2xl bg-zinc-700 p-5 text-gray-50',
      ]"
    >
      <div
        :class="[
          props.embedded ? 'pb-4' : 'border-b border-gray-500 pb-4 text-center',
        ]"
      >
        <div
          :class="[
            props.embedded
              ? 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
              : '',
          ]"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wider text-gray-300"
            >
              Instrument Setup
            </p>
            <h3
              :class="[
                props.embedded
                  ? 'mt-2 text-2xl font-semibold'
                  : 'mt-1 text-3xl font-semibold',
              ]"
            >
              Guitar Configurator
            </h3>
            <p
              :class="[
                props.embedded
                  ? 'mt-2 max-w-xl text-sm text-gray-300'
                  : 'mt-2 text-base text-gray-200',
              ]"
            >
              Set your tuning and string count before building the scale.
            </p>
          </div>

          <p
            class="inline-flex w-fit shrink-0 rounded-full border border-zinc-600 bg-zinc-900 px-3 py-1 text-sm font-semibold text-gray-200"
          >
            {{ instrument.tuningIndexes.length }} Strings Active
          </p>
        </div>
      </div>

      <div class="mt-5 space-y-4">
        <div class="rounded-2xl bg-zinc-800 p-4">
          <div class="border-b border-gray-500 pb-3 text-gray-50">
            <div>
              <h4 class="text-2xl font-semibold">Tuning</h4>
              <p class="mt-1 text-sm text-gray-300">
                Raise or lower each open string one semitone at a time.
              </p>
            </div>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              v-for="(string, index) in instrument.tuningIndexes"
              :key="index"
              class="flex items-center gap-3 rounded-2xl border border-gray-500 bg-zinc-900 px-3 py-3"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-zinc-800 text-base font-semibold"
              >
                {{ index + 1 }}
              </div>

              <div
                class="flex min-w-0 flex-1 items-center justify-between gap-2"
              >
                <button
                  @click="instrument.raiseString(index)"
                  class="flex size-10 cursor-pointer items-center justify-center rounded-xl border-2 border-rose-500 bg-rose-800 transition hover:bg-rose-900"
                >
                  <img
                    class="w-full"
                    :src="caretUpSVG"
                    :alt="`Raise string ${index + 1} pitch from ${instrument.musicalNotes[string]}`"
                  />
                </button>

                <div class="w-14 text-center">
                  <p class="text-xs uppercase tracking-wide text-gray-400">
                    Open Note
                  </p>
                  <p class="text-xl font-semibold">
                    {{ instrument.musicalNotes[string] }}
                  </p>
                </div>

                <button
                  @click="instrument.lowerString(index)"
                  class="flex size-10 cursor-pointer items-center justify-center rounded-xl border-2 border-rose-500 bg-rose-800 transition hover:bg-rose-900"
                >
                  <img
                    class="w-full"
                    :src="caretDownSVG"
                    :alt="`Lower string ${index + 1} pitch from ${instrument.musicalNotes[string]}`"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-zinc-800 p-4">
          <div class="border-b border-gray-500 pb-3 text-gray-50">
            <div>
              <h4 class="text-2xl font-semibold">String Count</h4>
              <p class="mt-1 text-sm text-gray-300">
                Expand or reduce the instrument layout between 5 and 9 strings.
              </p>
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              @click="instrument.addString"
              :class="[
                'flex-1 rounded-xl px-4 py-3 text-base font-semibold text-gray-100 transition',
                instrument.tuningIndexes.length === 9
                  ? 'cursor-not-allowed bg-zinc-900'
                  : 'cursor-pointer bg-rose-700 hover:bg-rose-800',
              ]"
            >
              Add String
            </button>
            <button
              @click="instrument.removeString"
              :class="[
                'flex-1 rounded-xl px-4 py-3 text-base font-semibold text-gray-100 transition',
                instrument.tuningIndexes.length === 5
                  ? 'cursor-not-allowed bg-zinc-900'
                  : 'cursor-pointer bg-rose-700 hover:bg-rose-800',
              ]"
            >
              Remove String
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
