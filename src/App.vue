<script setup>
import { computed, ref, watch } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import Navigation from "@/components/Navigation.vue";
import FooterComponent from "@/components/Footer.vue";
import InstrumentConfigurator from "@/components/InstrumentConfigurator.vue";
import ScaleBuilder from "@/components/ScaleBuilder.vue";
import FretboardDisplay from "@/components/FretboardDisplay.vue";
import FretboardControls from "@/components/FretboardControls.vue";

const fretboard = useFretboardStore();
const activeMode = ref("config");
const showFocusWarning = ref(false);
const showFocusPrompt = ref(false);
const showIntervalHelper = ref(false);
const hasShownFocusPrompt = ref(false);
const activeIntervalPalette = ref(null);

const canEnterFocus = computed(
  () =>
    fretboard.selectedNotes.length > 1 && fretboard.selectedRootNote !== null,
);

const modeTitle = computed(() =>
  activeMode.value === "focus" ? "Explore Fretboard" : "Configure Guitar",
);

const modeDescription = computed(() =>
  activeMode.value === "focus"
    ? "Explore interval relationships and note placement across the fretboard"
    : "Set your instrument, map the scale, and choose the root",
);

const selectedIntervalLabels = computed(
  () =>
    fretboard.selectedScaleSummary?.intervals.map(({ label }) => label) ?? [],
);

const noteNamingPreview = computed(() =>
  fretboard.sharpsEnabled
    ? ["A#", "C#", "D#", "F#", "G#"]
    : ["B♭", "D♭", "E♭", "G♭", "A♭"],
);

const intervalHighlightRows = computed(() => fretboard.chromaticIntervalRows);

const activeIntervalHighlight = computed(
  () =>
    fretboard.chromaticIntervalRows.find(
      (interval) => interval.semitones === activeIntervalPalette.value,
    ) ?? null,
);

const isSelectedInterval = (legendLabel) =>
  legendLabel
    .split("/")
    .map((label) => label.trim())
    .some((label) => selectedIntervalLabels.value.includes(label));

watch(
  () => fretboard.selectedRootNote,
  (nextRoot, previousRoot) => {
    if (
      nextRoot !== null &&
      previousRoot === null &&
      !hasShownFocusPrompt.value
    ) {
      showFocusPrompt.value = true;
      hasShownFocusPrompt.value = true;
    }
  },
);

watch(
  activeMode,
  (mode) => {
    fretboard.setWorkspaceMode(mode);
  },
  { immediate: true },
);

