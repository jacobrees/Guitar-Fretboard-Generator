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
  <div
    class="z-10 mt-2 w-full max-w-xl rounded-2xl border border-gray-400 bg-gray-950 p-3 text-gray-50"
  >
    <div class="rounded-2xl bg-zinc-700 p-4">
      <div class="border-b border-gray-500 pb-4 text-center">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Workspace
        </p>
        <h2 class="mt-1 text-3xl font-semibold">{{ modeTitle }}</h2>
        <p class="mt-2 text-base text-gray-200">
          {{ modeDescription }}
        </p>
      </div>

      <div class="mt-4 rounded-2xl bg-zinc-800 p-2">
        <div class="grid grid-cols-2 gap-2 text-lg">
          <button
            @click="emit('go-to-config')"
            :class="[
              'w-full rounded-xl px-4 py-2 font-semibold transition hover:cursor-pointer',
              activeMode === 'config'
                ? 'bg-rose-700 text-gray-50'
                : 'bg-zinc-900 text-gray-200 hover:bg-zinc-950',
            ]"
          >
            Configure Guitar
          </button>
          <button
            @click="emit('go-to-focus')"
            :class="[
              'w-full rounded-xl px-4 py-2 font-semibold transition hover:cursor-pointer',
              activeMode === 'focus'
                ? 'bg-rose-700 text-gray-50'
                : 'bg-zinc-900 text-gray-200 hover:bg-zinc-950',
            ]"
          >
            Explore Fretboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
