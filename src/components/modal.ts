const m: ((modal: Modal<any>) => void)[] = [];

export function listen(fn: (modal: Modal<any>) => void): () => void {
  m.push(fn);
  return () => m.splice(m.indexOf(fn), 1);
}

export type ModalType = "alert" | "prompt" | "confirm" | "choose";
export interface Modal<T> {
  fns: [(value: T) => void, (reason: any) => void];
  switchControls: boolean;
  placeholder: string;
  buttons: string[];
  type: ModalType;
  message: string;
  title: string;
}

function call<T>(
  type: ModalType,
  message: string,
  title: string = "",
  buttons: string[] = [],
  placeholder: string = "",
  switchControls: boolean = false
): Promise<T> {
  return new Promise<T>((res, rej) => {
    m.forEach((fn) =>
      fn({
        fns: [res, rej],
        type,
        message,
        title,
        buttons,
        placeholder,
        switchControls,
      })
    );
  });
}

export function alert(message: string, title: string = ""): Promise<void> {
  return call<void>("alert", message, title);
}
export function prompt(
  message: string,
  title: string = "",
  placeholder: string = ""
): Promise<string | null> {
  return call<string | null>("prompt", message, title, [], placeholder);
}
export function confirm(
  message: string,
  title: string = "",
  switchControls: boolean = false
): Promise<boolean> {
  return call<boolean>("confirm", message, title, [], "", switchControls);
}
export function choose(
  message: string,
  buttons: string[],
  title: string = ""
): Promise<number | null> {
  return call<number | null>("choose", message, title, buttons);
}
