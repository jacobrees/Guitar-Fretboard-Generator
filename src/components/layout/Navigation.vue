<script setup>
import ntsIcon from "@/assets/nts-boxed-cutout-white.svg";
</script>

<template>
  <div class="w-full border-b border-gray-500 bg-gray-950 px-4 py-5">
    <div class="mx-auto w-full max-w-screen-2xl text-gray-50">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300"
          >
            Guitar Theory Workspace
          </p>
          <h1 class="mt-2 text-4xl font-semibold tracking-tight text-gray-100">
            The Fretboard Sandbox
          </h1>
          <p class="mt-2 text-base text-gray-300">
            Configure the instrument, map the scale, and explore interval
            relationships across the neck.
          </p>
        </div>

        <div class="flex items-center justify-end">
          <div class="inline-flex items-center gap-3">
            <span
              class="flex flex-col leading-tight text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/80 md:text-xs"
            >
              <span>Main Website</span>
              <span class="mt-1 inline-flex items-center gap-1">
                Check It Out
                <svg
                  class="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 12h14m-6-6 6 6-6 6"
                  />
                </svg>
              </span>
            </span>
            <a
              class="inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
              href="https://needthickerstrings.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit NeedThickerStrings (opens in a new tab)"
            >
              <img
                :src="ntsIcon"
                alt="Need Thicker Strings logo"
                class="h-20 w-20 transition-opacity duration-200 hover:opacity-85 md:h-24 md:w-24"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
