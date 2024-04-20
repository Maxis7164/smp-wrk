export type Theme = 0 | 1 | 2;

let theme: Theme = 0;

function applyTheme(t: Theme): void {
  const isDark =
    t < 2 ? !!t : matchMedia("(prefers-color-scheme: dark)").matches;

  if (isDark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");

  localStorage.setItem("theme", `${t}`);
}

export function setTheme(t: Theme): void {
  theme = t;
  applyTheme(theme);
}
export function toggleTheme(): void {
  theme = ((theme + 1) % 3) as Theme;
  applyTheme(theme);
}
export function getTheme(): Theme {
  return theme;
}
export function loadTheme(): void {
  let t = parseInt(localStorage.getItem("theme") ?? "2");

  if (t > 2 || t < 0 || isNaN(t)) t = 2;
  applyTheme(t as Theme);
}
