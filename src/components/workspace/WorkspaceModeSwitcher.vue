<script setup>
defineProps({
  modeTitle: {
    type: String,
    required: true,
  },
  modeDescription: {
    type: String,
    required: true,
  },
  activeMode: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["go-to-config", "go-to-focus"]);
</script>

<template>
  <div class="z-10 mt-2 w-full max-w-2xl px-5 text-gray-50">
    <div class="rounded-xl border border-gray-700 bg-zinc-900/90 p-2">
      <div
        class="flex items-start justify-between gap-3 border-b border-gray-700 px-2 pb-2"
      >
        <div>
          <p
            class="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400"
          >
            Workspace
          </p>
          <h2 class="mt-0.5 text-base font-semibold">{{ modeTitle }}</h2>
        </div>
        <p class="max-w-md text-right text-xs leading-relaxed text-gray-400">
          {{ modeDescription }}
        </p>
      </div>

      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          @click="emit('go-to-config')"
          :class="[
            'w-full cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition',
            activeMode === 'config'
              ? 'border-rose-500 bg-rose-700 text-gray-50'
              : 'border-gray-600 bg-zinc-800 text-gray-200 hover:bg-zinc-700',
          ]"
        >
          Configure Guitar
        </button>
        <button
          @click="emit('go-to-focus')"
          :class="[
            'w-full cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition',
            activeMode === 'focus'
              ? 'border-rose-500 bg-rose-700 text-gray-50'
              : 'border-gray-600 bg-zinc-800 text-gray-200 hover:bg-zinc-700',
          ]"
        >
          Explore Fretboard
        </button>
      </div>
    </div>
  </div>
</template>
