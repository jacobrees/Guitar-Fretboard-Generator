<script setup>
import { useFretboardStore } from "@/stores/fretboard";
import caretUpSVG from "@/assets/caret-up.svg";
import caretDownSVG from "@/assets/caret-down.svg";

const fretboard = useFretboardStore();
</script>

<template>
  <div
    class="p-1 rounded-2xl flex flex-wrap justify-center border border-gray-400 bg-gray-950"
  >
    <div
      class="text-gray-50 my-auto text-2xl flex border-gray-400 flex-col py-2 items-center"
    >
      <h3 class="text-3xl">Guitar Configurator</h3>
      <div class="flex flex-col">
        <div class="text-gray-50 text-2xl flex flex-col px-2 py-2 items-center">
          <div
            class="flex flex-wrap max-w-[568px] min-h-[260px] items-center justify-around text-gray-50 p-3 my-2 rounded-2xl bg-zinc-700"
          >
            <div class="w-full flex flex-col items-center">
              <h3 class="text-gray-50 pt-2">Tuning</h3>
              <div class="w-19/20 h-1 mt-2 bg-gray-100 rounded-full"></div>
            </div>

            <div
              v-for="(string, index) in fretboard.tuningIndexes"
              :key="index"
              class="flex items-center max-h-[40px] w-[164px] justify-start m-2"
            >
              <p
                class="rounded-full border-2 text-lg w-[32px] h-[32px] text-center"
              >
                {{ index + 1 }}
              </p>
              <div
                class="flex w-[160px] border-gray-400 border-y-2 rounded justify-between items-center"
              >
                <button
                  @click="fretboard.raiseString(index)"
                  class="cursor-pointer text-xl border-2 w-[36px] h-[36px] mx-1 rounded-xl bg-rose-800 hover:bg-rose-900"
                >
                  <img class="w-full" :src="caretUpSVG" alt="Up Arrow" />
                </button>
                <p>{{ fretboard.musicalNotes[string] }}</p>
                <button
                  @click="fretboard.lowerString(index)"
                  class="cursor-pointer text-xl border-2 w-[36px] h-[36px] mx-1 rounded-xl bg-rose-800 hover:bg-rose-900"
                >
                  <img class="w-full" :src="caretDownSVG" alt="Down Arrow" />
                </button>
              </div>
            </div>
          </div>

          <div
            class="bg-zinc-700 w-full rounded-2xl flex flex-col items-center"
          >
            <h3 class="text-gray-50 pt-2">String Count</h3>
            <div class="w-19/20 h-1 mt-2 bg-gray-100 rounded-full"></div>
            <div
              class="flex text-lg w-full items-center px-2 py-2 justify-center"
            >
              <button
                @click="fretboard.addString"
                :class="[
                  'text-gray-100 w-1/2 p-3 m-2 rounded-xl',
                  fretboard.tuningIndexes.length === 9
                    ? 'bg-zinc-900 cursor-not-allowed'
                    : 'bg-rose-700 hover:bg-rose-800 cursor-pointer',
                ]"
              >
                Add String
              </button>
              <button
                @click="fretboard.removeString"
                :class="[
                  'text-gray-100 w-1/2 p-3 m-2 rounded-xl',
                  fretboard.tuningIndexes.length === 5
                    ? 'bg-zinc-900 cursor-not-allowed'
                    : 'bg-rose-700 hover:bg-rose-800 cursor-pointer',
                ]"
              >
                Remove String
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
