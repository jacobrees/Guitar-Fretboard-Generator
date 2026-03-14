<script setup>
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const instrument = useInstrumentStore();
const explore = useExploreStore();
</script>

<template>
  <div
    :class="[
      'z-0 mx-auto flex w-full max-w-screen-2xl p-5',
      instrument.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
    ]"
  >
    <div class="w-1/25">
      <div class="w-full flex flex-col justify-between h-full">
        <div class="h-14"></div>

        <div
          v-for="(note, index) in instrument.visibleTuningIndexes"
          :key="index"
          class="h-14 relative"
        >
          <div
            :class="[
              'absolute -top-5 flex size-11 items-center justify-center rounded-full border-2 border-gray-50',
              instrument.horizontalFlip ? 'left-1' : 'right-1',
              explore.getDisplayColor(note),
            ]"
          >
            <p class="text-sm font-semibold text-gray-50">
              {{ explore.getDisplayLabel(note) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="w-24/25 h-auto relative">
      <div
        :class="[
          'absolute top-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800',
          instrument.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in instrument.fretView"
          :key="n"
          :class="[
            'flex h-6 justify-center',
            instrument.horizontalFlip
              ? 'border-l-4 border-l-gray-500'
              : 'border-r-4 border-r-gray-500',
            instrument.fretboardMarkers.includes(n) ? 'bg-amber-50' : '',
            instrument.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        >
          <p v-if="instrument.fretboardMarkers.includes(n)">{{ n }}</p>
        </div>
      </div>

      <div
        class="absolute bottom-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800"
      >
        <div
          v-for="n in instrument.fretView"
          :key="n"
          :class="[
            'flex h-6 justify-center',
            instrument.horizontalFlip
              ? 'border-l-4 border-l-gray-500'
              : 'border-r-4 border-r-gray-500',
            instrument.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div class="flex h-14 w-full border-y-2">
        <div
          v-for="n in instrument.fretView"
          :key="n"
          :class="[
            'h-full border-y-2 border-y-gray-200 bg-black',
            instrument.horizontalFlip
              ? 'border-l-4 border-l-amber-200'
              : 'border-r-4 border-r-amber-200',
            instrument.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        ></div>
      </div>

      <div
        v-for="stringCount in instrument.tuningIndexes.length"
        :key="stringCount"
        :class="[
          'flex h-14 w-full border-y-2 bg-white',
          instrument.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
        ]"
      >
        <div
          v-for="n in instrument.fretView"
          :key="n"
          :class="[
            'relative h-full border-y-2 border-y-gray-200 bg-black',
            instrument.horizontalFlip
              ? 'border-l-4 border-l-amber-200'
              : 'border-r-4 border-r-amber-200',
            instrument.fretView === 24 ? 'w-1/24' : 'w-2/24',
          ]"
        >
          <div
            v-if="
              instrument.tuningIndexes.length % 2 === 0 &&
              stringCount === instrument.tuningIndexes.length / 2 &&
              instrument.fretboardMarkers.includes(n) &&
              n % 12 !== 0
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2"
          ></div>

          <div
            v-if="
              (n % 12 === 0 &&
                stringCount === instrument.tuningIndexes.length - 1) ||
              (n % 12 === 0 && stringCount === 1)
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2 flex items-center"
          ></div>

          <div
            v-if="
              instrument.tuningIndexes.length % 2 === 1 &&
              stringCount === Math.round(instrument.tuningIndexes.length / 2) &&
              instrument.fretboardMarkers.includes(n) &&
              n % 12 !== 0
            "
            class="rounded-full w-6 h-6 bg-amber-50 absolute -top-4 left-1/2 -translate-x-1/2 flex items-center"
          >
            <div class="h-1 w-full bg-gray-800"></div>
          </div>

          <div
            v-if="explore.isNoteVisible(instrument.getNote(stringCount, n))"
            :class="[
              'absolute -top-5 z-20 flex size-10 items-center justify-center rounded-full border-2 border-gray-100',
              instrument.horizontalFlip ? 'left-0.5' : 'right-0.5',
              explore.getDisplayColor(instrument.getNote(stringCount, n)),
            ]"
          >
            <p class="text-sm font-semibold text-gray-100">
              {{ explore.getDisplayLabel(instrument.getNote(stringCount, n)) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
