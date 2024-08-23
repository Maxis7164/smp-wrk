import { onUnmounted } from "vue";

export type Subscriber = (banner: Banner) => void;
export type Unsubscribe = () => void;

export type BannerType = "info" | "error";
export type Banner = {
  type: BannerType;
  message: string;
  timeout: number;
};

const subs: Subscriber[] = [];

export function useBanner(subscriber: Subscriber) {
  subs.push(subscriber);
  onUnmounted(() => subs.splice(subs.indexOf(subscriber), 1));
}

export function banner(
  type: BannerType,
  message: string,
  timeout?: number
): void {
  const stdTo = message.length * 50;

  const b: Banner = {
    type,
    message,
    timeout: timeout ?? stdTo < 3500 ? 3500 : stdTo,
  };

  subs.forEach((sub) => sub(b));
}
