import { onBeforeUnmount, onMounted, ref } from "vue";

export const useDismissibleControlDock = () => {
  const dockRef = ref(null);
  const activeControl = ref(null);

  const closeControls = () => {
    activeControl.value = null;
  };

  const toggleControl = (controlKey) => {
    activeControl.value =
      activeControl.value === controlKey ? null : controlKey;
  };

  const isControlOpen = (controlKey) => activeControl.value === controlKey;

  const handleDocumentClick = (event) => {
    if (!dockRef.value || dockRef.value.contains(event.target)) {
      return;
    }

    closeControls();
  };

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      closeControls();
    }
  };

  onMounted(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);
  });

  onBeforeUnmount(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.removeEventListener("click", handleDocumentClick);
    document.removeEventListener("keydown", handleEscape);
  });

  return {
    dockRef,
    activeControl,
    closeControls,
    toggleControl,
    isControlOpen,
  };
};
