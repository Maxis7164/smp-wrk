import { onUnmounted } from "vue";

const b: ((banner: Banner) => void)[] = [];
const s: (() => void)[] = [];

export function listen(
  banner: (banner: Banner) => void,
  skip: () => void
): () => void {
  b.push(banner);
  s.push(skip);
  return () => b.splice(b.indexOf(banner), 1);
}

export type BannerType = "info" | "error";
export interface Banner {
  translate: Record<string, unknown> | unknown[];
  duration: number;
  type: BannerType;
  message: string;
}
export function call(
  type: BannerType,
  message: string,
  options?: {
    duration?: number;
    translate?: Record<string, unknown> | unknown[];
  }
): void {
  b.forEach((fn) =>
    fn({
      type,
      message,
      duration:
        options?.duration ?? message.length * 50 > 3800
          ? message.length * 50
          : 3800,
      translate: options?.translate ?? [],
    })
  );
}

export function skipCurrent(): void {
  s.forEach((fn) => fn());
}
