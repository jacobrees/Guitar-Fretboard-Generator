<script setup>
import { useFretboardStore } from "@/stores/fretboard";

const fretboard = useFretboardStore();
</script>

<template>
  <div
    class="max-w-[1560px] w-full px-5 m-auto flex justify-center items-center"
  >
    <div
      class="flex flex-row flex-wrap items-center justify-around bg-gray-950 border-2 border-gray-400 rounded-2xl"
    >
      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">♯ / ♭?</h4>
        <button
          @click="fretboard.toggleSharpsEnabled"
          class="cursor-pointer text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700 hover:bg-rose-800"
        >
          Toggle ♯/♭
        </button>
      </div>

      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Visibility</h4>
        <button
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs',
            fretboard.onlyHighlighted
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
          @click="fretboard.toggleHighlighted(true)"
        >
          Show Only Highlighted
        </button>
        <button
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs',
            !fretboard.onlyHighlighted
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
          @click="fretboard.toggleHighlighted(false)"
        >
          Show All Notes
        </button>
      </div>

      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Orientation</h4>
        <button
          @click="fretboard.flipVertically"
          class="cursor-pointer text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700 hover:bg-rose-800"
        >
          Flip Vertically
        </button>
        <button
          @click="fretboard.flipHorizontally"
          class="cursor-pointer text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700 hover:bg-rose-800"
        >
          Flip Horizontally
        </button>
      </div>

      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Fret View</h4>
        <button
          @click="fretboard.fretViewTo12"
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs',
            fretboard.fretView === 12
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
        >
          0...12
        </button>
        <button
          @click="fretboard.fretViewTo24"
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs',
            fretboard.fretView === 24
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
        >
          Full 24
        </button>
      </div>
    </div>
  </div>
</template>
