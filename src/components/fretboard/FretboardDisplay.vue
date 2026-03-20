<script setup>
import { computed, watch } from "vue";
import ExploreFretRangeFilter from "@/components/fretboard/ExploreFretRangeFilter.vue";
import ExploreStringRangeFilter from "@/components/fretboard/ExploreStringRangeFilter.vue";
import { useMinWidth } from "@/composables/useMinWidth";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const instrument = useInstrumentStore();
const explore = useExploreStore();
const { isMinWidth: hasFullFretRangeAccess } = useMinWidth(1536);
const fullFretViewId = instrument.fullFretViewId;

watch(
  [hasFullFretRangeAccess, () => instrument.fretView],
  ([hasAccess, fretView]) => {
    if (!hasAccess && fretView === fullFretViewId) {
      instrument.fretViewTo12();
    }
  },
  { immediate: true },
);

const effectiveFretViewId = computed(() =>
  !hasFullFretRangeAccess.value && instrument.fretView === fullFretViewId
    ? instrument.defaultFretViewId
    : instrument.fretView,
);

const effectiveFretPreset = computed(() =>
  instrument.getFretViewPreset(effectiveFretViewId.value),
);

const effectiveFrets = computed(() =>
  instrument.getFretRange(effectiveFretViewId.value),
);

const showOpenStringMarkers = computed(
  () => effectiveFretPreset.value.showOpenStringMarkers,
);

const visibleFretBounds = computed(() => ({
  minFret: showOpenStringMarkers.value ? 0 : effectiveFrets.value[0],
  maxFret: effectiveFrets.value[effectiveFrets.value.length - 1],
}));

watch(
  [
    () => visibleFretBounds.value.minFret,
    () => visibleFretBounds.value.maxFret,
  ],
  ([minFret, maxFret]) => {
    explore.resetVisibleFretRange(minFret, maxFret);
  },
  { immediate: true },
);

const fretCellStyle = computed(() => ({
  width: `${100 / effectiveFrets.value.length}%`,
}));

const openStringColumnStyle = computed(() => ({
  width: `${100 / (effectiveFrets.value.length + 1)}%`,
}));

const visibleStringRows = computed(() =>
  instrument.visibleTuningIndexes.map((noteIndex, index) => ({
    position: index + 1,
    noteIndex,
    stringNumber: instrument.verticalFlip
      ? index + 1
      : instrument.tuningIndexes.length - index,
  })),
);

const visibleStringBounds = computed(() => ({
  minString: 1,
  maxString: visibleStringRows.value.length,
}));

watch(
  () => visibleStringBounds.value.maxString,
  (maxString) => {
    explore.resetVisibleStringRange(1, maxString);
  },
  { immediate: true },
);

const stringMarkers = computed(() =>
  visibleStringRows.value.map((row) => ({
    value: row.position,
    label: `${row.stringNumber}`,
  })),
);

const updateVisibleFretRange = ({ startFret, endFret }) => {
  explore.setVisibleFretRange(startFret, endFret);
};

const updateVisibleStringRange = ({ startString, endString }) => {
  explore.setVisibleStringRange(startString, endString);
};

const isNoteRenderedAtPosition = (noteIndex, fret, stringPosition) =>
  explore.isFretVisible(fret) &&
  explore.isStringVisible(stringPosition) &&
  explore.isNoteVisible(noteIndex);
</script>

