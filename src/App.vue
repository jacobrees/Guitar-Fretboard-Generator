<script setup>
import { computed, ref } from "vue";

import ntsIcon from "@/assets/nts-boxed-cutout-white.svg";
import ConfigFretboardControls from "@/components/fretboard/ConfigFretboardControls.vue";
import FocusFretboardControls from "@/components/fretboard/FocusFretboardControls.vue";
import FretboardControls from "@/components/fretboard/FretboardControls.vue";
import FretboardDisplay from "@/components/fretboard/FretboardDisplay.vue";
import FooterComponent from "@/components/layout/Footer.vue";
import Navigation from "@/components/layout/Navigation.vue";
import WorkspaceModeSwitcher from "@/components/workspace/WorkspaceModeSwitcher.vue";
import FocusLockedModal from "@/components/workspace/modals/FocusLockedModal.vue";
import IntervalColorModal from "@/components/workspace/modals/IntervalColorModal.vue";
import IntervalFormulaHelperModal from "@/components/workspace/modals/IntervalFormulaHelperModal.vue";
import ConfigWorkspacePanel from "@/components/workspace/panels/ConfigWorkspacePanel.vue";

import { provideFretboardViewport } from "@/composables/fretboard/useFretboardViewport";
import { useSyncFretboardViewport } from "@/composables/fretboard/useSyncFretboardViewport";
import { useIntervalPalette } from "@/composables/workspace/useIntervalPalette";
import { useWorkspaceMode } from "@/composables/workspace/useWorkspaceMode";

import { useScaleStore } from "@/stores/scale";

const scale = useScaleStore();
const showIntervalHelper = ref(false);
useSyncFretboardViewport(provideFretboardViewport());

const selectedIntervalLabels = computed(
  () => scale.selectedScaleSummary?.intervals.map(({ label }) => label) ?? [],
);

const {
  activeMode,
  showFocusWarning,
  modeTitle,
  modeDescription,
  goToConfig,
  goToFocus,
} = useWorkspaceMode();

const {
  activeIntervalPalette,
  activeIntervalHighlight,
  showIntervalColorModal,
  activeIntervalColor,
  paletteColors,
  toggleIntervalPalette,
  closeIntervalPalette,
  setActiveIntervalHighlightColor,
  clearActiveIntervalHighlightColor,
} = useIntervalPalette();
</script>

<template>
  <div class="hidden min-h-screen lg:flex lg:flex-col">
    <Navigation />

    <FocusLockedModal v-model="showFocusWarning" />

    <IntervalColorModal
      v-model="showIntervalColorModal"
      :interval-highlight="activeIntervalHighlight"
      :palette-colors="paletteColors"
      :active-color="activeIntervalColor"
      @select-color="setActiveIntervalHighlightColor"
      @clear-color="clearActiveIntervalHighlightColor"
    />

    <IntervalFormulaHelperModal
      v-model="showIntervalHelper"
      :mode-name="scale.selectedScaleSummary?.modeName"
      :interval-legend="scale.intervalLegend"
      :selected-interval-labels="selectedIntervalLabels"
    />

    <div class="flex flex-1 flex-col items-center">
      <WorkspaceModeSwitcher
        :mode-title="modeTitle"
        :mode-description="modeDescription"
        :active-mode="activeMode"
        @go-to-config="goToConfig"
        @go-to-focus="goToFocus"
      />

      <div v-if="activeMode === 'focus'" class="w-full">
        <FocusFretboardControls
          v-if="scale.selectedScaleSummary"
          :active-interval-palette="activeIntervalPalette"
          @toggle-interval-palette="toggleIntervalPalette"
          @close-interval-palette="closeIntervalPalette"
          @open-interval-helper="showIntervalHelper = true"
        />

        <div class="mx-auto w-full max-w-screen-2xl">
          <FretboardDisplay />
        </div>
        <FretboardControls />
      </div>

      <div v-else class="w-full space-y-6">
        <div class="mx-auto w-full max-w-screen-2xl px-5 pt-4">
          <div class="rounded-2xl border border-zinc-800/95 bg-zinc-950/65 p-2">
            <div class="border-b border-zinc-800 px-2 pb-2 pt-1">
              <p
                class="text-center text-xs font-semibold uppercase tracking-[0.24em] text-gray-400"
              >
                Fretboard Preview
              </p>
            </div>
            <FretboardDisplay />
          </div>
        </div>
        <ConfigFretboardControls />
      </div>

      <ConfigWorkspacePanel
        v-if="activeMode === 'config'"
        @open-interval-helper="showIntervalHelper = true"
        @go-to-focus="goToFocus"
      />
    </div>
    <FooterComponent class="mt-auto" />
  </div>

  <div
    class="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-center text-gray-100 lg:hidden"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-gray-400 bg-gray-950 p-3 text-left shadow-2xl"
    >
      <div class="rounded-2xl bg-zinc-700 p-5 text-gray-50">
        <div class="text-center">
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-500 bg-zinc-900 shadow-lg shadow-black/25"
          >
            <img
              :src="ntsIcon"
              alt="NeedThickerStrings logo"
              class="h-10 w-10"
            />
          </div>
          <p
            class="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300"
          >
            Fretboard Sandbox
          </p>
          <p class="mt-2 text-3xl font-semibold tracking-tight text-gray-50">
            Larger screen required
          </p>
          <p class="mt-3 text-base leading-7 text-gray-200">
            This workspace is designed for larger screens.
          </p>
        </div>

        <div class="mt-5 border-t border-gray-500 pt-4">
          <a
            class="group flex w-full items-center justify-between gap-4 rounded-xl border border-gray-500 bg-zinc-900 px-4 py-3.5 text-gray-100 transition-colors duration-200 hover:border-sky-300/35 hover:bg-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
            href="https://needthickerstrings.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit the NeedThickerStrings main website (opens in a new tab)"
          >
            <span class="min-w-0 flex-1">
              <span
                class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200"
              >
                Main Website
              </span>
              <span class="mt-1 block text-base font-semibold text-gray-50">
                Return to NeedThickerStrings
              </span>
              <span class="mt-1 block text-sm leading-5 text-gray-300">
                Opens in a new tab.
              </span>
            </span>
            <svg
              class="h-5 w-5 shrink-0 text-sky-100/85 transition-transform duration-200 group-hover:translate-x-1"
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
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
