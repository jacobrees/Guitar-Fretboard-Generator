<script setup>
import Navigation from "@/components/Navigation.vue";
import FooterComponent from "@/components/Footer.vue";
import InstrumentConfigurator from "@/components/InstrumentConfigurator.vue";
import ScaleBuilder from "@/components/ScaleBuilder.vue";
import FretboardDisplay from "@/components/FretboardDisplay.vue";
import FretboardControls from "@/components/FretboardControls.vue";
</script>

<template>
  <Navigation />

  <div class="flex flex-col items-center justify-center">
    <div class="bg-gray-950 z-10 p-3 rounded-2xl border-1 border-gray-400 mt-2">
      <div class="bg-zinc-700 rounded-2xl text-2xl">
        <button
          class="text-gray-50 p-1 rounded-xl w-3xs bg-rose-700 hover:cursor-pointer"
        >
          Config
        </button>
        <button
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
