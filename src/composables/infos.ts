import { defineStore } from "pinia";
import { ref } from "vue";

export type Info = {
  message: string;
  action: string;
  click: () => void;
};

export const noop = () => {};

export const useInfo = defineStore("info", () => {
  const list = ref<Info[]>([]);

  function add(message: string, action: string, click: () => void) {
    list.value.push({ message, action, click });
  }

  function close(index: number) {
    const el = list.value.splice(index, 1).at(0);

    if (el) el.click();
  }

  return { list, add, close };
});
