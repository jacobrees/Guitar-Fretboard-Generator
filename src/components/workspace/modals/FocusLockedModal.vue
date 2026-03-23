<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const closeModal = () => {
  emit("update:modelValue", false);
};
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-gray-400 bg-gray-950 p-4 text-gray-50 shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-4">
        <h3 class="text-center text-3xl">Focus Locked</h3>
        <p class="mt-3 text-center text-lg">
          Configure the guitar, map your notes, and choose a root before
          continuing into Explore Fretboard.
        </p>
        <div class="mt-4 flex justify-center">
          <button
            @click="closeModal"
            class="cursor-pointer rounded-xl bg-sky-700 px-6 py-2 text-gray-50 transition hover:bg-sky-800"
          >
            Back to Config
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
