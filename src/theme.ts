export type Theme = 0 | 1 | 2;

const media = matchMedia("(prefers-color-scheme: dark)");
let theme: Theme = 0;

function applyTheme(isDark: boolean): void {
  if (isDark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

const update = ({ matches }: MediaQueryListEvent) => applyTheme(matches);

function setup(t: Theme): void {
  if (t === 2) media.addEventListener("change", update);
  else media.removeEventListener("change", update);

  applyTheme(!!t);

  localStorage.setItem("theme", `${t}`);
}

export function setTheme(t: Theme): void {
  theme = t;
  setup(theme);
}
export function getTheme(): Theme {
  return theme;
}
export function loadTheme(): void {
  let t = parseInt(localStorage.getItem("theme") ?? "2");

  theme = theme > 2 || theme < 0 || isNaN(theme) ? 2 : (t as Theme);
  setup(theme as Theme);
}
