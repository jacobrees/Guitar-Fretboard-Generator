<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  modeName: {
    type: String,
    default: "Custom Selection",
  },
  intervalLegend: {
    type: Array,
    default: () => [],
  },
  selectedIntervalLabels: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const closeModal = () => {
  emit("update:modelValue", false);
};

const isSelectedInterval = (legendLabel) =>
  legendLabel
    .split("/")
    .map((label) => label.trim())
    .some((label) => props.selectedIntervalLabels.includes(label));
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
  >
    <div
      class="w-full max-w-3xl rounded-2xl border border-gray-400 bg-gray-950 p-4 text-gray-50 shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-5">
        <div
          class="flex items-start justify-between gap-4 border-b border-gray-500 pb-4"
        >
          <div>
            <h3 class="text-3xl font-semibold">Interval Formula Helper</h3>
            <p
              class="mt-2 text-sm font-semibold uppercase tracking-wide text-rose-200"
            >
              {{ modeName || "Custom Selection" }}
            </p>
            <p class="mt-2 text-base text-gray-200">
              Use this chromatic interval reference to decode the shorthand used
              in interval formulas.
            </p>
          </div>

          <button
            @click="closeModal"
            class="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2 text-gray-50 transition hover:bg-zinc-950"
          >
            Close
          </button>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="interval in intervalLegend"
            :key="interval.label"
            :class="[
              'rounded-xl border px-3 py-3 text-center transition',
              isSelectedInterval(interval.label)
                ? 'border-rose-300 bg-rose-950/70 text-rose-50 shadow-lg shadow-rose-950/35'
                : 'border-gray-600 bg-zinc-900',
            ]"
          >
            <p class="text-xl font-semibold">{{ interval.label }}</p>
            <p
              :class="[
                'mt-1 text-sm',
                isSelectedInterval(interval.label)
                  ? 'text-rose-200'
                  : 'text-gray-300',
              ]"
            >
              {{ interval.name }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