const handleFocusClick = () => {
  if (!canEnterFocus.value) {
    showFocusWarning.value = true;
    return;
  }

  activeMode.value = "focus";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goToConfig = () => {
  activeMode.value = "config";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goToFocus = () => {
  showFocusPrompt.value = false;
  activeMode.value = "focus";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const toggleIntervalPalette = (semitones) => {
  activeIntervalPalette.value =
    activeIntervalPalette.value === semitones ? null : semitones;
};

const setIntervalHighlightColor = (semitones, colorClass) => {
  fretboard.setExploreIntervalColor(semitones, colorClass);
  activeIntervalPalette.value = null;
};

const clearIntervalHighlightColor = (semitones) => {
  fretboard.clearExploreIntervalColor(semitones);
  activeIntervalPalette.value = null;
};

const formatPaletteName = (colorName) =>
  colorName.charAt(0).toUpperCase() + colorName.slice(1);

const getExploreIntervalColorName = (semitones) => {
  const activeColor = fretboard.getExploreIntervalColor(semitones);

  if (!activeColor) {
    return "None";
  }

  const paletteEntry = Object.entries(fretboard.paletteColors).find(
    ([, colorClass]) => colorClass === activeColor,
  );

  return paletteEntry ? formatPaletteName(paletteEntry[0]) : "Custom";
};
</script>

<template>
  <Navigation />

  <div
    v-if="showFocusWarning"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-gray-400 bg-gray-950 p-4 text-gray-50 shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-4">
        <h3 class="text-center text-3xl">Focus Locked</h3>
        <p class="mt-3 text-center text-lg">
          Configure the guitar, map your notes, and choose a root inside
          Interval Engine before continuing into Explore Fretboard.
        </p>
        <div class="mt-4 flex justify-center">
          <button
            @click="showFocusWarning = false"
            class="cursor-pointer rounded-xl bg-rose-700 px-6 py-2 text-gray-50 hover:bg-rose-800"
          >
            Back to Config
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="activeIntervalHighlight"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
    @click.self="activeIntervalPalette = null"
  >
    <div
      class="w-full max-w-xl rounded-2xl border border-gray-400 bg-gray-950 p-4 text-gray-50 shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <div
          class="flex items-start justify-between gap-4 border-b border-gray-500 pb-4"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200"
            >
              Interval Color
            </p>
            <h4 class="mt-2 text-3xl font-semibold">
              {{ activeIntervalHighlight.name }}
            </h4>
            <p class="mt-2 text-base font-semibold text-gray-200">
              {{ activeIntervalHighlight.label }}
            </p>
            <p class="mt-1 text-sm text-gray-400">
              Root-relative note: {{ activeIntervalHighlight.note }}
            </p>
          </div>

          <button
            @click="activeIntervalPalette = null"
            class="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-gray-50 transition hover:bg-zinc-950"
          >
            Close
          </button>
        </div>

        <div class="mt-5 rounded-2xl border border-gray-500 bg-zinc-900 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p
                class="text-sm font-semibold uppercase tracking-wide text-gray-400"
              >
                Palette
              </p>
              <p class="mt-2 text-sm text-gray-300">
                Pick a highlight color for this interval.
              </p>
            </div>

            <div
              class="flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-linear-to-b from-zinc-800 to-zinc-900 px-3 py-2"
            >
              <div
                :class="[
                  'flex h-14 w-12 items-center justify-center rounded-xl border text-lg font-semibold text-gray-50 shadow-lg shadow-black/30',
                  fretboard.getExploreIntervalColor(
                    activeIntervalHighlight.semitones,
                  ) ?? 'bg-zinc-950',
                  activeIntervalHighlight.isInScale
                    ? 'border-rose-300/35'
                    : 'border-gray-500',
                ]"
              >
                {{ activeIntervalHighlight.label }}
              </div>

              <div class="text-right">
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                  Current
                </p>
                <p class="mt-1 text-sm font-semibold text-gray-100">
                  {{
                    getExploreIntervalColorName(
                      activeIntervalHighlight.semitones,
                    )
                  }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-3">
              <button
                v-for="(colorClass, colorName) in fretboard.paletteColors"
                :key="`modal-${activeIntervalHighlight.semitones}-${colorName}`"
                @click="
                  setIntervalHighlightColor(
                    activeIntervalHighlight.semitones,
                    colorClass,
                  )
                "
                :class="[
                  'cursor-pointer rounded-2xl border p-3 text-center transition hover:-translate-y-0.5 hover:border-gray-300',
                  fretboard.getExploreIntervalColor(
                    activeIntervalHighlight.semitones,
                  ) === colorClass
                    ? 'border-white bg-zinc-800 shadow-lg shadow-black/30'
                    : 'border-gray-600 bg-zinc-800/80',
                ]"
                :aria-label="`Set ${activeIntervalHighlight.label} to ${colorName}`"
              >
                <div
                  :class="[
                    'mx-auto size-11 rounded-full border-2',
                    colorClass,
                    fretboard.getExploreIntervalColor(
                      activeIntervalHighlight.semitones,
                    ) === colorClass
                      ? 'border-white'
                      : 'border-transparent',
                  ]"
                ></div>
                <p class="mt-2 text-sm font-semibold text-gray-100">
                  {{ formatPaletteName(colorName) }}
                </p>
              </button>
            </div>

            <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                @click="
                  clearIntervalHighlightColor(activeIntervalHighlight.semitones)
                "
                class="cursor-pointer rounded-xl border border-gray-500 bg-zinc-950 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-gray-100 transition hover:border-gray-300 hover:bg-zinc-900"
              >
                Clear Highlight
              </button>

              <button
                @click="activeIntervalPalette = null"
                class="cursor-pointer rounded-xl bg-rose-700 px-5 py-2 text-sm font-semibold text-gray-50 transition hover:bg-rose-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showFocusPrompt"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
  >
    <div
      class="w-full max-w-xl rounded-2xl border border-gray-400 bg-gray-950 p-4 text-gray-50 shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <h3 class="text-center text-3xl">Interval Engine Ready</h3>
        <p class="mt-3 text-center text-lg">
          Your note mapping lines up with
          <span class="font-semibold">
            {{
              fretboard.selectedScaleSummary?.modeName ?? "a custom selection"
            }},
          </span>
          head to Explore Fretboard to see how those intervals behave across the
          neck.
        </p>
        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <button
            @click="goToFocus"
            class="cursor-pointer rounded-xl bg-rose-700 px-6 py-2 text-gray-50 hover:bg-rose-800"
          >
            Explore Fretboard
          </button>
          <button
            @click="showFocusPrompt = false"
            class="cursor-pointer rounded-xl bg-zinc-900 px-6 py-2 text-gray-50 hover:bg-zinc-800"
          >
            Back To Config
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showIntervalHelper"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
  >
    <div
      class="w-full max-w-3xl rounded-2xl border border-gray-400 bg-gray-950 p-4 text-gray-50 shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <div
          class="flex items-start justify-between gap-4 border-b border-gray-500 pb-4"
        >
          <div>
            <h3 class="text-3xl font-semibold">Interval Formula Helper</h3>
            <p
              class="mt-2 text-sm font-semibold uppercase tracking-wide text-rose-200"
            >
              {{
                fretboard.selectedScaleSummary?.modeName ?? "Custom Selection"
              }}
            </p>
            <p class="mt-2 text-base text-gray-200">
              Use this chromatic interval reference to decode the shorthand used
              in interval formulas.
            </p>
          </div>

          <button
            @click="showIntervalHelper = false"
            class="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2 text-gray-50 transition hover:bg-zinc-950"
          >
            Close
          </button>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="interval in fretboard.intervalLegend"
            :key="interval.label"
            :class="[
              'rounded-xl border px-3 py-3 text-center transition',
              isSelectedInterval(interval.label)
                ? 'border-rose-300 bg-rose-950/70 text-rose-50 shadow-lg shadow-rose-950/35'
                : 'border-gray-600 bg-zinc-900',
            ]"
          >
            <p class="text-xl font-semibold">{{ interval.label }}</p>
            <p
              :class="[
                'mt-1 text-sm',
                isSelectedInterval(interval.label)
                  ? 'text-rose-200'
                  : 'text-gray-300',
              ]"
            >
              {{ interval.name }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center justify-center">
    <div
      class="z-10 mt-2 w-full max-w-xl rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
    >
      <div class="rounded-2xl bg-zinc-700 p-4">
        <div class="border-b border-gray-500 pb-4 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-300"
          >
            Workspace
          </p>
          <h2 class="mt-1 text-3xl font-semibold">{{ modeTitle }}</h2>
          <p class="mt-2 text-base text-gray-200">
            {{ modeDescription }}
          </p>
        </div>

        <div class="mt-4 rounded-2xl bg-zinc-800 p-2">
          <div class="grid grid-cols-2 gap-2 text-lg">
            <button
              @click="goToConfig"
              :class="[
                'w-full rounded-xl px-4 py-2 font-semibold transition hover:cursor-pointer',
                activeMode === 'config'
                  ? 'bg-rose-700 text-gray-50'
                  : 'bg-zinc-900 text-gray-200 hover:bg-zinc-950',
              ]"
            >
              Configure Guitar
            </button>
            <button
              @click="handleFocusClick"
              :class="[
                'w-full rounded-xl px-4 py-2 font-semibold transition hover:cursor-pointer',
                activeMode === 'focus'
                  ? 'bg-rose-700 text-gray-50'
                  : 'bg-zinc-900 text-gray-200 hover:bg-zinc-950',
              ]"
            >
              Explore Fretboard
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="activeMode === 'focus' && fretboard.selectedScaleSummary"
      class="my-2 mx-5 w-full max-w-screen-2xl"
    >
      <div
        class="rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
      >
        <div class="rounded-2xl bg-zinc-700 p-5">
          <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div class="rounded-2xl border border-gray-500 bg-zinc-900 p-4">
              <div class="border-b border-gray-500 pb-4 text-center">
                <h4 class="text-3xl font-semibold">
                  {{ fretboard.selectedScaleSummary.name }}
                </h4>
                <p class="mt-2 text-base text-gray-200">
                  Reference the detected scale and interval formula while
                  exploring the fretboard.
                </p>
              </div>

              <div
                class="mt-4 flex flex-col gap-3 rounded-2xl border border-gray-500 bg-zinc-800 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p
                    class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Explore View
                  </p>
                  <p class="mt-1 text-base text-gray-200">
                    Choose whether the fretboard speaks in note names or
                    interval relationships.
                  </p>
                </div>

                <div class="rounded-xl bg-zinc-900 p-1">
                  <div class="grid grid-cols-2 gap-1">
                    <button
                      @click="fretboard.setPreferredExploreLabelMode('notes')"
                      :class="[
                        'rounded-lg px-4 py-2 font-semibold transition',
                        fretboard.preferredExploreLabelMode === 'notes'
                          ? 'cursor-default bg-rose-700 text-gray-50'
                          : 'cursor-pointer text-gray-300 hover:bg-zinc-800 hover:text-gray-100',
                      ]"
                    >
                      Notes
                    </button>
                    <button
                      @click="
                        fretboard.setPreferredExploreLabelMode('intervals')
                      "
                      :class="[
                        'rounded-lg px-4 py-2 font-semibold transition',
                        fretboard.preferredExploreLabelMode === 'intervals'
                          ? 'cursor-default bg-rose-700 text-gray-50'
                          : 'cursor-pointer text-gray-300 hover:bg-zinc-800 hover:text-gray-100',
                      ]"
                    >
                      Intervals
                    </button>
                  </div>
                </div>
              </div>

              <div
                class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p
                    class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Interval Formula
                  </p>
                  <p class="mt-1 text-base text-gray-300">
                    These interval codes define the scale shape selected above.
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    Hover or focus an interval to reveal its note.
                  </p>
                </div>

                <button
                  @click="showIntervalHelper = true"
                  class="cursor-pointer rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-zinc-950"
                >
                  Open Formula Helper
                </button>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <div
                  v-for="interval in fretboard.selectedScaleSummary.intervals"
                  :key="`focus-formula-${interval.label}`"
                  class="group relative"
                >
                  <div
                    :title="`${interval.label}: ${interval.note}`"
                    :aria-label="`${interval.label} maps to ${interval.note}`"
                    tabindex="0"
                    class="flex min-w-9 cursor-help items-center justify-center rounded-lg border border-gray-300 bg-zinc-800 px-2 py-1.5 text-lg font-semibold shadow-sm shadow-black/20 transition hover:border-rose-300 hover:text-rose-100 focus:border-rose-300 focus:text-rose-100 focus:outline-none"
                  >
                    {{ interval.label }}
                  </div>

                  <div
                    class="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-500 bg-gray-950 px-3 py-1.5 text-sm font-medium text-gray-100 shadow-xl group-hover:block group-focus-within:block"
                  >
                    {{ interval.note }}
                  </div>
                </div>
              </div>

              <p
                v-if="!fretboard.selectedScaleSummary.isKnownScale"
                class="mt-4 text-sm text-gray-300"
              >
                This selection is shown as a custom note collection because it
                does not exactly match one of the seven diatonic modes.
              </p>
            </div>

            <div class="rounded-2xl border border-gray-500 bg-zinc-900 p-4">
              <div
                class="flex flex-col gap-3 border-b border-gray-500 pb-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <h4 class="text-2xl font-semibold">Interval Highlights</h4>
                  <p class="mt-2 text-sm text-gray-300">
                    Color interval roles across the fretboard without changing
                    your note selection.
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    Click a note chip to open the color palette.
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    @click="
                      fretboard.resetExploreIntervalHighlightsToScale();
                      activeIntervalPalette = null;
                    "
                    class="cursor-pointer rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-gray-50 transition hover:bg-rose-800"
                  >
                    Reset To Scale
                  </button>
                  <button
                    @click="
                      fretboard.clearAllExploreIntervalHighlights();
                      activeIntervalPalette = null;
                    "
                    class="cursor-pointer rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-zinc-950"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div
                class="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-700 bg-zinc-800/60 px-3 py-2"
              >
                <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Chromatic Order
                </p>
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-full border border-rose-400/35 bg-rose-950/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-100"
                  >
                    In Scale
                  </span>
                  <span class="text-xs text-gray-400"
                    >Default highlight: rose</span
                  >
                </div>
              </div>

              <div
                class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4"
              >
                <div
                  v-for="interval in intervalHighlightRows"
                  :key="`highlight-${interval.semitones}`"
                  :class="[
                    'rounded-2xl border p-3 transition',
                    interval.isInScale
                      ? 'border-rose-400/30 bg-linear-to-b from-zinc-800 to-zinc-900 shadow-lg shadow-rose-950/10'
                      : 'border-gray-700 bg-zinc-800/80',
                  ]"
                >
                  <div class="flex items-center justify-between gap-2">
                    <p
                      class="text-sm font-semibold uppercase tracking-wide text-gray-300"
                    >
                      {{ interval.note }}
                    </p>
                    <span
                      v-if="interval.isInScale"
                      class="rounded-full border border-rose-400/35 bg-rose-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-100"
                    >
                      Scale
                    </span>
                  </div>

                  <button
                    @click="toggleIntervalPalette(interval.semitones)"
                    :class="[
                      'mx-auto mt-3 block w-18 cursor-pointer rounded-xl border px-2 py-4 text-xl font-semibold text-gray-50 transition hover:scale-105',
                      fretboard.getExploreIntervalColor(interval.semitones) ??
                        'bg-zinc-950',
                      activeIntervalPalette === interval.semitones
                        ? 'border-white shadow-lg shadow-black/40'
                        : interval.isInScale
                          ? 'border-rose-300/35'
                          : 'border-gray-500',
                    ]"
                    :aria-label="`Edit ${interval.label} note color`"
                  >
                    {{ interval.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FretboardDisplay />

    <div
      v-if="activeMode === 'config'"
      class="my-2 mx-5 w-full max-w-screen-2xl"
    >
      <div
        class="rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
      >
        <div class="rounded-2xl bg-zinc-700 p-4">
          <div class="border-b border-gray-500 pb-4 text-center">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-gray-300"
            >
              Board Tools
            </p>
            <p class="mt-2 text-base text-gray-200">
              Set note naming and board orientation before dialing in the
              instrument and scale.
            </p>
          </div>

          <div class="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div
              class="rounded-2xl border border-rose-400/30 bg-linear-to-b from-zinc-800 to-zinc-900 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p
                    class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Note Naming
                  </p>
                  <p class="mt-2 text-sm text-gray-300">
                    Choose how accidentals are spelled while mapping notes.
                  </p>
                </div>

                <div
                  class="rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
                >
                  {{
                    fretboard.sharpsEnabled ? "Sharps Active" : "Flats Active"
                  }}
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <div
                  v-for="note in noteNamingPreview"
                  :key="note"
                  class="rounded-full border border-gray-500 bg-zinc-950 px-3 py-1.5 text-sm font-semibold text-gray-100"
                >
                  {{ note }}
                </div>
              </div>

              <button
                @click="fretboard.toggleSharpsEnabled"
                class="mt-4 w-full cursor-pointer rounded-xl bg-rose-700 px-5 py-3 text-base font-semibold text-gray-50 transition hover:bg-rose-800"
              >
                Switch To {{ fretboard.sharpsEnabled ? "Flats" : "Sharps" }}
              </button>
            </div>

            <div
              class="rounded-2xl border border-gray-500 bg-linear-to-b from-zinc-800 to-zinc-900 p-4"
            >
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p
                    class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Board Orientation
                  </p>
                  <p class="mt-2 text-sm text-gray-300">
                    Flip the fretboard to match the perspective you want while
                    building your scale.
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <div
                    class="rounded-full border border-gray-500 bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
                  >
                    {{
                      fretboard.verticalFlip
                        ? "String Order: Standard"
                        : "String Order: Reversed"
                    }}
                  </div>
                  <div
                    class="rounded-full border border-gray-500 bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200"
                  >
                    {{
                      fretboard.horizontalFlip
                        ? "Frets: Mirrored"
                        : "Frets: Standard"
                    }}
                  </div>
                </div>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  @click="fretboard.flipVertically"
                  class="cursor-pointer rounded-xl border border-rose-400/30 bg-zinc-900 px-5 py-4 text-left font-semibold text-gray-50 transition hover:border-rose-300 hover:bg-zinc-950"
                >
                  <span class="block text-base">Flip Vertically</span>
                  <span class="mt-1 block text-sm font-normal text-gray-300">
                    Reorder the strings from top to bottom.
                  </span>
                </button>
                <button
                  @click="fretboard.flipHorizontally"
                  class="cursor-pointer rounded-xl border border-rose-400/30 bg-zinc-900 px-5 py-4 text-left font-semibold text-gray-50 transition hover:border-rose-300 hover:bg-zinc-950"
                >
                  <span class="block text-base">Flip Horizontally</span>
                  <span class="mt-1 block text-sm font-normal text-gray-300">
                    Mirror the fret direction left to right.
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="activeMode === 'config'"
      class="my-2 mx-5 flex items-center gap-4"
    >
      <InstrumentConfigurator />
      <ScaleBuilder />
    </div>

    <div
      v-if="
        activeMode === 'config' &&
        fretboard.selectedRootNote !== null &&
        fretboard.selectedScaleSummary
      "
      class="mb-2 mx-5 w-full max-w-screen-2xl"
    >
      <div
        class="rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
      >
        <div class="rounded-2xl bg-zinc-700 p-5">
          <div class="border-b border-gray-500 pb-4 text-center">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-gray-300"
            >
              Scale Helper
            </p>
            <h4 class="mt-1 text-3xl font-semibold">
              {{ fretboard.selectedScaleSummary.name }}
            </h4>
            <p class="mt-2 text-base text-gray-200">
              Confirm the detected scale and interval formula before exploring
              the full fretboard view.
            </p>
          </div>

          <div class="mt-5 grid gap-4 lg:grid-cols-5">
            <div
              class="rounded-2xl border border-gray-500 bg-zinc-900 p-4 lg:col-span-2"
            >
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p
                    class="text-sm font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Interval Formula
                  </p>
                  <p class="mt-1 text-base text-gray-300">
                    These interval codes define the scale shape selected above.
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    Hover or focus an interval to reveal its note.
                  </p>
                </div>

                <button
                  @click="showIntervalHelper = true"
                  class="cursor-pointer rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-zinc-950"
                >
                  Open Formula Helper
                </button>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <div
                  v-for="interval in fretboard.selectedScaleSummary.intervals"
                  :key="`config-formula-${interval.label}`"
                  class="group relative"
                >
                  <div
                    :title="`${interval.label}: ${interval.note}`"
                    :aria-label="`${interval.label} maps to ${interval.note}`"
                    tabindex="0"
                    class="flex min-w-9 cursor-help items-center justify-center rounded-lg border border-gray-300 bg-zinc-800 px-2 py-1.5 text-lg font-semibold shadow-sm shadow-black/20 transition hover:border-rose-300 hover:text-rose-100 focus:border-rose-300 focus:text-rose-100 focus:outline-none"
                  >
                    {{ interval.label }}
                  </div>

                  <div
                    class="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-500 bg-gray-950 px-3 py-1.5 text-sm font-medium text-gray-100 shadow-xl group-hover:block group-focus-within:block"
                  >
                    {{ interval.note }}
                  </div>
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl border border-rose-400/45 bg-zinc-900 p-4 shadow-lg shadow-rose-950/25 lg:col-span-3"
            >
              <div
                class="flex h-full flex-col justify-between rounded-2xl bg-linear-to-b from-zinc-800 to-zinc-900 p-6"
              >
                <div class="text-center">
                  <p
                    class="text-base font-semibold uppercase tracking-wide text-rose-300"
                  >
                    Next Step
                  </p>
                  <p class="mt-3 text-3xl font-semibold text-gray-100">
                    Explore this scale on the fretboard.
                  </p>
                  <p class="mt-3 text-base text-gray-300">
                    Switch modes to inspect interval relationships and note
                    placement across the neck.
                  </p>
                </div>

                <button
                  @click="goToFocus"
                  class="mt-6 cursor-pointer rounded-xl bg-rose-700 px-8 py-4 text-2xl font-semibold text-gray-50 transition hover:bg-rose-800"
                >
                  Explore Fretboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FretboardControls v-if="activeMode === 'focus'" />
  <FooterComponent />
</template>
