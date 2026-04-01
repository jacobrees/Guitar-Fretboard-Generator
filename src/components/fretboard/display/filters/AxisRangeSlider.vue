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
  leadingSpacerCount: {
    type: Number,
    default: 0,
  },
  trailingSpacerCount: {
    type: Number,
    default: 0,
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
const totalSectionCount = computed(
  () => valueCount.value + props.leadingSpacerCount + props.trailingSpacerCount,
);

const getSectionPosition = (sectionIndex) =>
  (sectionIndex / totalSectionCount.value) * 100;

const getMarkerPosition = (value) =>
  getSectionPosition(props.leadingSpacerCount + (value - props.minValue) + 0.5);

const getStartBoundaryPosition = (value) =>
  getSectionPosition(props.leadingSpacerCount + (value - props.minValue));

const getEndBoundaryPosition = (value) =>
  getSectionPosition(props.leadingSpacerCount + (value - props.minValue) + 1);

const sliderRailStyle = computed(() => ({
  left: "0%",
  right: "0%",
}));

const activeTrackStyle = computed(() => ({
  left: `${getStartBoundaryPosition(props.startValue)}%`,
  right: `${100 - getEndBoundaryPosition(props.endValue)}%`,
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

const getTrackPointerSection = (clientX) => {
  const trackElement = trackRef.value;

  if (!trackElement) {
    return props.leadingSpacerCount;
  }

  const { left, width } = trackElement.getBoundingClientRect();
  const normalized = Math.min(Math.max((clientX - left) / width, 0), 1);

  return normalized * totalSectionCount.value;
};

const getValueFromPointer = (clientX, handle) => {
  const pointerSection = getTrackPointerSection(clientX);
  const rawValueIndex =
    handle === "start"
      ? Math.round(pointerSection - props.leadingSpacerCount)
      : Math.round(pointerSection - props.leadingSpacerCount - 1);
  const valueIndex = Math.min(valueCount.value - 1, Math.max(0, rawValueIndex));

  return props.minValue + valueIndex;
};

const handlePointerMove = (event) => {
  if (!draggingHandle.value) {
    return;
  }

  event.preventDefault();
  applyHandleValue(
    draggingHandle.value,
    getValueFromPointer(event.clientX, draggingHandle.value),
  );
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
  applyHandleValue(handle, getValueFromPointer(event.clientX, handle));

  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", stopDragging);
};

const handleTrackPointerDown = (event) => {
  const pointerPosition = getSectionPosition(
    getTrackPointerSection(event.clientX),
  );
  const startDistance = Math.abs(
    pointerPosition - getStartBoundaryPosition(props.startValue),
  );
  const endDistance = Math.abs(
    pointerPosition - getEndBoundaryPosition(props.endValue),
  );
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
  const handlePosition =
    handle === "start"
      ? getStartBoundaryPosition(props.startValue)
      : getEndBoundaryPosition(props.endValue);
  const horizontalInset =
    handle === "start" ? "calc(-50% + 0.75rem)" : "calc(-50% - 0.75rem)";

  return {
    left: `${handlePosition}%`,
    top: "50%",
    transform: `translate(${horizontalInset}, -50%)`,
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
      class="relative mt-2 pb-1 pt-5 select-none touch-none"
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
