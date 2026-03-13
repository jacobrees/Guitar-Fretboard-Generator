<script setup>
import { useFretboardStore } from "@/stores/fretboard";

const fretboard = useFretboardStore();
</script>

<template>
  <div
    :class="[
      'z-0 mx-auto flex w-full max-w-screen-2xl p-5',
      fretboard.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
    ]"
  >
    <div class="w-1/25">
      <div class="w-full flex flex-col justify-between h-full">
        <div class="h-14"></div>

        <div
          v-for="(note, index) in fretboard.visibleTuningIndexes"
          :key="index"
          class="h-14 relative"
        >
          <div
            :class="[
              'absolute -top-5 flex size-11 items-center justify-center rounded-full border-2 border-gray-50',
              fretboard.horizontalFlip ? 'left-1' : 'right-1',
              fretboard.highlightedNotes[note]
                ? fretboard.highlightedNotes[note]
                : 'bg-zinc-600',
            ]"
          >
            <p class="text-sm font-semibold text-gray-50">
              {{ fretboard.getDisplayLabel(note) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="w-24/25 h-auto relative">
      <div
        :class="[
          'absolute top-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800',
          fretboard.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'flex h-6 justify-center',
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
        class="absolute bottom-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800"
      >
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'flex h-6 justify-center',
            fretboard.horizontalFlip
              ? 'border-l-4 border-l-gray-500'
              : 'border-r-4 border-r-gray-500',
            fretboard.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div class="flex h-14 w-full border-y-2">
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'h-full border-y-2 border-y-gray-200 bg-black',
            fretboard.horizontalFlip
              ? 'border-l-4 border-l-amber-200'
              : 'border-r-4 border-r-amber-200',
            fretboard.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div
        v-for="stringCount in fretboard.tuningIndexes.length"
        :key="stringCount"
        :class="[
          'flex h-14 w-full border-y-2 bg-white',
          fretboard.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in fretboard.fretView"
          :key="n"
          :class="[
            'relative h-full border-y-2 border-y-gray-200 bg-black',
            fretboard.horizontalFlip
              ? 'border-l-4 border-l-amber-200'
              : 'border-r-4 border-r-amber-200',
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
            <div class="h-1 w-full bg-gray-800"></div>
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
              'absolute -top-5 z-20 flex size-10 items-center justify-center rounded-full border-2 border-gray-100',
              fretboard.horizontalFlip ? 'left-0.5' : 'right-0.5',
              fretboard.highlightedNotes[fretboard.getNote(stringCount, n)]
                ? fretboard.highlightedNotes[fretboard.getNote(stringCount, n)]
                : 'bg-zinc-600',
            ]"
          >
            <p class="text-sm font-semibold text-gray-100">
              {{ fretboard.getDisplayLabel(fretboard.getNote(stringCount, n)) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
