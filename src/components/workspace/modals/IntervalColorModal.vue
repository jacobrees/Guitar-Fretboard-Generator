<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  intervalHighlight: {
    type: Object,
    default: null,
  },
  paletteColors: {
    type: Object,
    default: () => ({}),
  },
  activeColor: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "select-color", "clear-color"]);

const closeModal = () => {
  emit("update:modelValue", false);
};

const selectColor = (colorClass) => {
  emit("select-color", colorClass);
};

const clearColor = () => {
  emit("clear-color");
};

const formatPaletteName = (colorName) =>
  colorName.charAt(0).toUpperCase() + colorName.slice(1);

const activeColorName = computed(() => {
  if (!props.activeColor) {
    return "None";
  }

  const paletteEntry = Object.entries(props.paletteColors).find(
    ([, colorClass]) => colorClass === props.activeColor,
  );

  return paletteEntry ? formatPaletteName(paletteEntry[0]) : "None";
});
</script>

<template>
  <div
    v-if="modelValue && intervalHighlight"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
    @click.self="closeModal"
  >
    <div
      class="w-full max-w-md rounded-xl border border-gray-600 bg-zinc-900 p-4 text-gray-50 shadow-2xl"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
          >
            Interval Color
          </p>
          <h4 class="mt-1 text-xl font-semibold">
            {{ intervalHighlight.label }} · {{ intervalHighlight.name }}
          </h4>
          <p class="mt-1 text-sm text-gray-400">
            Note: {{ intervalHighlight.note }}
          </p>
        </div>

        <button
          @click="closeModal"
          class="cursor-pointer rounded-lg border border-gray-500 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-gray-100 transition hover:bg-zinc-700"
        >
          Close
        </button>
      </div>

      <div
        class="mt-4 flex items-center justify-between rounded-xl border border-gray-700 bg-zinc-800/60 px-3 py-2"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'flex size-10 items-center justify-center rounded-lg border text-sm font-semibold text-gray-50',
              activeColor || 'bg-zinc-700',
              intervalHighlight.isInScale
                ? 'border-rose-300/35'
                : 'border-gray-500',
            ]"
          >
            {{ intervalHighlight.label }}
          </div>

          <div>
            <p
              class="text-[11px] font-semibold uppercase tracking-wide text-gray-400"
            >
              Current
            </p>
            <p class="text-sm font-semibold text-gray-100">
              {{ activeColorName }}
            </p>
          </div>
        </div>

        <button
          @click="clearColor"
          class="cursor-pointer rounded-lg border border-gray-500 bg-zinc-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-100 transition hover:border-gray-300 hover:bg-zinc-800"
        >
          Clear
        </button>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2">
        <button
          v-for="(colorClass, colorName) in paletteColors"
          :key="`modal-${intervalHighlight.semitones}-${colorName}`"
          @click="selectColor(colorClass)"
          :class="[
            'cursor-pointer rounded-xl border px-2 py-2 text-center transition',
            activeColor === colorClass
              ? 'border-white bg-zinc-800 shadow-lg shadow-black/30'
              : 'border-gray-600 bg-zinc-800/70 hover:border-gray-300 hover:bg-zinc-700',
          ]"
          :aria-label="`Set ${intervalHighlight.label} to ${colorName}`"
        >
          <div
            :class="[
              'mx-auto size-8 rounded-full border-2',
              colorClass,
              activeColor === colorClass
                ? 'border-white'
                : 'border-transparent',
            ]"
          ></div>
          <p class="mt-1.5 text-xs font-semibold text-gray-100">
            {{ formatPaletteName(colorName) }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
