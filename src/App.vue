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

const handleFocusClick = () => {
  if (!canEnterFocus.value) {
    showFocusWarning.value = true;
    return;
  }

  activeMode.value = "focus";
};

const goToConfig = () => {
  activeMode.value = "config";
};

const goToFocus = () => {
  showFocusPrompt.value = false;
  activeMode.value = "focus";
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
            class="rounded-xl border border-gray-600 bg-zinc-900 px-3 py-3 text-center"
          >
            <p class="text-xl font-semibold">{{ interval.label }}</p>
            <p class="mt-1 text-sm text-gray-300">{{ interval.name }}</p>
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
        <div class="rounded-2xl bg-zinc-700 p-4">
          <h3 class="text-center text-3xl">Focus Summary</h3>

          <p class="mt-3 text-center text-lg">
            <span class="font-semibold">Scale Name:</span>
            {{ fretboard.selectedScaleSummary.name }}
          </p>

          <p class="mt-2 text-center text-lg">
            <span class="font-semibold">Interval Formula:</span>
            {{ fretboard.selectedScaleSummary.formula }}
          </p>

          <div class="mt-4 flex justify-center">
            <button
              @click="showIntervalHelper = true"
              class="cursor-pointer rounded-xl bg-zinc-900 px-5 py-3 text-base font-semibold text-gray-50 transition hover:bg-zinc-950"
            >
              Open Interval Formula Helper
            </button>
          </div>

          <p
            v-if="!fretboard.selectedScaleSummary.isKnownScale"
            class="mt-4 text-center text-sm text-gray-300"
          >
            This selection is shown as a custom note collection because it does
            not exactly match one of the seven diatonic modes.
          </p>
        </div>
      </div>
    </div>

    <FretboardDisplay />

    <div v-if="activeMode === 'config'" class="my-2 flex mx-5">
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
                  class="flex min-w-9 items-center justify-center rounded-lg border border-gray-300 bg-zinc-800 px-2 py-1.5 text-lg font-semibold shadow-sm shadow-black/20"
                >
                  {{ interval.label }}
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl border border-rose-400/45 bg-zinc-900 p-4 shadow-lg shadow-rose-950/25 lg:col-span-3"
            >
              <div
                class="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-6"
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
