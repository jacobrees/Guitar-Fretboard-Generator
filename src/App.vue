<script setup>
import { ref, computed } from "vue";
import Navigation from "@/components/Navigation.vue";
import FooterComponent from "@/components/Footer.vue";
import closeSVG from "@/assets/close.svg";

const paletteColors = {
  rose: "bg-rose-700",
  orange: "bg-orange-600",
  yellow: "bg-yellow-500",
  lime: "bg-lime-600",
  emerald: "bg-emerald-600",
  cyan: "bg-cyan-600",
  navy: "bg-blue-900",
  violet: "bg-violet-600",
  fuchsia: "bg-fuchsia-600",
};

const onlyHighlighted = ref(true);
const sharpsEnabled = ref(true);
const selectedNote = ref(null);
const paletteVisible = ref(false);
const verticalFlip = ref(true);
const horizontalFlip = ref(false);

const toggleHighlighted = (boolean) => {
  if (boolean) {
    onlyHighlighted.value = true;
  } else {
    onlyHighlighted.value = false;
  }
};

const highlightedNotes = ref([
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
]);

const highlightSelectedNote = (note, color) => {
  highlightedNotes.value.splice(note, 1, color);
  paletteVisible.value = false;
};

const flipVertically = () => {
  verticalFlip.value = !verticalFlip.value;
};
const flipHorizontally = () => {
  horizontalFlip.value = !horizontalFlip.value;
};

const openPalette = (index) => {
  selectedNote.value = index;

  paletteVisible.value = true;
};

const closePalette = () => {
  paletteVisible.value = false;
};

const toggleSharpsEnabled = () => {
  sharpsEnabled.value = !sharpsEnabled.value;
};

const musicalNotes = computed(() => [
  "A",
  sharpsEnabled.value ? "A#" : "B♭",
  "B",
  "C",
  sharpsEnabled.value ? "C#" : "D♭",
  "D",
  sharpsEnabled.value ? "D#" : "E♭",
  "E",
  "F",
  sharpsEnabled.value ? "F#" : "G♭",
  "G",
  sharpsEnabled.value ? "G#" : "A♭",
]);

const getNote = (stringCount, n) => {
  const index = verticalFlip.value
    ? tuningIndexes.value[stringCount - 1]
    : [...tuningIndexes.value].reverse()[stringCount - 1];

  return (index + n) % 12;
};

const tuningIndexes = ref([7, 2, 10, 5, 0, 7]);
const fretboardMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
let fretView = ref(12);

const fretViewTo12 = () => {
  if (fretView.value === 24) {
    fretView.value = 12;
  }
};

const fretViewTo24 = () => {
  if (fretView.value === 12) {
    fretView.value = 24;
  }
};

const raiseString = (index) => {
  tuningIndexes.value[index] = (tuningIndexes.value[index] + 1) % 12;
};

const lowerString = (index) => {
  tuningIndexes.value[index] = (tuningIndexes.value[index] + 11) % 12;
};

const removeString = () => {
  if (tuningIndexes.value.length > 5) {
    tuningIndexes.value.pop();
  }
};

const addString = () => {
  let lastStringNote = tuningIndexes.value[tuningIndexes.value.length - 1];
  let newStringNote = (lastStringNote + 7) % 12;
  if (tuningIndexes.value.length < 9) {
    tuningIndexes.value.push(newStringNote);
  }
};
</script>

