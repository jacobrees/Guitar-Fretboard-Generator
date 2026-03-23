<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  minValue: {
    type: Number,
    required: true,
  },
  maxValue: {
    type: Number,
    required: true,
  },
  startValue: {
    type: Number,
    required: true,
  },
  endValue: {
    type: Number,
    required: true,
  },
  markers: {
    type: Array,
    default: () => [],
  },
  startAriaLabel: {
    type: String,
    default: "Range start",
  },
  endAriaLabel: {
    type: String,
    default: "Range end",
  },
});

const emit = defineEmits(["update-range"]);
const activeHandle = ref("end");
const trackRef = ref(null);
const draggingHandle = ref(null);

const valueCount = computed(() => props.maxValue - props.minValue + 1);

const getMarkerPosition = (value) =>
  ((value - props.minValue + 0.5) / valueCount.value) * 100;

const getHandlePosition = (value) => getMarkerPosition(value);

const sliderRailStyle = computed(() => ({
  left: "0%",
  right: "0%",
}));

const activeTrackStyle = computed(() => ({
  left: `${getHandlePosition(props.startValue)}%`,
  right: `${100 - getHandlePosition(props.endValue)}%`,
}));

const normalizedMarkers = computed(() =>
  props.markers
    .filter(
      (marker) =>
        marker.value >= props.minValue && marker.value <= props.maxValue,
    )
    .sort((left, right) => left.value - right.value)
    .map((marker) => ({
      ...marker,
      position: `${getMarkerPosition(marker.value)}%`,
    })),
);

const isOverlapping = computed(() => props.startValue === props.endValue);

const emitRange = (nextStartValue, nextEndValue) => {
  emit("update-range", {
    startValue: Math.min(nextStartValue, nextEndValue),
    endValue: Math.max(nextStartValue, nextEndValue),
  });
};

const applyHandleValue = (handle, nextValue) => {
  if (handle === "start") {
    emitRange(Math.min(nextValue, props.endValue), props.endValue);
    return;
  }

  emitRange(props.startValue, Math.max(nextValue, props.startValue));
};

const getValueFromPointer = (clientX) => {
  const trackElement = trackRef.value;

  if (!trackElement) {
    return props.startValue;
  }

  const { left, width } = trackElement.getBoundingClientRect();
  const normalized = Math.min(Math.max((clientX - left) / width, 0), 1);
  const noteStep = Math.min(
    valueCount.value,
    Math.max(1, Math.round(normalized * valueCount.value)),
  );

  return props.minValue + noteStep - 1;
};

const handlePointerMove = (event) => {
  if (!draggingHandle.value) {
    return;
  }

  event.preventDefault();
  applyHandleValue(draggingHandle.value, getValueFromPointer(event.clientX));
};

const stopDragging = () => {
  draggingHandle.value = null;

  if (typeof window === "undefined") {
    return;
  }

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", stopDragging);
};

const startDragging = (handle, event) => {
  event.preventDefault();
  activeHandle.value = handle;
  draggingHandle.value = handle;
  applyHandleValue(handle, getValueFromPointer(event.clientX));

  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", stopDragging);
};

const handleTrackPointerDown = (event) => {
  const targetValue = getValueFromPointer(event.clientX);
  const startDistance = Math.abs(targetValue - props.startValue);
  const endDistance = Math.abs(targetValue - props.endValue);
  const nearestHandle = startDistance <= endDistance ? "start" : "end";

  startDragging(nearestHandle, event);
};

const setActiveHandle = (handle) => {
  activeHandle.value = handle;
};

const nudgeHandle = (handle, delta) => {
  const currentValue = handle === "start" ? props.startValue : props.endValue;
  const nextValue = Math.min(
    props.maxValue,
    Math.max(props.minValue, currentValue + delta),
  );

  applyHandleValue(handle, nextValue);
};

const handleHandleKeydown = (handle, event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();
    setActiveHandle(handle);
    nudgeHandle(handle, -1);
  }

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();
    setActiveHandle(handle);
    nudgeHandle(handle, 1);
  }
};

const getHandleStyle = (handle) => {
  const value = handle === "start" ? props.startValue : props.endValue;
  const overlapTransform = !isOverlapping.value
    ? "translate(-50%, -50%)"
    : handle === "start"
      ? "translate(-50%, calc(-50% - 0.65rem))"
      : "translate(-50%, calc(-50% + 0.65rem))";

  return {
    left: `${getHandlePosition(value)}%`,
    top: "50%",
    transform: overlapTransform,
  };
};

onBeforeUnmount(() => {
  stopDragging();
});
</script>

<template>
  <div>
    <div class="px-4">
      <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
        {{ title }}
      </p>
      <p class="mt-1 text-xs text-gray-500">{{ summary }}</p>
    </div>

    <div
      ref="trackRef"
      class="relative mt-2 pb-1 pt-5 select-none [touch-action:none]"
      @pointerdown="handleTrackPointerDown"
    >
      <div
        v-for="marker in normalizedMarkers"
        :key="`${title}-marker-${marker.value}`"
        class="absolute top-0 flex -translate-x-1/2 flex-col items-center"
        :style="{ left: marker.position }"
      >
        <span
          :class="[
            'rounded-md px-2 py-0.5 text-[11px] font-semibold',
            marker.isHighlighted
              ? 'border border-amber-200 bg-amber-50 text-zinc-900'
              : 'text-gray-500',
          ]"
        >
          {{ marker.label }}
        </span>
      </div>

      <div class="relative h-10">
        <div
          v-for="marker in normalizedMarkers"
          :key="`${title}-tick-${marker.value}`"
          class="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          :style="{ left: marker.position }"
        >
          <div
            :class="[
              'rounded-full',
              marker.isHighlighted
                ? 'h-5 w-1 bg-amber-50'
                : 'h-4 w-px bg-gray-600',
            ]"
          ></div>
        </div>

        <div
          class="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-zinc-700/95"
          :style="sliderRailStyle"
        ></div>
        <div
          class="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-rose-600 shadow-[0_0_18px_rgba(190,24,93,0.22)]"
          :style="activeTrackStyle"
        ></div>

        <button
          type="button"
          class="absolute z-30 h-7 w-7 rounded-full border-2 border-rose-100 bg-rose-700 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition focus:outline-none focus:ring-2 focus:ring-rose-200/70"
          :class="activeHandle === 'start' ? 'z-30' : 'z-20'"
          :style="getHandleStyle('start')"
          :aria-label="startAriaLabel"
          @focus="setActiveHandle('start')"
          @keydown="handleHandleKeydown('start', $event)"
          @pointerdown.stop="startDragging('start', $event)"
        ></button>

        <button
          type="button"
          class="absolute z-30 h-7 w-7 rounded-full border-2 border-rose-100 bg-rose-700 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition focus:outline-none focus:ring-2 focus:ring-rose-200/70"
          :class="activeHandle === 'end' ? 'z-30' : 'z-20'"
          :style="getHandleStyle('end')"
          :aria-label="endAriaLabel"
          @focus="setActiveHandle('end')"
          @keydown="handleHandleKeydown('end', $event)"
          @pointerdown.stop="startDragging('end', $event)"
        ></button>
      </div>
    </div>
  </div>
</template>
