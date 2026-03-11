<script setup>
import { useFretboardStore } from "@/stores/fretboard";

const fretboard = useFretboardStore();
</script>

<template>
  <div class="bg-gray-950 flex border rounded-2xl border-gray-400">
    <div
      class="text-gray-50 text-2xl border-gray-400 flex flex-col pl-3 pr-2 py-2 items-center"
    >
      <h4 class="mb-2 text-3xl">Scale Builder</h4>
      <div class="max-w-[664px] flex flex-col">
        <div
          class="p-2 rounded-2xl bg-zinc-700 h-full flex flex-col justify-center relative"
        >
          <h5 class="text-center text-2xl mb-2">Note Mapping</h5>
          <p class="text-[17px] text-wrap text-center mb-4">
            This is where you define the overall musical scale of what you want
            to do!
          </p>
          <p class="text-[18px] text-center mb-4">
            Define a scale by selecting notes below
          </p>

          <div class="flex flex-wrap h-12 items-center justify-around">
            <button
              v-for="(note, index) in fretboard.musicalNotes"
              :key="note"
              @click="fretboard.toggleNoteHighlight(index)"
              :class="[
                'cursor-pointer w-[46px] h-[46px] border-2 flex justify-center items-center border-gray-200 rounded-xl ml-2 transition transform hover:scale-105 duration-200 ease-in-out',
                fretboard.highlightedNotes[index]
                  ? fretboard.highlightedNotes[index]
                  : '',
              ]"
            >
              <p>{{ fretboard.musicalNotes[index] }}</p>
            </button>
          </div>

          <p class="text-[17px] text-center mt-4">
            (If you are a first time user start with a scale you are familiar
            with)
          </p>

          <!--
          Palette modal kept here temporarily for later reuse.
          <div
            class="w-[600px] rounded-xl bg-zinc-900 fixed left-1/2 -translate-x-1/2 border z-50"
          >
            <div class="flex justify-between p-3 text-lg">
              <h5>Add or remove highlighting to the selected note</h5>
              <button
                class="cursor-pointer border-2 w-[40px] h-[40px] rounded-lg bg-rose-700 hover:bg-rose-800"
              >
                <img :src="closeSVG" alt="Close Icon" />
              </button>
            </div>

            <div class="flex flex-wrap">
              <button
                class="cursor-pointer flex flex-col justify-center items-center mx-2 mb-3 transition transform hover:scale-105 duration-200 ease-in-out"
              >
                <div class="h-[68px] w-[68px] border-2 rounded-2xl">
                  <img :src="closeSVG" alt="Remove Highlighting" />
                </div>
                <p class="text-sm">Remove</p>
              </button>

              <button
                v-for="(value, key) in fretboard.paletteColors"
                :key="key"
                class="cursor-pointer flex flex-col justify-center items-center mx-2 mb-3 transition transform hover:scale-105 duration-200 ease-in-out"
              >
                <div
                  :class="[
                    'h-[68px] w-[68px] border-2 rounded-2xl flex items-center justify-center',
                    value,
                  ]"
                >
                  <p
                    class="border-2 rounded-full w-10 h-10 flex items-center justify-center text-[18px]"
                  >
                    Selected
                  </p>
                </div>
                <p class="text-sm">
                  {{ key.substring(0, 1).toUpperCase() + key.substring(1) }}
                </p>
              </button>
            </div>
          </div>
          -->
        </div>

        <div class="bg-zinc-700 mt-2 p-3 rounded-2xl">
          <h5 class="text-center text-2xl mb-2">Interval Engine</h5>

          <p
            v-if="fretboard.selectedNotes.length > 1"
            class="text-[17px] text-center mb-4"
          >
            Select the root note to display its interval relationships on the
            fretboard
          </p>
          <p v-else class="text-[17px] text-center mb-4">
            Highlight more than one note in Note Mapping to enable Interval
            Engine
          </p>

          <div
            v-if="fretboard.selectedNotes.length > 1"
            class="flex justify-center"
          >
            <button
              v-for="note in fretboard.selectedNotes"
              :key="note"
              class="cursor-pointer w-[46px] h-[46px] border-2 flex justify-center items-center border-gray-200 rounded-xl ml-2 transition transform hover:scale-105 duration-200 ease-in-out"
            >
              <p>{{ note }}</p>
            </button>
          </div>

          <p
            v-if="fretboard.selectedNotes.length > 1"
            class="text-[17px] text-wrap text-center mt-4"
          >
            Pick a root relative to the chosen scale. This stage defines the
            overall key.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
