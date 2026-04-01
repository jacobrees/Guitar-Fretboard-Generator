<script setup>
import ExploreFretRangeFilter from "./filters/ExploreFretRangeFilter.vue";
import ExploreStringRangeFilter from "./filters/ExploreStringRangeFilter.vue";
import { useFretboardViewport } from "@/composables/fretboard/useFretboardViewport";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";

const props = defineProps({
  disableHorizontalPadding: {
    type: Boolean,
    default: false,
  },
});

const instrument = useInstrumentStore();
const explore = useExploreStore();
const {
  effectiveFrets,
  showOpenStringMarkers,
  visibleFretBounds,
  visibleStringRows,
  visibleStringBounds,
  stringMarkers,
  fretCellStyle,
  openStringColumnStyle,
} = useFretboardViewport();

const shouldShowScrolledOpenStrings = () =>
  explore.currentWorkspaceMode === "focus" &&
  instrument.fretView === instrument.twelveFretViewId &&
  instrument.twelveFretViewStart > 0;

const shouldRenderOpenStringColumn = () =>
  showOpenStringMarkers.value || shouldShowScrolledOpenStrings();

const getOpenStringBubblePositionClass = () =>
  shouldShowScrolledOpenStrings() ? "left-1/2 -translate-x-1/2" : "right-1";

const updateVisibleFretRange = ({ startFret, endFret }) => {
  explore.setVisibleFretRange(startFret, endFret);
};

const updateVisibleStringRange = ({ startString, endString }) => {
  explore.setVisibleStringRange(startString, endString);
};

const setPlaybackMode = (enabled) => {
  explore.setPlaybackEnabled(enabled);
};

const isNoteRenderedAtPosition = (noteIndex, fret, stringPosition) => {
  if (fret === 0 && shouldShowScrolledOpenStrings()) {
    return (
      explore.isStringVisible(stringPosition) &&
      explore.isNoteVisible(noteIndex)
    );
  }

  return (
    explore.isFretVisible(fret) &&
    explore.isStringVisible(stringPosition) &&
    explore.isNoteVisible(noteIndex)
  );
};

const isPlaybackHighlightedNote = (noteIndex, fret, stringPosition) =>
  explore.currentWorkspaceMode === "focus" &&
  explore.playbackEnabled &&
  isNoteRenderedAtPosition(noteIndex, fret, stringPosition) &&
  explore.getDisplayColor(noteIndex) !== "bg-zinc-600";

const getNoteVisibilityClass = (noteIndex, fret, stringPosition) => {
  if (isNoteRenderedAtPosition(noteIndex, fret, stringPosition)) {
    return isPlaybackHighlightedNote(noteIndex, fret, stringPosition)
      ? "opacity-[0.85]"
      : "opacity-100";
  }

  return explore.currentWorkspaceMode === "focus"
    ? "opacity-0"
    : "opacity-0 pointer-events-none";
};

const getNoteInteractionClass = (noteIndex, fret, stringPosition) => {
  if (explore.currentWorkspaceMode !== "focus") {
    return "";
  }

  if (!explore.playbackEnabled) {
    return "cursor-pointer hover:opacity-[0.85]";
  }

  return isNoteRenderedAtPosition(noteIndex, fret, stringPosition)
    ? "cursor-pointer hover:opacity-100"
    : "cursor-pointer hover:opacity-[0.85]";
};

const logExploreNoteClick = (stringPosition, fret) => {
  if (explore.currentWorkspaceMode !== "focus") {
    return;
  }

  console.log(
    "Explore note clicked",
    instrument.getNoteDetails(stringPosition, fret),
  );
};
</script>

