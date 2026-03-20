<script setup>
defineProps({
  intervals: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="mt-4 flex flex-wrap gap-2">
    <div
      v-for="interval in intervals"
      :key="`${interval.label}-${interval.note}`"
      class="group relative"
    >
      <div
        :title="`${interval.label}: ${interval.note}`"
        :aria-label="`${interval.label} maps to ${interval.note}`"
        tabindex="0"
        class="flex min-w-9 cursor-help items-center justify-center rounded-lg border border-gray-300 bg-zinc-800 px-2 py-1.5 text-lg font-semibold text-gray-50 shadow-sm shadow-black/20 transition hover:border-rose-300 focus:border-rose-300 focus:outline-none"
      >
        {{ interval.label }}
      </div>

      <div
        class="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-500 bg-gray-950 px-3 py-1.5 text-sm font-medium text-gray-100 shadow-xl group-hover:block group-focus-within:block"
      >
        {{ interval.note }}
      </div>
    </div>
  </div>
</template>
