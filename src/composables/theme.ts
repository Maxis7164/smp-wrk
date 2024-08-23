import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type Theme = 0 | 1 | 2;

const MEDIA = matchMedia("(prefers-color-scheme: dark)");
const STORE = "theme";

function applyTheme(isDark: boolean): void {
  if (isDark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

export const useTheme = defineStore("theme", () => {
  const theme = ref<Theme>(2);

  const isDark = computed<boolean>(() =>
    theme.value < 2 ? !!theme.value : MEDIA.matches
  );

  const ls = localStorage.getItem(STORE);
  if (ls) {
    const id = parseInt(ls) % 3;

    if (!isNaN(id)) theme.value = id as Theme;
  }

  function setTheme(id: Theme) {
    if (id < 0 || id > 2) id = Math.abs(id % 3) as Theme;

    theme.value = id;
    localStorage.setItem(STORE, id.toString());

    applyTheme(isDark.value);
  }

  applyTheme(isDark.value);

  return { theme, isDark, setTheme };
});