<template>
  <Navigation />

  <div class="flex flex-col items-center justify-center">
    <div class="bg-gray-950 z-10 p-3 rounded-2xl border-1 border-gray-400 mt-2">
      <div class="bg-zinc-700 rounded-2xl text-2xl">
        <button
          class="text-gray-50 p-1 rounded-xl w-3xs bg-rose-700 hover:cursor-pointer"
        >
          Core
        </button>
        <button
          class="text-gray-50 p-1 rounded-xl w-3xs bg-zinc-700 hover:cursor-pointer"
        >
          Focus
        </button>
      </div>
      <h2 class="text-gray-50 text-3xl p-1 text-center">Core</h2>
      <p class="text-gray-50 pb-1 text-center">
        Define your instrument and select notes
      </p>
    </div>
    <div class="my-2 mx-5">
      <div
        class="p-1 rounded-2xl flex flex-wrap justify-center border border-gray-400 bg-gray-950"
      >
        <div
          class="text-gray-50 mb-1 text-2xl flex border-gray-400 flex-col py-2 items-center"
        >
          
          <p>Guitar Settings</p>
          <div class="flex flex-col">
            <div
              class="text-gray-50 text-2xl flex flex-col px-2 py-2 items-center"
            >
              <div class="flex text-gray-50 p-3 my-2 rounded-2xl bg-zinc-700">
                <div
                  v-for="(string, index) in tuningIndexes"
                  :key="index"
                  class="w-[68px] flex flex-col items-center"
                >
                  <button
                    @click="raiseString(index)"
                    class="cursor-pointer border-2 rounded-xl bg-rose-800 hover:bg-rose-900"
                  >
                    ⬆
                  </button>
                  <p>{{ musicalNotes[string] }}</p>
                  <button
                    @click="lowerString(index)"
                    class="cursor-pointer border-2 rounded-xl bg-rose-800 hover:bg-rose-900"
                  >
                    ⬇
                  </button>
                </div>
              </div>
            </div>
            <div class="flex text-lg items-center px-2 py-2 justify-center">
              <button
                @click="addString"
                class="cursor-pointer text-gray-100 bg-rose-700 hover:bg-rose-800 p-3 m-2 rounded-xl"
              >
                Add String
              </button>
              <button
                @click="removeString"
                class="cursor-pointer text-gray-100 bg-rose-700 hover:bg-rose-800 p-3 m-2 rounded-xl"
              >
                Remove String
              </button>
            </div>
          </div>
        </div>
        <div
          class="text-gray-50 text-2xl border-gray-400 flex flex-col pl-3 pr-2 py-2 items-center"
        >
          
          <div
            class="p-2 rounded-2xl bg-zinc-700  h-full flex flex-col justify-center relative"
          >
            <h5 class="text-center text-3xl mb-2">Highlight Notes On Fretboard</h5>
            <p class="text-[17px] text-center mb-2">
              Select a specific note to open the color palette
            </p>

            <div class="flex h-12  items-center justify-around">
              <button
                v-for="(note, index) in musicalNotes"
                @click="openPalette(index)"
                :key="note"
                :class="[
                  'cursor-pointer w-[46px] h-[46px] border-2 flex justify-center items-center border-gray-200 rounded-xl ml-2 transition transform hover:scale-105 duration-200 ease-in-out',
                  highlightedNotes[index] ? highlightedNotes[index] : '',
                ]"
              >
                <p>{{ musicalNotes[index] }}</p>
              </button>
            </div>
            <div
              v-if="paletteVisible"
              class="w-[600px] rounded-xl bg-zinc-900 fixed left-1/2 -translate-x-1/2 border z-50"
            >
              <div class="flex justify-between p-3 text-lg">
                <h5>
                  Add or remove highlighting to "{{
                    musicalNotes[selectedNote]
                  }}"
                </h5>
                <button
                  @click="closePalette"
                  class="cursor-pointer border-2 w-[40px] h-[40px] rounded-lg bg-rose-700 hover:bg-rose-800"
                >
                  <img :src="closeSVG" alt="Close Icon" />
                </button>
              </div>
              <div class="flex flex-wrap">
                <button
                  class="cursor-pointer flex flex-col justify-center items-center mx-2 mb-3 transition transform hover:scale-105 duration-200 ease-in-out"
                  @click="highlightSelectedNote(selectedNote, null)"
                >
                  <div class="h-[68px] w-[68px] border-2 rounded-2xl">
                    <img :src="closeSVG" alt="" />
                  </div>
                  <p class="text-sm">Remove</p>
                </button>
                <button
                  v-for="(value, key) in paletteColors"
                  :key="key"
                  class="cursor-pointer flex flex-col justify-center items-center mx-2 mb-3 transition transform hover:scale-105 duration-200 ease-in-out"
                  @click="highlightSelectedNote(selectedNote, value)"
                >
                  <div
                    :class="[
                      'h-[68px] w-[68px] border-2 rounded-2xl  flex items-center justify-center',
                      value,
                    ]"
                  >
                    <p
                      class="border-2 rounded-full w-10 h-10 flex items-center justify-center text-[18px]"
                    >
                      {{ musicalNotes[selectedNote] }}
                    </p>
                  </div>
                  <p class="text-sm">
                    {{ key.substring(0, 1).toUpperCase() + key.substring(1) }}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    :class="['p-5 flex z-0', horizontalFlip ? 'flex-row-reverse' : 'flex-row']"
  >
    <div class="w-1/25">
      <div class="w-full flex flex-col justify-between h-full">
        <div class="h-[54px]"></div>

        <div
          v-for="(note, index) in verticalFlip
            ? tuningIndexes
            : tuningIndexes.slice().reverse()"
          :key="index"
          :class="['h-[54px] relative']"
        >
          <div
            :class="[
              'absolute -top-5  flex items-center justify-center  border-2 border-gray-50 w-[42px] h-[42px] rounded-full',
              horizontalFlip ? 'left-1' : 'right-1',
              highlightedNotes[note] ? highlightedNotes[note] : 'bg-zinc-600',
            ]"
          >
            <p class="font-bold text-gray-50">{{ musicalNotes[note] }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="w-24/25 h-auto relative">
      <div
        :class="[
          'w-full h-[44px] absolute top-0 left-0 bg-gray-800 flex items-center z-10',
          horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in fretView"
          :key="n"
          :class="[
            ' h-[24px] flex justify-center',
            horizontalFlip
              ? 'border-l-4 border-l-gray-500'
              : 'border-r-4 border-r-gray-500',
            fretboardMarkers.includes(n) ? 'bg-amber-50' : '',
            fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        >
          <p v-if="fretboardMarkers.includes(n)">{{ n }}</p>
        </div>
      </div>
      <div
        class="w-full h-[44px] absolute bottom-0 left-0 bg-gray-800 flex items-center z-10"
      >
        <div
          v-for="n in fretView"
          :key="n"
          :class="[
            'h-[24px]  flex justify-center',
            horizontalFlip
              ? 'border-l-4 border-l-gray-500'
              : 'border-r-4 border-r-gray-500',
            fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div class="w-full h-[54px] border-b-2 border-t-2 flex">
        <div
          v-for="n in fretView"
          :key="n"
          :class="[
            'h-full  border-t-2 border-t-gray-200 border-b-2 border-b-gray-200 bg-black',
            horizontalFlip
              ? 'border-l-5 border-l-amber-200'
              : 'border-r-5 border-r-amber-200',
            fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div
        v-for="stringCount in tuningIndexes.length"
        :key="stringCount"
        :class="[
          'w-full h-[54px] bg-white border-b-2 border-t-2 flex',
          horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in fretView"
          :key="n"
          :class="[
            'relative h-full border-t-2 border-t-gray-200 border-b-2 border-b-gray-200 bg-black',
            horizontalFlip
              ? 'border-l-5 border-l-amber-200'
              : 'border-r-5 border-r-amber-200',
            fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        >
          <div
            v-if="
              tuningIndexes.length % 2 === 0 &&
              stringCount === tuningIndexes.length / 2 &&
              fretboardMarkers.includes(n) &&
              n % 12 !== 0
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2"
          ></div>
          <div
            v-if="
              (n % 12 === 0 && stringCount === tuningIndexes.length - 1) ||
              (n % 12 === 0 && stringCount === 1)
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2 flex items-center"
          ></div>
          <div
            v-if="
              tuningIndexes.length % 2 === 1 &&
              stringCount === Math.round(tuningIndexes.length / 2) &&
              fretboardMarkers.includes(n) &&
              n % 12 !== 0
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute -top-4 left-1/2 -translate-x-1/2 flex items-center"
          >
            <div class="w-full h-[4px] bg-gray-800"></div>
          </div>
          <div
            v-if="
              (onlyHighlighted && highlightedNotes[getNote(stringCount, n)]) ||
              !onlyHighlighted
            "
            :class="[
              'z-20  border-gray-100 border-2 w-[38px] h-[38px] absolute -top-5 rounded-full flex justify-center items-center',
              horizontalFlip ? 'left-0.5' : 'right-0.5',
              highlightedNotes[getNote(stringCount, n)]
                ? highlightedNotes[getNote(stringCount, n)]
                : 'bg-zinc-600',
            ]"
          >
            <p class="text-gray-100">
              {{ musicalNotes[getNote(stringCount, n)] }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="max-w-[1560px] w-full px-5 m-auto flex justify-center items-center"
  >
    <div
      class="flex flex-row flex-wrap items-center justify-around bg-gray-950 border-2 border-gray-400 rounded-2xl"
    >
      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">♯ / ♭?</h4>
        <button
          @click="toggleSharpsEnabled"
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
            onlyHighlighted
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
          @click="toggleHighlighted(true)"
        >
          Show Only Highlighted
        </button>
        <button
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs',
            !onlyHighlighted
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
          @click="toggleHighlighted(false)"
        >
          Show All Notes
        </button>
      </div>
      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Orientation</h4>
        <button
          @click="flipVertically"
          class="cursor-pointer text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700 hover:bg-rose-800"
        >
          Flip Vertically
        </button>
        <button
          @click="flipHorizontally"
          class="cursor-pointer text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700 hover:bg-rose-800"
        >
          Flip Horizontally
        </button>
      </div>
      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Fret View</h4>
        <button
          @click="fretViewTo12"
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs',
            fretView === 12
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
        >
          0...12
        </button>
        <button
          @click="fretViewTo24"
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs',
            fretView === 24
              ? 'bg-rose-700 cursor-not-allowed'
              : 'bg-zinc-700 hover:bg-zinc-800 cursor-pointer',
          ]"
        >
          Full 24
        </button>
      </div>
    </div>
  </div>
  <FooterComponent />
</template>
