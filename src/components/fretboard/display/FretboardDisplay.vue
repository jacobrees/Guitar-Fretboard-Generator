<script setup>
import { computed } from "vue";

import ExploreFretRangeFilter from "./filters/ExploreFretRangeFilter.vue";
import ExploreStringRangeFilter from "./filters/ExploreStringRangeFilter.vue";
import PlaybackOptionsPanel from "./playback/PlaybackOptionsPanel.vue";
import { useFretboardViewport } from "@/composables/fretboard/useFretboardViewport";
import { useExploreStore } from "@/stores/explore";
import { useInstrumentStore } from "@/stores/instrument";
import { usePlaybackStore } from "@/stores/playback";

const props = defineProps({
  disableHorizontalPadding: {
    type: Boolean,
    default: false,
  },
});

const instrument = useInstrumentStore();
const explore = useExploreStore();
const playback = usePlaybackStore();
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

const fretFilterLeadingSpacerCount = computed(() =>
  shouldShowScrolledOpenStrings() ? 1 : 0,
);

const minimumRenderedFret = computed(() => effectiveFrets.value[0] ?? 0);
const maximumRenderedFret = computed(
  () => effectiveFrets.value[effectiveFrets.value.length - 1] ?? 0,
);
const renderedFretSet = computed(() => new Set(effectiveFrets.value));
const selectedFinderNotes = computed(() => playback.selectedVoicing);

const isFretRenderedInViewport = (fret) =>
  fret === 0 ? shouldRenderOpenStringColumn() : renderedFretSet.value.has(fret);

const isFretLeftOfViewport = (fret) => {
  if (fret === 0) {
    return !shouldRenderOpenStringColumn();
  }

  return !renderedFretSet.value.has(fret) && fret < minimumRenderedFret.value;
};

const isFretRightOfViewport = (fret) => fret > maximumRenderedFret.value;

const hasPlaybackNotesBeforeFretView = computed(
  () =>
    explore.currentWorkspaceMode === "focus" &&
    explore.playbackEnabled &&
    selectedFinderNotes.value.some(({ fret }) => isFretLeftOfViewport(fret)),
);

const hasPlaybackNotesAfterFretView = computed(
  () =>
    explore.currentWorkspaceMode === "focus" &&
    explore.playbackEnabled &&
    selectedFinderNotes.value.some(({ fret }) => isFretRightOfViewport(fret)),
);

const hasPlaybackNotesOutsideFretView = computed(
  () =>
    hasPlaybackNotesBeforeFretView.value || hasPlaybackNotesAfterFretView.value,
);

const showPlaybackViewportIndicators = computed(
  () => explore.currentWorkspaceMode === "focus" && explore.playbackEnabled,
);

const getPlaybackViewportIndicatorClass = (isActive) =>
  isActive
    ? "border-slate-950/90 bg-cyan-100 text-zinc-950 shadow-[0_12px_28px_rgba(34,211,238,0.12)]"
    : "border-zinc-700/80 bg-zinc-950/75 text-zinc-500";

const getPlaybackViewportIndicatorTitleClass = () =>
  hasPlaybackNotesOutsideFretView.value ? "text-gray-200" : "text-gray-500";

const getPlaybackViewportIndicatorSubtitleClass = () =>
  hasPlaybackNotesOutsideFretView.value ? "text-gray-400" : "text-gray-600";

const updateVisibleFretRange = ({ startFret, endFret }) => {
  explore.setVisibleFretRange(startFret, endFret);
};

const updateVisibleStringRange = ({ startString, endString }) => {
  explore.setVisibleStringRange(startString, endString);
};

const setPlaybackMode = (enabled) => {
  explore.setPlaybackEnabled(enabled);
};

const resetFilteredNotes = () => {
  explore.resetNotePositionVisibilityOverrides();
};

const isFinderNoteSelected = (stringPosition, fret) =>
  explore.currentWorkspaceMode === "focus" &&
  explore.playbackEnabled &&
  playback.isNotePositionSelected(stringPosition, fret);

const isNotePositionWithinFilterRanges = (stringPosition, fret) =>
  explore.currentWorkspaceMode === "focus" &&
  !explore.playbackEnabled &&
  explore.isNotePositionWithinInteractiveFilterRange(stringPosition, fret);

