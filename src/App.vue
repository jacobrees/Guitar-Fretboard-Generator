<script setup>
import { computed, ref } from "vue";
import { useScaleStore } from "@/stores/scale";
import Navigation from "@/components/Navigation.vue";
import FooterComponent from "@/components/Footer.vue";
import FretboardDisplay from "@/components/FretboardDisplay.vue";
import FretboardControls from "@/components/FretboardControls.vue";
import FocusLockedModal from "@/components/FocusLockedModal.vue";
import IntervalColorModal from "@/components/IntervalColorModal.vue";
import IntervalFormulaHelperModal from "@/components/IntervalFormulaHelperModal.vue";
import FocusWorkspacePanel from "@/components/FocusWorkspacePanel.vue";
import ConfigWorkspacePanel from "@/components/ConfigWorkspacePanel.vue";
import WorkspaceModeSwitcher from "@/components/WorkspaceModeSwitcher.vue";
import { useWorkspaceMode } from "@/composables/useWorkspaceMode";
import { useIntervalPalette } from "@/composables/useIntervalPalette";

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
