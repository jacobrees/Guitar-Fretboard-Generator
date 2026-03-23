<script setup>
import InstrumentConfigurator from "@/components/config/InstrumentConfigurator.vue";
import ScaleBuilder from "@/components/config/ScaleBuilder.vue";

const emit = defineEmits(["open-interval-helper", "go-to-focus"]);
</script>

<template>
  <div class="mt-4 mb-10 mx-5 flex items-start gap-4">
    <InstrumentConfigurator />
    <ScaleBuilder
      @open-interval-helper="emit('open-interval-helper')"
      @go-to-focus="emit('go-to-focus')"
    />
  </div>
</template>