const isNoteRenderedAtPosition = (noteIndex, fret, stringPosition) => {
  const isCurrentlySelectedHiddenNote = isFinderNoteSelected(
    stringPosition,
    fret,
  );
  const isNoteWithinViewport = isFretRenderedInViewport(fret);

  if (fret === 0 && shouldShowScrolledOpenStrings()) {
    return (
      explore.isStringVisible(stringPosition) &&
      isNoteWithinViewport &&
      (explore.isNotePositionVisible(noteIndex, stringPosition, fret) ||
        isCurrentlySelectedHiddenNote)
    );
  }

  return (
    (explore.isFretVisible(fret) || isCurrentlySelectedHiddenNote) &&
    explore.isStringVisible(stringPosition) &&
    isNoteWithinViewport &&
    (explore.isNotePositionVisible(noteIndex, stringPosition, fret) ||
      isCurrentlySelectedHiddenNote)
  );
};

const isPlaybackHighlightedNote = (noteIndex, fret, stringPosition) =>
  explore.currentWorkspaceMode === "focus" &&
  explore.playbackEnabled &&
  isNoteRenderedAtPosition(noteIndex, fret, stringPosition) &&
  explore.getDisplayColor(noteIndex) !== "bg-zinc-600";

const getNoteVisibilityClass = (noteIndex, fret, stringPosition) => {
  if (isNoteRenderedAtPosition(noteIndex, fret, stringPosition)) {
    if (isFinderNoteSelected(stringPosition, fret)) {
      return "opacity-100";
    }

    return isPlaybackHighlightedNote(noteIndex, fret, stringPosition)
      ? "opacity-[0.85]"
      : "opacity-100";
  }

  if (explore.currentWorkspaceMode !== "focus") {
    return "opacity-0 pointer-events-none";
  }

  if (isNotePositionWithinFilterRanges(stringPosition, fret)) {
    return "opacity-0";
  }

  return "opacity-0";
};

const getNoteInteractionClass = (noteIndex, fret, stringPosition) => {
  if (explore.currentWorkspaceMode !== "focus") {
    return "";
  }

  if (!explore.playbackEnabled) {
    if (!isNotePositionWithinFilterRanges(stringPosition, fret)) {
      return "pointer-events-none";
    }

    return "cursor-pointer hover:opacity-[0.85]";
  }

  return isNoteRenderedAtPosition(noteIndex, fret, stringPosition)
    ? "cursor-pointer hover:opacity-100"
    : "cursor-pointer hover:opacity-[0.42]";
};

const getNoteSurfaceClass = (noteIndex, fret, stringPosition) => {
  if (isFinderNoteSelected(stringPosition, fret)) {
    return "border-slate-950/90 bg-cyan-100 shadow-[0_10px_22px_rgba(34,211,238,0.12)]";
  }

  return `${explore.getDisplayColor(noteIndex)} border-gray-100`;
};

const getNoteLabelClass = (
  stringPosition,
  fret,
  inactiveClass = "text-gray-100",
) =>
  isFinderNoteSelected(stringPosition, fret) ? "text-zinc-950" : inactiveClass;

const getNoteScaleClass = (stringPosition, fret) =>
  isFinderNoteSelected(stringPosition, fret) ? "scale-[0.94]" : "scale-100";

