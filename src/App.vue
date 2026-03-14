<script setup>
import { computed, ref } from "vue";

import FretboardControls from "@/components/fretboard/FretboardControls.vue";
import FretboardDisplay from "@/components/fretboard/FretboardDisplay.vue";
import FooterComponent from "@/components/layout/Footer.vue";
import Navigation from "@/components/layout/Navigation.vue";
import WorkspaceModeSwitcher from "@/components/workspace/WorkspaceModeSwitcher.vue";
import FocusLockedModal from "@/components/workspace/modals/FocusLockedModal.vue";
import IntervalColorModal from "@/components/workspace/modals/IntervalColorModal.vue";
import IntervalFormulaHelperModal from "@/components/workspace/modals/IntervalFormulaHelperModal.vue";
import ConfigWorkspacePanel from "@/components/workspace/panels/ConfigWorkspacePanel.vue";
import FocusWorkspacePanel from "@/components/workspace/panels/FocusWorkspacePanel.vue";

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

    <FocusWorkspacePanel
      v-if="activeMode === 'focus' && scale.selectedScaleSummary"
      :active-interval-palette="activeIntervalPalette"
      @toggle-interval-palette="toggleIntervalPalette"
      @close-interval-palette="closeIntervalPalette"
      @open-interval-helper="showIntervalHelper = true"
    />

    <FretboardDisplay />

    <ConfigWorkspacePanel
      v-if="activeMode === 'config'"
      @open-interval-helper="showIntervalHelper = true"
      @go-to-focus="goToFocus"
    />
  </div>
  <FretboardControls v-if="activeMode === 'focus'" />
  <FooterComponent />
</template>
