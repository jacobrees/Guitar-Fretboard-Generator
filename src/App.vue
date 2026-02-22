<script setup>
import gitHubLogo from "@/assets/github.svg";
</script>

<template>
  <div
    class="w-full h-[100px] flex items-center justify-center bg-gray-800 border-b-2 border-gray-700"
  >
    <div class="max-w-[1100px] w-full m-16 flex items-center justify-between">
      <div></div>
      <h2 class="text-gray-200 text-4xl font-semibold">
        Guitar Fretboard Generator
      </h2>
      <a href="#"
        ><img class="w-[54px]" :src="gitHubLogo" alt="GitHub Logo"
      /></a>
    </div>
  </div>
</template>
