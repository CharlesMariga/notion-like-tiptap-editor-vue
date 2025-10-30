import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable to detect if the viewport is mobile-sized
 * @param breakpoint - The width breakpoint in pixels (default: 768)
 * @returns A ref that is true when viewport width is less than the breakpoint
 */
export function useIsMobile(breakpoint: number = 768) {
  const isMobile = ref(false);

  const checkIsMobile = () => {
    isMobile.value = window.innerWidth < breakpoint;
  };

  onMounted(() => {
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkIsMobile);
  });

  return isMobile;
}
