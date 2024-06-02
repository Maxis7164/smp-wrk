type Listener = (modal: Modal<keyof ModalResults>) => void;
type Unsubscribe = () => void;

export type ModalResults = {
  confirm: boolean;
  prompt: string;
  alert: void;
};

type ModalOptions = {
  buttons: string[];
  message: string;
  title: string;
};

export type Modal<K extends keyof ModalResults> = {
  type: K;
} & ModalOptions;

type OpenModal<K extends keyof ModalResults> = Modal<K> & {
  res: (value: ModalResults[K]) => void;
  rej: (reason?: any) => void;
};

const listeners: Listener[] = [];

const quene: OpenModal<any>[] = [];

export function listen(listener: Listener): Unsubscribe {
  listeners.push(listener);
  return () => listeners.splice(listeners.indexOf(listener), 1);
}

export function __awnserModal__<K extends keyof ModalResults>(
  result: any,
  rejects?: true
): boolean;
export function __awnserModal__<K extends keyof ModalResults>(
  result: ModalResults[K],
  rejects?: false
): boolean;
export function __awnserModal__<K extends keyof ModalResults>(
  result: any,
  rejects: boolean = false
): boolean {
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
  buttons?: string[]
): Promise<string> {
  return callModal("prompt", {
    message,
    title,
    buttons: buttons ?? ["Ok", "Cancel"],
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
