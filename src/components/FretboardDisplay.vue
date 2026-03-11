<script setup>
import { useFretboardStore } from "@/stores/fretboard";

const fretboard = useFretboardStore();
</script>

<template>
  <div
    :class="[
      'p-5 flex z-0',
      fretboard.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
    ]"
  >
    <div class="w-1/25">
      <div class="w-full flex flex-col justify-between h-full">
        <div class="h-[54px]"></div>

        <div
          v-for="(note, index) in fretboard.visibleTuningIndexes"
          :key="index"
          class="h-[54px] relative"
        >
          <div
            :class="[
              'absolute -top-5 flex items-center justify-center border-2 border-gray-50 w-[42px] h-[42px] rounded-full',
              fretboard.horizontalFlip ? 'left-1' : 'right-1',
              fretboard.highlightedNotes[note]
                ? fretboard.highlightedNotes[note]
                : 'bg-zinc-600',
            ]"
          >
            <p class="font-bold text-gray-50">
              {{ fretboard.musicalNotes[note] }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="w-24/25 h-auto relative">
      <div
        :class="[
          'w-full h-[44px] absolute top-0 left-0 bg-gray-800 flex items-center z-10',
          fretboard.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'h-[24px] flex justify-center',
            fretboard.horizontalFlip
              ? 'border-l-4 border-l-gray-500'
              : 'border-r-4 border-r-gray-500',
            fretboard.fretboardMarkers.includes(n) ? 'bg-amber-50' : '',
            fretboard.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        >
          <p v-if="fretboard.fretboardMarkers.includes(n)">{{ n }}</p>
        </div>
      </div>

      <div
        class="w-full h-[44px] absolute bottom-0 left-0 bg-gray-800 flex items-center z-10"
      >
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'h-[24px] flex justify-center',
            fretboard.horizontalFlip
              ? 'border-l-4 border-l-gray-500'
              : 'border-r-4 border-r-gray-500',
            fretboard.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div class="w-full h-[54px] border-b-2 border-t-2 flex">
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'h-full border-t-2 border-t-gray-200 border-b-2 border-b-gray-200 bg-black',
            fretboard.horizontalFlip
              ? 'border-l-5 border-l-amber-200'
              : 'border-r-5 border-r-amber-200',
            fretboard.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div
        v-for="stringCount in fretboard.tuningIndexes.length"
        :key="stringCount"
        :class="[
          'w-full h-[54px] bg-white border-b-2 border-t-2 flex',
          fretboard.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'relative h-full border-t-2 border-t-gray-200 border-b-2 border-b-gray-200 bg-black',
            fretboard.horizontalFlip
              ? 'border-l-5 border-l-amber-200'
              : 'border-r-5 border-r-amber-200',
            fretboard.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        >
          <div
            v-if="
              fretboard.tuningIndexes.length % 2 === 0 &&
              stringCount === fretboard.tuningIndexes.length / 2 &&
              fretboard.fretboardMarkers.includes(n) &&
              n % 12 !== 0
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2"
          ></div>

          <div
            v-if="
              (n % 12 === 0 &&
                stringCount === fretboard.tuningIndexes.length - 1) ||
              (n % 12 === 0 && stringCount === 1)
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2 flex items-center"
          ></div>

          <div
            v-if="
              fretboard.tuningIndexes.length % 2 === 1 &&
              stringCount === Math.round(fretboard.tuningIndexes.length / 2) &&
              fretboard.fretboardMarkers.includes(n) &&
              n % 12 !== 0
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute -top-4 left-1/2 -translate-x-1/2 flex items-center"
          >
            <div class="w-full h-[4px] bg-gray-800"></div>
          </div>

          <div
            v-if="
              (fretboard.onlyHighlighted &&
                fretboard.highlightedNotes[
                  fretboard.getNote(stringCount, n)
                ]) ||
              !fretboard.onlyHighlighted
            "
            :class="[
              'z-20 border-gray-100 border-2 w-[38px] h-[38px] absolute -top-5 rounded-full flex justify-center items-center',
              fretboard.horizontalFlip ? 'left-0.5' : 'right-0.5',
              fretboard.highlightedNotes[fretboard.getNote(stringCount, n)]
                ? fretboard.highlightedNotes[fretboard.getNote(stringCount, n)]
                : 'bg-zinc-600',
            ]"
          >
            <p class="text-gray-100">
              {{ fretboard.musicalNotes[fretboard.getNote(stringCount, n)] }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
