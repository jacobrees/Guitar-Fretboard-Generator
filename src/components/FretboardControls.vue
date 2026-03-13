<script setup>
import { useFretboardStore } from "@/stores/fretboard";

const fretboard = useFretboardStore();
</script>

<template>
  <div
    class="m-auto flex w-full max-w-screen-2xl items-center justify-center px-5"
  >
    <div
      class="w-full rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
    >
      <div class="rounded-2xl bg-zinc-700 p-4">
        <div class="border-b border-gray-500 pb-4 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-300"
          >
            Fretboard Tools
          </p>
          <h3 class="mt-1 text-3xl font-semibold">Display Controls</h3>
          <p class="mt-2 text-base text-gray-200">
            Adjust pitch spelling, visibility, orientation, and fret range for
            the current view.
          </p>
        </div>

        <div
          :class="[
            'mt-5 grid gap-3',
            fretboard.effectiveFretLabelMode === 'intervals'
              ? 'lg:grid-cols-3'
              : 'lg:grid-cols-4',
          ]"
        >
          <div
            v-if="fretboard.effectiveFretLabelMode !== 'intervals'"
            class="rounded-2xl bg-zinc-800 p-4 text-center"
          >
            <h4 class="text-2xl font-semibold">♯ / ♭</h4>
            <p class="mt-2 text-sm text-gray-300">
              Switch enharmonic spelling when the board is showing note names.
            </p>
            <button
              @click="fretboard.toggleSharpsEnabled"
              class="mt-4 w-full cursor-pointer rounded-xl bg-rose-700 p-3 font-semibold text-gray-50 transition hover:bg-rose-800"
            >
              Toggle ♯/♭
            </button>
          </div>

          <div class="rounded-2xl bg-zinc-800 p-4 text-center">
            <h4 class="text-2xl font-semibold">Visibility</h4>
            <p class="mt-2 text-sm text-gray-300">
              Focus only on the selected tones or show the full board.
            </p>
            <div class="mt-4 grid gap-2">
              <button
                :class="[
                  'w-full rounded-xl p-3 font-semibold text-gray-50 transition',
                  fretboard.onlyHighlighted
                    ? 'cursor-not-allowed bg-rose-700'
                    : 'cursor-pointer bg-zinc-900 hover:bg-zinc-950',
                ]"
                @click="fretboard.toggleHighlighted(true)"
              >
                Show Only Highlighted
              </button>
              <button
                :class="[
                  'w-full rounded-xl p-3 font-semibold text-gray-50 transition',
                  !fretboard.onlyHighlighted
                    ? 'cursor-not-allowed bg-rose-700'
                    : 'cursor-pointer bg-zinc-900 hover:bg-zinc-950',
                ]"
                @click="fretboard.toggleHighlighted(false)"
              >
                Show All
              </button>
            </div>
          </div>

          <div class="rounded-2xl bg-zinc-800 p-4 text-center">
            <h4 class="text-2xl font-semibold">Orientation</h4>
            <p class="mt-2 text-sm text-gray-300">
              Flip the layout to match your preferred fretboard perspective.
            </p>
            <div class="mt-4 grid gap-2">
              <button
                @click="fretboard.flipVertically"
                class="w-full cursor-pointer rounded-xl bg-rose-700 p-3 font-semibold text-gray-50 transition hover:bg-rose-800"
              >
                Flip Vertically
              </button>
              <button
                @click="fretboard.flipHorizontally"
                class="w-full cursor-pointer rounded-xl bg-rose-700 p-3 font-semibold text-gray-50 transition hover:bg-rose-800"
              >
                Flip Horizontally
              </button>
            </div>
          </div>

          <div class="rounded-2xl bg-zinc-800 p-4 text-center">
            <h4 class="text-2xl font-semibold">Fret View</h4>
            <p class="mt-2 text-sm text-gray-300">
              Choose between a compact octave view or the full 24-fret layout.
            </p>
            <div class="mt-4 grid gap-2">
              <button
                @click="fretboard.fretViewTo12"
                :class="[
                  'w-full rounded-xl p-3 font-semibold text-gray-50 transition',
                  fretboard.fretView === 12
                    ? 'cursor-not-allowed bg-rose-700'
                    : 'cursor-pointer bg-zinc-900 hover:bg-zinc-950',
                ]"
              >
                0...12
              </button>
              <button
                @click="fretboard.fretViewTo24"
                :class="[
                  'w-full rounded-xl p-3 font-semibold text-gray-50 transition',
                  fretboard.fretView === 24
                    ? 'cursor-not-allowed bg-rose-700'
                    : 'cursor-pointer bg-zinc-900 hover:bg-zinc-950',
                ]"
              >
                Full 24
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
