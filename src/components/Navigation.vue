<script setup>
import gitHubLogo from "@/assets/github.svg";
</script>

<template>
  <div
    class="w-full h-[100px] flex items-center justify-center bg-gray-950 border-b-1 border-gray-500"
  >
    <div class="max-w-[1100px] w-full m-16 flex items-center justify-between">
      <h2 class="text-gray-100 text-4xl font-semibold">
        The Fretboard Sandbox 🎸
      </h2>
      <a
        target="_blank"
        href="https://github.com/jacobrees/Guitar-Fretboard-Generator"
        ><img class="w-[64px]" :src="gitHubLogo" alt="GitHub Logo"
      /></a>
    </div>
  </div>
</template>
