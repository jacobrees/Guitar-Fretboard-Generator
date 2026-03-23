<script setup>
import { computed } from "vue";

import AxisRangeSlider from "./AxisRangeSlider.vue";

const props = defineProps({
  minFret: {
    type: Number,
    required: true,
  },
  maxFret: {
    type: Number,
    required: true,
  },
  startFret: {
    type: Number,
    required: true,
  },
  endFret: {
    type: Number,
    required: true,
  },
  allowOpenStringStart: {
    type: Boolean,
    default: false,
  },
  markerFrets: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update-fret-range"]);

const fretMarkers = computed(() => {
  const markerSet = new Set([
    props.minFret,
    props.maxFret,
    ...props.markerFrets.filter(
      (fret) => fret >= props.minFret && fret <= props.maxFret,
    ),
  ]);

  return Array.from(markerSet)
    .sort((left, right) => left - right)
    .map((fret) => ({
      value: fret,
      label: `${fret}`,
      isHighlighted: props.markerFrets.includes(fret),
    }));
});

const fretSummary = computed(() => {
  if (
    props.allowOpenStringStart &&
    props.startFret === 0 &&
    props.endFret === 0
  ) {
    return "Showing open strings only";
  }

  if (props.startFret === props.endFret) {
    return `Showing fret ${props.startFret}`;
  }

  if (props.allowOpenStringStart && props.startFret === 0) {
    return `Showing open strings to fret ${props.endFret}`;
  }

  return `Showing frets ${props.startFret}-${props.endFret}`;
});

const updateFretRange = ({ startValue, endValue }) => {
  emit("update-fret-range", {
    startFret: startValue,
    endFret: endValue,
  });
};
</script>

<template>
  <div class="h-full text-gray-100">
    <div class="border-b border-zinc-700/80 pb-4 pt-4">
      <AxisRangeSlider
        title="Frets Filter"
        :summary="fretSummary"
        :min-value="minFret"
        :max-value="maxFret"
        :start-value="startFret"
        :end-value="endFret"
        :markers="fretMarkers"
        start-aria-label="Visible fret range start"
        end-aria-label="Visible fret range end"
        @update-range="updateFretRange"
      />
    </div>
  </div>
</template>
