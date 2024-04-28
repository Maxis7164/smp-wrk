export function saveFile(
  data: BlobPart[],
  fileName: string,
  options?: BlobPropertyBag
): Promise<void> {
  let res: (value: void) => void;
  let rej: (reason?: any) => void;
  const promise = new Promise<void>((rs, rj) => {
    res = rs;
    rej = rj;
  });

  function kill() {
    URL.revokeObjectURL(url);
    clearTimeout(to);
    A.remove();
  }

  const file = new Blob(data, options);
  const url = URL.createObjectURL(file);

  const A = document.createElement("a");
  A.setAttribute("__smp_dwnld_file__", "");
  A.style.display = "none";
  A.download = fileName;
  A.href = url;

  const to = setTimeout(() => {
    kill();
    rej("Timeout");
  }, 300_000);

  A.onclick = () =>
    setTimeout(() => {
      kill();
      res();
    });

  A.click();

  return promise;
}

export async function requestFile(): Promise<File> {
  return new Promise<File>((res, rej) => {
    const INP = document.createElement("input");
    INP.setAttribute("__smp_req_file__", "");
    INP.style.display = "none";
    INP.multiple = false;
    INP.type = "file";

    const to = setTimeout(() => {
      INP.remove();
      rej("Timeout");
    }, 300_000);

    INP.onchange = () => {
      clearTimeout(to);
      const file = INP.files?.item(0);

      if (!file) rej("User rejected request.");
      else res(file);

      INP.remove();
    };

    INP.click();
  });
}
