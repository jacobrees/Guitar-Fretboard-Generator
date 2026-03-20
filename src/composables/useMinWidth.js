import { onBeforeUnmount, onMounted, ref } from "vue";

export const useMinWidth = (minWidth) => {
  const canUseMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia === "function";
  const isMinWidth = ref(
    canUseMatchMedia
      ? window.matchMedia(`(min-width: ${minWidth}px)`).matches
      : false,
  );
  let mediaQueryList = null;

  const handleChange = (event) => {
    isMinWidth.value = event.matches;
  };

  onMounted(() => {
    if (!canUseMatchMedia) {
      return;
    }

    mediaQueryList = window.matchMedia(`(min-width: ${minWidth}px)`);
    isMinWidth.value = mediaQueryList.matches;

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      return;
    }

    mediaQueryList.addListener(handleChange);
  });

  onBeforeUnmount(() => {
    if (!mediaQueryList) {
      return;
    }

    if (typeof mediaQueryList.removeEventListener === "function") {
      mediaQueryList.removeEventListener("change", handleChange);
      return;
    }

    mediaQueryList.removeListener(handleChange);
  });

  return {
    isMinWidth,
  };
};
