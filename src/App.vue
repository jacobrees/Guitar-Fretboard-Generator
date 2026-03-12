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

const canEnterFocus = computed(
  () =>
    fretboard.selectedNotes.length > 1 && fretboard.selectedRootNote !== null,
);

const modeTitle = computed(() =>
  activeMode.value === "focus" ? "Focus" : "Config",
);

const modeDescription = computed(() =>
  activeMode.value === "focus"
    ? "Explore intervalic relationships across the fretboard"
    : "Define your instrument and define the base scale",
);

watch(
  () => fretboard.selectedRootNote,
  (nextRoot, previousRoot) => {
    if (nextRoot !== null && previousRoot === null) {
      showFocusPrompt.value = true;
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
        <p class="mt-3 text-center text-[17px]">
          Configure Note Mapping and choose a root note inside Interval Engine
          before continuing into Focus mode.
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
        <p class="mt-3 text-center text-[17px]">
          Thank you for configuring Scale Builder. Head to &apos;Focus&apos;
          mode to explore intervalic relationships inside and outside the
          selected notes.
        </p>
        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <button
            @click="goToFocus"
            class="cursor-pointer rounded-xl bg-rose-700 px-6 py-2 text-gray-50 hover:bg-rose-800"
          >
            Go to Focus
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

  <div class="flex flex-col items-center justify-center">
    <div class="bg-gray-950 z-10 p-3 rounded-2xl border-1 border-gray-400 mt-2">
      <div class="bg-zinc-700 rounded-2xl text-2xl">
        <button
          @click="goToConfig"
          :class="[
            'text-gray-50 p-1 rounded-xl w-3xs hover:cursor-pointer',
            activeMode === 'config' ? 'bg-rose-700' : 'bg-zinc-700',
          ]"
        >
          Config
        </button>
        <button
          @click="handleFocusClick"
          :class="[
            'text-gray-50 p-1 rounded-xl w-3xs hover:cursor-pointer',
            activeMode === 'focus' ? 'bg-rose-700' : 'bg-zinc-700',
          ]"
        >
          Focus
        </button>
      </div>
      <h2 class="text-gray-50 text-3xl p-1 text-center">{{ modeTitle }}</h2>
      <p class="text-gray-50 pb-1 text-center">
        {{ modeDescription }}
      </p>
    </div>
    <div v-if="activeMode === 'config'" class="my-2 flex mx-5">
      <InstrumentConfigurator />
      <ScaleBuilder />
    </div>
  </div>
  <FretboardDisplay />
  <FretboardControls />
  <FooterComponent />
</template>