<template>
  <div class="w-full px-5 pt-3">
    <div
      :class="[
        'min-w-0',
        explore.currentWorkspaceMode === 'focus'
          ? 'grid grid-cols-[6rem_minmax(0,1fr)] items-stretch shadow-[0_26px_70px_rgba(0,0,0,0.22)]'
          : '',
      ]"
    >
      <template v-if="explore.currentWorkspaceMode === 'focus'">
        <div
          class="col-span-2 rounded-t-[1.75rem] border border-zinc-500/85 bg-zinc-900/92 px-4 pb-3 pt-3 backdrop-blur-md"
        >
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
            Note/Interval Filter
          </p>
        </div>

        <div
          class="border-l border-zinc-500/85 bg-zinc-900/90 px-3 backdrop-blur-md"
        >
          <div class="flex h-full flex-col justify-end pb-3 pt-3 text-gray-100">
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              Strings Filter
            </p>
            <p class="mt-1 text-xs text-gray-500">Visible strings</p>
          </div>
        </div>

        <div
          class="min-w-0 overflow-hidden border-r border-zinc-500/85 bg-zinc-900/90 backdrop-blur-md"
        >
          <ExploreFretRangeFilter
            class="min-w-0 flex-1"
            :min-fret="visibleFretBounds.minFret"
            :max-fret="visibleFretBounds.maxFret"
            :start-fret="explore.visibleFretRangeStart"
            :end-fret="explore.visibleFretRangeEnd"
            :allow-open-string-start="showOpenStringMarkers"
            :marker-frets="instrument.fretboardMarkers"
            @update-fret-range="updateVisibleFretRange"
          />
        </div>

        <div
          class="overflow-hidden border-l border-b border-zinc-500/85 bg-zinc-900/90 backdrop-blur-md"
        >
          <ExploreStringRangeFilter
            :min-string="visibleStringBounds.minString"
            :max-string="visibleStringBounds.maxString"
            :start-string="explore.visibleStringRangeStart"
            :end-string="explore.visibleStringRangeEnd"
            :string-markers="stringMarkers"
            @update-string-range="updateVisibleStringRange"
          />
        </div>
      </template>

      <div
        :class="[
          'min-w-0 overflow-hidden',
          explore.currentWorkspaceMode === 'focus'
            ? 'border-x border-b border-zinc-500/85 bg-zinc-900/72'
            : '',
        ]"
      >
        <div
          :class="[
            'z-0 flex w-full min-w-0',
            instrument.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
          ]"
        >
          <div
            v-if="showOpenStringMarkers"
            class="shrink-0"
            :style="openStringColumnStyle"
          >
            <div class="w-full flex flex-col justify-between h-full">
              <div class="h-14"></div>

              <div
                v-for="row in visibleStringRows"
                :key="row.position"
                class="h-14 relative"
              >
                <div
                  v-if="
                    isNoteRenderedAtPosition(row.noteIndex, 0, row.position)
                  "
                  :class="[
                    'absolute -top-5 flex size-11 items-center justify-center rounded-full border-2 border-gray-50',
                    instrument.horizontalFlip ? 'left-1' : 'right-1',
                    explore.getDisplayColor(row.noteIndex),
                  ]"
                >
                  <p class="text-sm font-semibold text-gray-50">
                    {{ explore.getDisplayLabel(row.noteIndex) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="min-w-0 flex-1 h-auto relative">
            <div
              :class="[
                'absolute top-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800',
                instrument.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
              ]"
            >
              <div
                v-for="n in effectiveFrets"
                :key="n"
                :class="[
                  'flex h-6 justify-center',
                  instrument.horizontalFlip
                    ? 'border-l-4 border-l-gray-500'
                    : 'border-r-4 border-r-gray-500',
                  instrument.fretboardMarkers.includes(n) ? 'bg-amber-50' : '',
                ]"
                :style="fretCellStyle"
              >
                <p v-if="instrument.fretboardMarkers.includes(n)">{{ n }}</p>
              </div>
            </div>

            <div
              class="absolute bottom-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800"
            >
              <div
                v-for="n in effectiveFrets"
                :key="n"
                :class="[
                  'flex h-6 justify-center',
                  instrument.horizontalFlip
                    ? 'border-l-4 border-l-gray-500'
                    : 'border-r-4 border-r-gray-500',
                ]"
                :style="fretCellStyle"
              ></div>
            </div>

            <div class="flex h-14 w-full border-y-2">
              <div
                v-for="n in effectiveFrets"
                :key="n"
                :class="[
                  'h-full border-y-2 border-y-gray-200 bg-black',
                  instrument.horizontalFlip
                    ? 'border-l-4 border-l-amber-200'
                    : 'border-r-4 border-r-amber-200',
                ]"
                :style="fretCellStyle"
              ></div>
            </div>

            <div
              v-for="row in visibleStringRows"
              :key="row.position"
              :class="[
                'flex h-14 w-full border-y-2 bg-white',
                instrument.horizontalFlip ? 'flex-row-reverse' : 'flex-row',
              ]"
            >
              <div
                v-for="n in effectiveFrets"
                :key="n"
                :class="[
                  'relative h-full border-y-2 border-y-gray-200 bg-black',
                  instrument.horizontalFlip
                    ? 'border-l-4 border-l-amber-200'
                    : 'border-r-4 border-r-amber-200',
                ]"
                :style="fretCellStyle"
              >
                <div
                  v-if="
                    instrument.tuningIndexes.length % 2 === 0 &&
                    row.position === instrument.tuningIndexes.length / 2 &&
                    instrument.fretboardMarkers.includes(n) &&
                    n % 12 !== 0
                  "
                  class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2"
                ></div>

                <div
                  v-if="
                    (n % 12 === 0 &&
                      row.position === instrument.tuningIndexes.length - 1) ||
                    (n % 12 === 0 && row.position === 1)
                  "
                  class="rounded-full w-6 h-6 bg-amber-50 absolute top-1/2 left-1/2 -translate-1/2 flex items-center"
                ></div>

                <div
                  v-if="
                    instrument.tuningIndexes.length % 2 === 1 &&
                    row.position ===
                      Math.round(instrument.tuningIndexes.length / 2) &&
                    instrument.fretboardMarkers.includes(n) &&
                    n % 12 !== 0
                  "
                  class="rounded-full w-6 h-6 bg-amber-50 absolute -top-4 left-1/2 -translate-x-1/2 flex items-center"
                >
                  <div class="h-1 w-full bg-gray-800"></div>
                </div>

                <div
                  v-if="
                    isNoteRenderedAtPosition(
                      instrument.getNote(row.position, n),
                      n,
                      row.position,
                    )
                  "
                  :class="[
                    'absolute -top-5 z-20 flex size-10 items-center justify-center rounded-full border-2 border-gray-100',
                    instrument.horizontalFlip ? 'left-0.5' : 'right-0.5',
                    explore.getDisplayColor(
                      instrument.getNote(row.position, n),
                    ),
                  ]"
                >
                  <p class="text-sm font-semibold text-gray-100">
                    {{
                      explore.getDisplayLabel(
                        instrument.getNote(row.position, n),
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
