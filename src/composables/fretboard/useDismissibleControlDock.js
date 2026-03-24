import { onBeforeUnmount, onMounted, ref } from "vue";

export const useDismissibleControlDock = () => {
  const dockRef = ref(null);
  const activeControl = ref(null);
  const controlElements = new Map();

  const closeControls = () => {
    activeControl.value = null;
  };

  const toggleControl = (controlKey) => {
    activeControl.value =
      activeControl.value === controlKey ? null : controlKey;
  };

  const isControlOpen = (controlKey) => activeControl.value === controlKey;

  const registerControlElement = (controlKey, element) => {
    if (element) {
      controlElements.set(controlKey, element);
      return;
    }

    controlElements.delete(controlKey);
  };

  const getActiveControlElement = () =>
    activeControl.value
      ? (controlElements.get(activeControl.value) ?? dockRef.value)
      : dockRef.value;

  const handleDocumentClick = (event) => {
    const activeElement = getActiveControlElement();

    if (!activeElement || activeElement.contains(event.target)) {
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
    registerControlElement,
  };
};
