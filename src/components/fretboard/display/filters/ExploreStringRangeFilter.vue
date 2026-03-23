<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  minString: {
    type: Number,
    required: true,
  },
  maxString: {
    type: Number,
    required: true,
  },
  startString: {
    type: Number,
    required: true,
  },
  endString: {
    type: Number,
    required: true,
  },
  stringMarkers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update-string-range"]);

const trackRef = ref(null);
const activeHandle = ref(null);

const stringCount = computed(() => props.maxString - props.minString + 1);
const boardSectionCount = computed(() => stringCount.value + 1);

const getBoardPosition = (value) =>
  ((value - props.minString + 1) / boardSectionCount.value) * 100;

const normalizedMarkers = computed(() =>
  props.stringMarkers
    .filter(
      (marker) =>
        marker.value >= props.minString && marker.value <= props.maxString,
    )
    .sort((left, right) => left.value - right.value)
    .map((marker) => ({
      ...marker,
      position: getBoardPosition(marker.value),
    })),
);

const activeTrackStyle = computed(() => ({
  top: `${getBoardPosition(props.startString)}%`,
  bottom: `${100 - getBoardPosition(props.endString)}%`,
}));

const isOverlapping = computed(() => props.startString === props.endString);

const getMarkerStyle = (marker) => ({
  top: `${marker.position}%`,
  transform: "translateY(-50%)",
});

const getHandleStyle = (handle) => {
  const value = handle === "start" ? props.startString : props.endString;
  const overlapOffset =
    isOverlapping.value && handle === "start"
      ? "1.15rem"
      : isOverlapping.value
        ? "1.85rem"
        : "1.5rem";

  return {
    left: overlapOffset,
    top: `${getBoardPosition(value)}%`,
    transform: "translate(-50%, -50%)",
  };
};

const emitRange = (startString, endString) => {
  emit("update-string-range", {
    startString: Math.min(startString, endString),
    endString: Math.max(startString, endString),
  });
};

const getValueFromPointer = (clientY) => {
  const trackElement = trackRef.value;

  if (!trackElement) {
    return props.startString;
  }

  const { top, height } = trackElement.getBoundingClientRect();
  const clampedOffset = Math.min(Math.max(clientY - top, 0), height);
  const normalizedOffset =
    (clampedOffset / height) * boardSectionCount.value - 1;

  return Math.min(
    props.maxString,
    Math.max(props.minString, props.minString + Math.round(normalizedOffset)),
  );
};

const applyHandleValue = (handle, nextValue) => {
  if (handle === "start") {
    emitRange(Math.min(nextValue, props.endString), props.endString);
    return;
  }

  emitRange(props.startString, Math.max(nextValue, props.startString));
};

const handlePointerMove = (event) => {
  if (!activeHandle.value) {
    return;
  }

  event.preventDefault();
  applyHandleValue(activeHandle.value, getValueFromPointer(event.clientY));
};

const stopDragging = () => {
  activeHandle.value = null;

  if (typeof window === "undefined") {
    return;
  }

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", stopDragging);
};

const startDragging = (handle, event) => {
  event.preventDefault();
  activeHandle.value = handle;
  applyHandleValue(handle, getValueFromPointer(event.clientY));

  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", stopDragging);
};

const handleTrackPointerDown = (event) => {
  const targetValue = getValueFromPointer(event.clientY);
  const startDistance = Math.abs(targetValue - props.startString);
  const endDistance = Math.abs(targetValue - props.endString);
  const nearestHandle = startDistance <= endDistance ? "start" : "end";

  startDragging(nearestHandle, event);
};

onBeforeUnmount(() => {
  stopDragging();
});
</script>

<template>
  <div class="relative h-full w-full text-gray-100">
    <div
      ref="trackRef"
      class="absolute inset-0 select-none touch-none"
      @pointerdown="handleTrackPointerDown"
    >
      <div
        class="absolute inset-y-0 left-6 w-2 -translate-x-1/2 rounded-full bg-zinc-700/95"
      ></div>
      <div
        class="absolute left-6 w-2 -translate-x-1/2 rounded-full bg-rose-600 shadow-[0_0_18px_rgba(190,24,93,0.24)]"
        :style="activeTrackStyle"
      ></div>

      <div
        v-for="marker in normalizedMarkers"
        :key="`string-marker-${marker.value}`"
        class="absolute inset-x-0"
        :style="getMarkerStyle(marker)"
      >
        <div
          class="absolute left-6 right-0 top-1/2 h-px -translate-y-1/2 bg-zinc-700/60"
        ></div>
        <div
          class="absolute left-6 top-1/2 h-px w-3 -translate-x-1/2 bg-amber-100/70"
        ></div>
        <span
          class="absolute left-10 top-1/2 min-w-[1.6rem] -translate-y-1/2 rounded-md border border-amber-100/70 bg-amber-50/95 px-1.5 py-0.5 text-center text-[10px] font-semibold text-zinc-900 shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
        >
          {{ marker.label }}
        </span>
      </div>

      <button
        type="button"
        class="absolute z-30 size-5 cursor-grab rounded-full border-2 border-rose-100 bg-rose-700 shadow-[0_10px_24px_rgba(0,0,0,0.35)] active:cursor-grabbing"
        :style="getHandleStyle('start')"
        aria-label="Visible string range start"
        @pointerdown.stop="startDragging('start', $event)"
      ></button>

      <button
        type="button"
        class="absolute z-30 size-5 cursor-grab rounded-full border-2 border-rose-100 bg-rose-700 shadow-[0_10px_24px_rgba(0,0,0,0.35)] active:cursor-grabbing"
        :style="getHandleStyle('end')"
        aria-label="Visible string range end"
        @pointerdown.stop="startDragging('end', $event)"
      ></button>
    </div>
  </div>
</template>
