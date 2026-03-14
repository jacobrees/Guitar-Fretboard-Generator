<script setup>
import { computed, ref } from "vue";

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
  <div class="hidden lg:block">
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

    <div class="flex flex-col items-center justify-center">
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
    <FooterComponent />
  </div>

  <div
    class="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-center text-gray-100 lg:hidden"
  >
    <div
      class="max-w-md space-y-3 rounded-2xl border border-gray-700 bg-zinc-900/90 p-6"
    >
      <p class="text-lg font-semibold">Larger Screen Required</p>
      <p class="text-sm text-gray-300">
        Guitar Fretboard Generator currently works best on wider layouts. If
        you're on a tablet, try landscape mode or a window width of at least
        1024px.
      </p>
    </div>
  </div>
</template>