<template>
  <div :class="['w-full pt-3', props.disableHorizontalPadding ? '' : 'px-5']">
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
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                {{ explore.playbackEnabled ? "Playback" : "Filter" }}
              </p>
              <p class="mt-1 text-xs text-gray-500">
                {{
                  explore.playbackEnabled
                    ? "Click notes on the fretboard to trigger playback."
                    : "Adjust the visible note and string range while exploring."
                }}
              </p>
            </div>

            <div
              class="flex items-center gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-950/75 px-3 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
            >
              <div class="min-w-0">
                <p class="text-[11px] uppercase tracking-[0.2em] text-sky-200">
                  Explore Mode
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  {{
                    explore.playbackEnabled
                      ? "Playback mode active"
                      : "Filter mode active"
                  }}
                </p>
              </div>

              <div
                class="inline-flex shrink-0 rounded-xl border border-zinc-700/90 bg-zinc-900/90 p-1"
                role="group"
                aria-label="Explore interaction mode"
              >
                <button
                  type="button"
                  class="rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  :class="
                    !explore.playbackEnabled
                      ? 'bg-zinc-100 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                      : 'text-gray-300 hover:bg-zinc-800 hover:text-gray-100'
                  "
                  :aria-pressed="!explore.playbackEnabled"
                  @click="setPlaybackMode(false)"
                >
                  Filter
                </button>

                <button
                  type="button"
                  class="rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  :class="
                    explore.playbackEnabled
                      ? 'bg-sky-300 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                      : 'text-gray-300 hover:bg-zinc-800 hover:text-gray-100'
                  "
                  :aria-pressed="explore.playbackEnabled"
                  @click="setPlaybackMode(true)"
                >
                  Playback
                </button>
              </div>
            </div>
          </div>
        </div>

        <template v-if="!explore.playbackEnabled">
          <div
            class="border-l border-zinc-500/85 bg-zinc-900/90 px-3 backdrop-blur-md"
          >
            <div
              class="flex h-full flex-col justify-end pb-3 pt-3 text-gray-100"
            >
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
      </template>

      <div
        :class="[
          'min-w-0 overflow-hidden',
          explore.currentWorkspaceMode === 'focus'
            ? explore.playbackEnabled
              ? 'col-span-2 rounded-b-[1.75rem] border-x border-b border-zinc-500/85 bg-zinc-900/72'
              : 'border-x border-b border-zinc-500/85 bg-zinc-900/72'
            : '',
        ]"
      >
        <div class="z-0 flex w-full min-w-0">
          <div
            v-if="shouldRenderOpenStringColumn()"
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
                  :class="[
                    'absolute -top-5 flex size-11 items-center justify-center rounded-full border-2 border-gray-50 transition-opacity duration-150',
                    getOpenStringBubblePositionClass(),
                    explore.getDisplayColor(row.noteIndex),
                    getNoteVisibilityClass(row.noteIndex, 0, row.position),
                    getNoteInteractionClass(row.noteIndex, 0, row.position),
                  ]"
                  :aria-hidden="
                    !isNoteRenderedAtPosition(row.noteIndex, 0, row.position)
                  "
                  @click="logExploreNoteClick(row.position, 0)"
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
              class="absolute top-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800"
            >
              <div
                v-for="n in effectiveFrets"
                :key="n"
                :class="[
                  'flex h-6 justify-center',
                  'border-r-4 border-r-gray-500',
                  instrument.fretboardMarkers.includes(n) ? 'bg-amber-50' : '',
                ]"
                :style="fretCellStyle"
              >
                <p
                  v-if="instrument.fretboardMarkers.includes(n)"
                  class="text-sm font-semibold text-zinc-900"
                >
                  {{ n }}
                </p>
              </div>
            </div>

            <div
              class="absolute bottom-0 left-0 z-10 flex h-11 w-full items-center bg-gray-800"
            >
              <div
                v-for="n in effectiveFrets"
                :key="n"
                class="flex h-6 justify-center border-r-4 border-r-gray-500"
                :style="fretCellStyle"
              ></div>
            </div>

            <div class="flex h-14 w-full border-y-2 border-gray-900">
              <div
                v-for="n in effectiveFrets"
                :key="n"
                :class="[
                  'h-full border-y-2 border-y-gray-200 bg-black',
                  'border-r-4 border-r-amber-200',
                ]"
                :style="fretCellStyle"
              ></div>
            </div>

            <div
              v-for="row in visibleStringRows"
              :key="row.position"
              class="flex h-14 w-full border-y-2 border-gray-900"
            >
              <div
                v-for="n in effectiveFrets"
                :key="n"
                :class="[
                  'relative h-full border-y-2 border-y-gray-200 bg-black',
                  'border-r-4 border-r-amber-200',
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
                  :class="[
                    'absolute -top-5 right-0.5 z-20 flex size-10 items-center justify-center rounded-full border-2 border-gray-100 transition-opacity duration-150',
                    explore.getDisplayColor(
                      instrument.getNote(row.position, n),
                    ),
                    getNoteVisibilityClass(
                      instrument.getNote(row.position, n),
                      n,
                      row.position,
                    ),
                    getNoteInteractionClass(
                      instrument.getNote(row.position, n),
                      n,
                      row.position,
                    ),
                  ]"
                  :aria-hidden="
                    !isNoteRenderedAtPosition(
                      instrument.getNote(row.position, n),
                      n,
                      row.position,
                    )
                  "
                  @click="logExploreNoteClick(row.position, n)"
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
