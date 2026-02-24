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

const sharpsEnabled = ref(true);
const selectedNote = ref(null);
const paletteVisible = ref(false);
const verticalFlip = ref(false);
const horizontalFlip = ref(false);

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

const guitarTuning = computed(() =>
  tuningIndexes.value.map((i) => musicalNotes.value[i]),
);

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
  <div :class="['p-5 flex', horizontalFlip ? 'flex-row-reverse' : 'flex-row']">
    <div class="w-1/25">
      <div class="w-full flex flex-col justify-between h-full">
        <div class="h-[54px]"></div>

        <div
          v-for="(note, index) in verticalFlip
            ? guitarTuning
            : guitarTuning.slice().reverse()"
          :key="index"
          class="h-[54px] relative"
        >
          <div
            :class="[
              'absolute -top-5  flex items-center justify-center bg-gray-50 w-[42px] h-[42px] rounded-full',
              horizontalFlip ? 'left-1' : 'right-1',
            ]"
          >
            <p class="font-bold text-ll">{{ note }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="w-24/25 h-auto relative">
      <div
        :class="[
          'w-full h-[44px] absolute top-0 left-0 bg-gray-500 flex items-center z-10',
          horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in fretView"
          :key="n"
          :class="[
            ' h-[24px] flex justify-center',
            horizontalFlip
              ? 'border-l-4 border-l-gray-600'
              : 'border-r-4 border-r-gray-600',
            fretboardMarkers.includes(n) ? 'bg-amber-50' : '',
            fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        >
          <p v-if="fretboardMarkers.includes(n)">{{ n }}</p>
        </div>
      </div>
      <div
        class="w-full h-[44px] absolute bottom-0 left-0 bg-gray-500 flex items-center z-10"
      >
        <div
          v-for="n in fretView"
          :key="n"
          :class="[
            'h-[24px]  flex justify-center',
            horizontalFlip
              ? 'border-l-4 border-l-gray-600'
              : 'border-r-4 border-r-gray-600',
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
              fretboardMarkers.includes(n)
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2"
          ></div>
          <div
            v-if="
              tuningIndexes.length % 2 === 1 &&
              stringCount === Math.round(tuningIndexes.length / 2) &&
              fretboardMarkers.includes(n)
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute -top-4 left-1/2 -translate-x-1/2 flex items-center"
          >
            <div class="w-full h-[4px] bg-gray-800"></div>
          </div>
          <div
            :class="[
              'z-20 bg-zinc-600 border-gray-100 border-2 w-[38px] h-[38px] absolute -top-5 rounded-full flex justify-center items-center',
              horizontalFlip ? 'left-0.5' : 'right-0.5',
            ]"
          >
            <p class="text-gray-100">
              {{
                musicalNotes[
                  verticalFlip
                    ? (tuningIndexes[stringCount - 1] + n) % 12
                    : ([...tuningIndexes].reverse()[stringCount - 1] + n) % 12
                ]
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-[1560px] w-full px-5 m-auto">
    <h3 class="text-center text-gray-50 text-5xl py-2">Options</h3>
    <div
      class="flex flex-wrap justify-around p-5 rounded-2xl border-2 border-gray-400 bg-gray-950"
    >
      <div class="flex flex-col items-center px-2 py-2 justify-center">
        <h4 class="text-gray-50 text-2xl">String Count</h4>
        <button
          @click="addString"
          class="text-gray-100 bg-rose-700 p-3 my-2 rounded-xl w-3xs"
        >
          Add String
        </button>
        <button
          @click="removeString"
          class="text-gray-100 bg-rose-700 p-3 my-2 rounded-xl w-3xs"
        >
          Remove String
        </button>
      </div>
      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">♯ / ♭?</h4>
        <button
          @click="toggleSharpsEnabled"
          class="text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700"
        >
          Toggle ♯/♭
        </button>
      </div>
      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Orientation</h4>
        <button
          @click="flipVertically"
          class="text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700"
        >
          Flip Vertically
        </button>
        <button
          @click="flipHorizontally"
          class="text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700"
        >
          Flip Horizontally
        </button>
      </div>
      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Fret View</h4>
        <button
          @click="fretViewTo12"
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs ',
            fretView === 12 ? 'bg-rose-700' : 'bg-zinc-700',
          ]"
        >
          0...12
        </button>
        <button
          @click="fretViewTo24"
          :class="[
            'text-gray-50 p-3 my-2 rounded-xl w-3xs ',
            fretView === 24 ? 'bg-rose-700' : 'bg-zinc-700',
          ]"
        >
          Full 24
        </button>
      </div>
      <div class="text-gray-50 text-2xl flex flex-col px-2 py-2 items-center">
        <h4>Adjust Tuning</h4>
        <div class="flex text-gray-50 p-3 my-2 rounded-2xl bg-zinc-700">
          <div
            v-for="(string, index) in guitarTuning"
            :key="index"
            class="w-[68px] flex flex-col items-center"
          >
            <button
              @click="raiseString(index)"
              class="border-2 rounded-xl bg-rose-800"
            >
              ⬆
            </button>
            <p>{{ string }}</p>
            <button
              @click="lowerString(index)"
              class="border-2 rounded-xl bg-rose-800"
            >
              ⬇
            </button>
          </div>
        </div>
      </div>
      <div class="text-gray-50 text-2xl flex flex-col px-2 py-2 items-center">
        <h4 class="mb-2">Highlighting</h4>
        <div
          class="bg-zinc-700 p-2 rounded-2xl w-full h-full flex flex-col justify-center relative"
        >
          <p class="text-[18px] text-center mb-2">
            Select a specific note to open the color palette
          </p>
          <div class="flex h-12 items-center justify-around">
            <button
              v-for="(note, index) in musicalNotes"
              @click="openPalette(index)"
              :key="note"
              class="w-[46px] h-[46px] border-2 flex justify-center items-center border-gray-200 rounded-xl ml-2"
            >
              <p>{{ musicalNotes[index] }}</p>
            </button>
          </div>
          <div
            v-if="paletteVisible"
            class="w-[600px] rounded-xl bg-zinc-900 fixed bottom-2 left-1/2 -translate-x-1/2 border z-30"
          >
            <div class="flex justify-between p-3 text-lg">
              <h5>
                Add or remove highlighting to "{{ musicalNotes[selectedNote] }}"
              </h5>
              <button
                @click="closePalette"
                class="border-2 w-[40px] h-[40px] rounded-lg bg-rose-700"
              >
                <img :src="closeSVG" alt="Close Icon" />
              </button>
            </div>
            <div class="flex flex-wrap">
              <button
                class="flex flex-col justify-center items-center mx-2 mb-3"
              >
                <div class="h-[68px] w-[68px] border-2 rounded-2xl">
                  <img :src="closeSVG" alt="" />
                </div>
                <p class="text-sm">Remove</p>
              </button>
              <button
                v-for="(value, key) in paletteColors"
                :key="key"
                class="flex flex-col justify-center items-center mx-2 mb-3"
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

      <div class="flex flex-col justify-center px-2 py-2 items-center">
        <h4 class="text-gray-50 text-2xl">Visibility</h4>
        <button class="text-gray-50 p-3 my-2 rounded-xl w-3xs bg-rose-700">
          Show All Notes
        </button>
        <button class="text-gray-50 p-3 my-2 rounded-xl w-3xs bg-zinc-700">
          Show Only Highlighted
        </button>
      </div>
    </div>
  </div>
  <FooterComponent />
</template>
