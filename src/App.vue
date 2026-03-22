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

import { useIntervalPalette } from "@/composables/workspace/useIntervalPalette";
import { useWorkspaceMode } from "@/composables/workspace/useWorkspaceMode";

import { useScaleStore } from "@/stores/scale";

const scale = useScaleStore();
const showIntervalHelper = ref(false);

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
  handleFocusClick,
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
        @go-to-focus="handleFocusClick"
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

      <div v-else class="w-full">
        <div class="mx-auto w-full max-w-screen-2xl">
          <FretboardDisplay />
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
            class="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-rose-300"
          >
            Fretboard Sandbox
          </p>
          <p class="mt-2 text-3xl font-semibold tracking-tight text-gray-50">
            Larger screen required
          </p>
          <p class="mt-3 text-base leading-7 text-gray-200">
            Use a tablet in landscape, desktop, or laptop.
          </p>

          <div class="mt-5 flex items-center justify-center gap-2">
            <span
              class="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400"
            >
              Minimum width
            </span>
            <span
              class="shrink-0 rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-sm font-semibold text-rose-100"
            >
              1024px
            </span>
          </div>
        </div>

        <div class="mt-5 border-t border-gray-500 pt-4">
          <a
            class="group flex w-full items-center justify-between gap-4 rounded-xl border border-gray-500 bg-zinc-900 px-4 py-3.5 text-gray-100 transition-colors duration-200 hover:border-rose-300/35 hover:bg-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
            href="https://needthickerstrings.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit the NeedThickerStrings main website (opens in a new tab)"
          >
            <span class="min-w-0 flex-1">
              <span
                class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-200"
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
              class="h-5 w-5 shrink-0 text-rose-100/85 transition-transform duration-200 group-hover:translate-x-1"
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