const handleNoteClick = (stringPosition, fret) => {
  if (explore.currentWorkspaceMode !== "focus") {
    return;
  }

  const noteDetails = instrument.getNoteDetails(stringPosition, fret);

  if (explore.playbackEnabled) {
    void playback.toggleSelectedNote(noteDetails);
    return;
  }

  if (!isNotePositionWithinFilterRanges(stringPosition, fret)) {
    return;
  }

  explore.toggleNotePositionVisibility(
    noteDetails.noteIndex,
    stringPosition,
    fret,
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
              <p
                :class="[
                  'text-xs uppercase tracking-[0.2em]',
                  explore.playbackEnabled ? 'text-cyan-200' : 'text-gray-400',
                ]"
              >
                {{ explore.playbackEnabled ? "Finder" : "Filter" }}
              </p>
              <p
                :class="[
                  'mt-1 max-w-2xl text-xs leading-relaxed',
                  explore.playbackEnabled
                    ? 'text-cyan-100/85'
                    : 'text-gray-500',
                ]"
              >
                {{
                  explore.playbackEnabled
                    ? "Click notes on the fretboard to build a voicing one string at a time. Clicking the same note again removes it, and choosing a different fret on the same string replaces the previous note for that string. Every change restarts the full voicing in sync, so you always hear the exact shape you have selected. After the voicing is built, use Chord Analysis below to choose one of the selected notes as the root and switch the analysis from bass-relative intervals to a root-relative chord reading."
                    : "Click notes to hide or restore them on individual strings."
                }}
              </p>
              <p
                v-if="!explore.playbackEnabled"
                class="mt-2 max-w-2xl text-xs leading-relaxed text-amber-100/85"
              >
                Range sliders are the primary filter. Individual note toggles
                apply to notes inside the selected string and fret ranges, plus
                the visible open-string column when it stays pinned on-screen.
                Moving either slider resets all individual note toggles back to
                the default view. Viewport changes reset open-string toggles and
                clear any other toggles that move outside the managed area.
              </p>
            </div>

            <div class="flex items-stretch gap-3">
              <div
                v-if="!explore.playbackEnabled"
                class="flex min-w-48 self-center flex-col overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950/75 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              >
                <div
                  class="flex min-w-0 flex-col justify-center border-b border-zinc-700/80 px-3 py-2.5"
                >
                  <p
                    class="text-[11px] uppercase tracking-[0.2em] text-gray-300"
                  >
                    Reset Notes
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    Clear individual note toggles.
                  </p>
                </div>

                <div
                  class="flex flex-1 items-center justify-center px-3 py-2.5"
                >
                  <button
                    type="button"
                    class="w-full rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                    :class="
                      explore.hasNotePositionVisibilityOverrides
                        ? 'bg-zinc-100 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:bg-white'
                        : 'cursor-not-allowed bg-zinc-800 text-gray-500'
                    "
                    :disabled="!explore.hasNotePositionVisibilityOverrides"
                    @click="resetFilteredNotes"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div
                class="flex h-full min-w-48 flex-col overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950/75 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              >
                <div
                  class="flex min-w-0 flex-col justify-center border-b border-zinc-700/80 px-3 py-2.5"
                >
                  <p
                    class="text-[11px] uppercase tracking-[0.2em] text-sky-200"
                  >
                    Explore Mode
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    {{
                      explore.playbackEnabled
                        ? "Finder mode active"
                        : "Filter mode active"
                    }}
                  </p>
                </div>

                <div
                  class="flex flex-1 items-center justify-center px-3 py-2.5"
                >
                  <div
                    class="inline-flex w-full rounded-xl border border-zinc-700/90 bg-zinc-900/90 p-1"
                    role="group"
                    aria-label="Explore interaction mode"
                  >
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
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
                      class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                      :class="
                        explore.playbackEnabled
                          ? 'bg-sky-300 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                          : 'text-gray-300 hover:bg-zinc-800 hover:text-gray-100'
                      "
                      :aria-pressed="explore.playbackEnabled"
                      @click="setPlaybackMode(true)"
                    >
                      Finder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-if="explore.playbackEnabled">
          <div
            class="col-span-2 min-w-0 overflow-hidden border-x border-b border-zinc-500/85 bg-zinc-900/90 backdrop-blur-md"
          >
            <PlaybackOptionsPanel />
          </div>
        </template>

        <template v-else>
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
            class="relative z-10 min-w-0 overflow-visible border-r border-b border-zinc-500/85 bg-zinc-900/90 backdrop-blur-md"
          >
            <ExploreFretRangeFilter
              class="min-w-0 flex-1"
              :min-fret="visibleFretBounds.minFret"
              :max-fret="visibleFretBounds.maxFret"
              :start-fret="explore.visibleFretRangeStart"
              :end-fret="explore.visibleFretRangeEnd"
              :allow-open-string-start="showOpenStringMarkers"
              :marker-frets="instrument.fretboardMarkers"
              :leading-spacer-count="fretFilterLeadingSpacerCount"
              @update-fret-range="updateVisibleFretRange"
            />
          </div>
        </template>
      </template>

      <div
        :class="[
          'min-w-0',
          explore.currentWorkspaceMode === 'focus' ? 'col-span-2' : '',
        ]"
      >
        <div
          :class="[
            'min-w-0 overflow-hidden',
            explore.currentWorkspaceMode === 'focus'
              ? 'border-x border-b border-zinc-500/85 bg-zinc-900/72'
              : '',
          ]"
        >
          <div
            v-if="showPlaybackViewportIndicators"
            class="pointer-events-none flex items-center gap-3 border-b border-zinc-700/70 px-3 py-2"
            aria-hidden="true"
          >
            <div
              :class="[
                'flex size-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow] duration-150',
                getPlaybackViewportIndicatorClass(
                  hasPlaybackNotesBeforeFretView,
                ),
              ]"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14 6l-6 6 6 6"
                />
              </svg>
            </div>

            <div class="min-w-0 flex-1 text-center">
              <p
                :class="[
                  'text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors duration-150',
                  getPlaybackViewportIndicatorTitleClass(),
                ]"
              >
                Selected Outside Visible Frets
              </p>
              <p
                :class="[
                  'mt-0.5 text-[10px] transition-colors duration-150',
                  getPlaybackViewportIndicatorSubtitleClass(),
                ]"
              >
                Left and right markers show selected notes beyond the current
                view.
              </p>
            </div>

            <div
              :class="[
                'flex size-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow] duration-150',
                getPlaybackViewportIndicatorClass(
                  hasPlaybackNotesAfterFretView,
                ),
              ]"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 6l6 6-6 6"
                />
              </svg>
            </div>
          </div>

          <div class="z-0 flex w-full min-w-0">
            <div
              v-if="
                explore.currentWorkspaceMode === 'focus' &&
                !explore.playbackEnabled
              "
              class="shrink-0 border-r border-t-0 border-zinc-700/70 bg-zinc-900/62"
            >
              <div class="h-full w-24">
                <ExploreStringRangeFilter
                  :min-string="visibleStringBounds.minString"
                  :max-string="visibleStringBounds.maxString"
                  :start-string="explore.visibleStringRangeStart"
                  :end-string="explore.visibleStringRangeEnd"
                  :string-markers="stringMarkers"
                  @update-string-range="updateVisibleStringRange"
                />
              </div>
            </div>

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
                      'absolute -top-5 flex size-11 items-center justify-center rounded-full border-2 transition-[opacity,transform,box-shadow,background-color,border-color,color] duration-150',
                      getOpenStringBubblePositionClass(),
                      getNoteSurfaceClass(row.noteIndex, 0, row.position),
                      getNoteVisibilityClass(row.noteIndex, 0, row.position),
                      getNoteInteractionClass(row.noteIndex, 0, row.position),
                      getNoteScaleClass(row.position, 0),
                    ]"
                    :aria-hidden="
                      !isNoteRenderedAtPosition(row.noteIndex, 0, row.position)
                    "
                    @click="handleNoteClick(row.position, 0)"
                  >
                    <p
                      :class="[
                        'text-sm font-semibold transition-colors duration-150',
                        getNoteLabelClass(row.position, 0, 'text-gray-50'),
                      ]"
                    >
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
                    instrument.fretboardMarkers.includes(n)
                      ? 'bg-amber-50'
                      : '',
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
                      'absolute -top-5 right-0.5 z-20 flex size-10 items-center justify-center rounded-full border-2 transition-[opacity,transform,box-shadow,background-color,border-color,color] duration-150',
                      getNoteSurfaceClass(
                        instrument.getNote(row.position, n),
                        n,
                        row.position,
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
                      getNoteScaleClass(row.position, n),
                    ]"
                    :aria-hidden="
                      !isNoteRenderedAtPosition(
                        instrument.getNote(row.position, n),
                        n,
                        row.position,
                      )
                    "
                    @click="handleNoteClick(row.position, n)"
                  >
                    <p
                      :class="[
                        'text-sm font-semibold transition-colors duration-150',
                        getNoteLabelClass(row.position, n),
                      ]"
                    >
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

          <div
            v-if="showPlaybackViewportIndicators"
            class="pointer-events-none flex items-center gap-3 border-t border-zinc-700/70 px-3 py-2"
            aria-hidden="true"
          >
            <div
              :class="[
                'flex size-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow] duration-150',
                getPlaybackViewportIndicatorClass(
                  hasPlaybackNotesBeforeFretView,
                ),
              ]"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14 6l-6 6 6 6"
                />
              </svg>
            </div>

            <div class="min-w-0 flex-1 text-center">
              <p
                :class="[
                  'text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors duration-150',
                  getPlaybackViewportIndicatorTitleClass(),
                ]"
              >
                Selected Outside Visible Frets
              </p>
              <p
                :class="[
                  'mt-0.5 text-[10px] transition-colors duration-150',
                  getPlaybackViewportIndicatorSubtitleClass(),
                ]"
              >
                Left and right markers show selected notes beyond the current
                view.
              </p>
            </div>

            <div
              :class="[
                'flex size-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow] duration-150',
                getPlaybackViewportIndicatorClass(
                  hasPlaybackNotesAfterFretView,
                ),
              ]"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 6l6 6-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
