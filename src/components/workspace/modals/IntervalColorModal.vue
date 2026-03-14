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

  return paletteEntry ? formatPaletteName(paletteEntry[0]) : "Custom";
});
</script>

<template>
  <div
    v-if="modelValue && intervalHighlight"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
    @click.self="closeModal"
  >
    <div
      class="w-full max-w-xl rounded-2xl border border-gray-400 bg-gray-950 p-4 text-gray-50 shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <div
          class="flex items-start justify-between gap-4 border-b border-gray-500 pb-4"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200"
            >
              Interval Color
            </p>
            <h4 class="mt-2 text-3xl font-semibold">
              {{ intervalHighlight.name }}
            </h4>
            <p class="mt-2 text-base font-semibold text-gray-200">
              {{ intervalHighlight.label }}
            </p>
            <p class="mt-1 text-sm text-gray-400">
              Root-relative note: {{ intervalHighlight.note }}
            </p>
          </div>

          <button
            @click="closeModal"
            class="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-gray-50 transition hover:bg-zinc-950"
          >
            Close
          </button>
        </div>

        <div class="mt-5 rounded-2xl border border-gray-500 bg-zinc-900 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p
                class="text-sm font-semibold uppercase tracking-wide text-gray-400"
              >
                Palette
              </p>
              <p class="mt-2 text-sm text-gray-300">
                Pick a highlight color for this interval.
              </p>
            </div>

            <div
              class="flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-linear-to-b from-zinc-800 to-zinc-900 px-3 py-2"
            >
              <div
                :class="[
                  'flex h-14 w-12 items-center justify-center rounded-xl border text-lg font-semibold text-gray-50 shadow-lg shadow-black/30',
                  activeColor || 'bg-zinc-950',
                  intervalHighlight.isInScale
                    ? 'border-rose-300/35'
                    : 'border-gray-500',
                ]"
              >
                {{ intervalHighlight.label }}
              </div>

              <div class="text-right">
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                  Current
                </p>
                <p class="mt-1 text-sm font-semibold text-gray-100">
                  {{ activeColorName }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-3">
              <button
                v-for="(colorClass, colorName) in paletteColors"
                :key="`modal-${intervalHighlight.semitones}-${colorName}`"
                @click="selectColor(colorClass)"
                :class="[
                  'cursor-pointer rounded-2xl border p-3 text-center transition hover:-translate-y-0.5 hover:border-gray-300',
                  activeColor === colorClass
                    ? 'border-white bg-zinc-800 shadow-lg shadow-black/30'
                    : 'border-gray-600 bg-zinc-800/80',
                ]"
                :aria-label="`Set ${intervalHighlight.label} to ${colorName}`"
              >
                <div
                  :class="[
                    'mx-auto size-11 rounded-full border-2',
                    colorClass,
                    activeColor === colorClass
                      ? 'border-white'
                      : 'border-transparent',
                  ]"
                ></div>
                <p class="mt-2 text-sm font-semibold text-gray-100">
                  {{ formatPaletteName(colorName) }}
                </p>
              </button>
            </div>

            <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                @click="clearColor"
                class="cursor-pointer rounded-xl border border-gray-500 bg-zinc-950 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-gray-100 transition hover:border-gray-300 hover:bg-zinc-900"
              >
                Clear Highlight
              </button>

              <button
                @click="closeModal"
                class="cursor-pointer rounded-xl bg-rose-700 px-5 py-2 text-sm font-semibold text-gray-50 transition hover:bg-rose-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
