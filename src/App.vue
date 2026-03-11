<script setup>
import { computed, ref } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import Navigation from "@/components/Navigation.vue";
import FooterComponent from "@/components/Footer.vue";
import InstrumentConfigurator from "@/components/InstrumentConfigurator.vue";
import ScaleBuilder from "@/components/ScaleBuilder.vue";
import FretboardDisplay from "@/components/FretboardDisplay.vue";
import FretboardControls from "@/components/FretboardControls.vue";

const fretboard = useFretboardStore();
const showFocusWarning = ref(false);

const canEnterFocus = computed(
  () =>
    fretboard.selectedNotes.length > 1 && fretboard.selectedRootNote !== null,
);

const handleFocusClick = () => {
  if (!canEnterFocus.value) {
    showFocusWarning.value = true;
  }
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

  <div class="flex flex-col items-center justify-center">
    <div class="bg-gray-950 z-10 p-3 rounded-2xl border-1 border-gray-400 mt-2">
      <div class="bg-zinc-700 rounded-2xl text-2xl">
        <button
          class="text-gray-50 p-1 rounded-xl w-3xs bg-rose-700 hover:cursor-pointer"
        >
          Config
        </button>
        <button
          @click="handleFocusClick"
          class="text-gray-50 p-1 rounded-xl w-3xs bg-zinc-700 hover:cursor-pointer"
        >
          Focus
        </button>
      </div>
      <h2 class="text-gray-50 text-3xl p-1 text-center">Config</h2>
      <p class="text-gray-50 pb-1 text-center">
        Define your instrument and define the base scale
      </p>
    </div>
    <div class="my-2 flex mx-5">
      <InstrumentConfigurator />
      <ScaleBuilder />
    </div>
  </div>
  <FretboardDisplay />
  <FretboardControls />
  <FooterComponent />
</template>
