import { onUnmounted } from "vue";

type Listener = (modal: Modal<keyof ModalResults>) => void;
type Unsubscribe = () => void;

export type ModalResults = {
  confirm: boolean;
  prompt: string;
  alert: void;
};

type OptionalModalOptions = {
  checkup?: CheckupFunction;
  buttons: string[];
};

type ModalOptions = {
  message: string;
  title: string;
} & OptionalModalOptions;

export type Modal<K extends keyof ModalResults> = {
  type: K;
} & ModalOptions;

type OpenModal<K extends keyof ModalResults> = Modal<K> & {
  res: (value: ModalResults[K]) => void;
  rej: (reason?: any) => void;
};

export type CheckupFunction = (answer: string) => string;

const listeners: Listener[] = [];

const quene: OpenModal<any>[] = [];

function __answerModal__<K extends keyof ModalResults>(
  result: any,
  rejects?: true
): boolean;
function __answerModal__<K extends keyof ModalResults>(
  result: ModalResults[K],
  rejects?: false
): boolean;
function __answerModal__(result: any, rejects: boolean = false): boolean {
  const modal = quene.at(0);

  if (!modal) {
    console.error(
      "[!] <modal.ts::__awnserModal__> Tried to awnser a modal while no modal is currently open!"
    );
    return !!quene.length;
  }

  if (rejects) modal.rej(result);
  else modal.res(result);

  quene.shift();
  setTimeout(() => continueInQuene());
  return !!quene.length;
}

function continueInQuene(): void {
  const modal = quene.at(0);

  if (!modal) return;

  const stripped: Modal<keyof ModalResults> = {
    buttons: modal.buttons,
    checkup: modal.checkup,
    message: modal.message,
    title: modal.title,
    type: modal.type,
  };

  listeners.forEach((fn) => fn(stripped));
}

function callModal<K extends keyof ModalResults>(
  type: K,
  modal: Partial<ModalOptions>
): Promise<ModalResults[K]> {
  return new Promise<ModalResults[K]>((res, rej) => {
    const m: OpenModal<K> = {
      buttons: ["Ok", "Cancel"],
      message: "",
      title: "",
      type,

      ...modal,
      res,
      rej,
    };

    quene.push(m);
    if (quene.length === 1) continueInQuene();
  });
}

export function alert(
  message: string,
  title: string = "",
  okButton: string = "Ok"
): Promise<void> {
  return callModal("alert", { message, title, buttons: [okButton] });
}
export function prompt(
  message: string,
  title: string = "",
  options?: Partial<OptionalModalOptions>
): Promise<string> {
  return callModal("prompt", {
    buttons: options?.buttons ?? ["Ok", "Cancel"],
    checkup: options?.checkup,
    message,
    title,
  });
}
export function confirm(
  message: string,
  title: string = "",
  buttons?: string[]
): Promise<boolean> {
  return callModal("confirm", {
    message,
    title,
    buttons: buttons ?? ["Ok", "Cancel"],
  });
}

export function useModal(subscriber: Listener) {
  listeners.push(subscriber);
  onUnmounted(() => listeners.splice(listeners.indexOf(subscriber), 1));

  return __answerModal__;
}
