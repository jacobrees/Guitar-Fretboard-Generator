<script setup>
import { useInstrumentStore } from "@/stores/instrument";
import { useScaleStore } from "@/stores/scale";

const instrument = useInstrumentStore();
const scale = useScaleStore();
</script>

<template>
  <div
    class="my-auto w-full max-w-2xl rounded-2xl border border-gray-400 bg-gray-950 p-3"
  >
    <div class="rounded-2xl bg-zinc-700 p-5 text-gray-50">
      <div class="border-b border-gray-500 pb-4 text-center">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Scale Setup
        </p>
        <h3 class="mt-1 text-3xl font-semibold">Scale Builder</h3>
        <p class="mt-2 text-base text-gray-200">
          Map the notes that define the song&apos;s tonal center, then choose
          the root that best describes the overall mood.
        </p>
      </div>

      <div class="mt-5 space-y-4">
        <div class="rounded-2xl bg-zinc-800 p-4">
          <div class="border-b border-gray-500 pb-3 text-center">
            <h4 class="text-2xl font-semibold">Note Mapping</h4>
            <div
              class="mt-2 flex items-center justify-center gap-2 text-center text-lg text-gray-200"
            >
              <p>
                Choose the notes that best describe the song&apos;s tonal center
                and overall mood.
              </p>

              <div class="group relative flex shrink-0 items-center">
                <button
                  type="button"
                  class="flex size-7 cursor-help items-center justify-center rounded-full border border-gray-300 bg-zinc-900 text-sm font-semibold text-gray-100"
                  aria-label="Explain borrowed notes in minor keys"
                >
                  ?
                </button>

                <div
                  class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-gray-500 bg-gray-950 p-3 text-left text-sm text-gray-200 shadow-xl group-hover:block"
                >
                  Songs in a minor key often mix notes from natural minor,
                  harmonic minor, and melodic minor. Pick the note set that best
                  captures the overall home sound of the music.
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
                'flex size-14 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-200 transition transform duration-200 ease-in-out hover:scale-105',
                scale.highlightedNotes[index]
                  ? `${scale.highlightedNotes[index]} text-gray-50 shadow-lg shadow-black/30`
                  : 'bg-zinc-900 text-gray-100',
              ]"
            >
              <p class="text-lg font-semibold">
                {{ instrument.musicalNotes[index] }}
              </p>
            </button>
          </div>

          <p class="mt-4 text-center text-sm text-gray-300">
            (If you are a first time user start with a scale you are familiar
            with)
          </p>
        </div>

        <div class="rounded-2xl bg-zinc-800 p-4">
          <div class="border-b border-gray-500 pb-3 text-center">
            <h4 class="text-2xl font-semibold">Interval Engine</h4>
            <p class="mt-2 text-sm text-gray-300">
              Pick the root note that turns your selection into a mode-aware
              interval map.
            </p>
          </div>

          <p
            v-if="scale.selectedNotes.length > 1"
            class="mt-4 text-center text-lg text-gray-200"
          >
            Select the root note to display its interval relationships on the
            fretboard
          </p>
          <p v-else class="mt-4 text-center text-lg text-gray-200">
            Highlight more than one note in Note Mapping to enable Interval
            Engine
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
                'flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-200 transition transform duration-200 ease-in-out hover:scale-105',
                intervalNote.isRoot ? 'bg-rose-700' : 'bg-zinc-900',
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
        </div>
      </div>
    </div>
  </div>
</template>
