export function getEuroDate(date: string[]): string[] {
  return [date[2], date[1], date[0]];
}

export function round(val: number): number {
  return Math.floor(val * 100) / 100;
}

export function range(iterationCount: number): null[] {
  return new Array(iterationCount).fill(null);
}

export function currency(val: string | number): string {
  let str: string = typeof val === "number" ? val.toLocaleString() : val;
  const num: number = typeof val === "number" ? val : parseInt(val);

  if ((num * 100) % 100 === 0) str += ",0";
  if ((num * 100) % 10 === 0) str += "0";

  return str;
}

export function getHours(time: string): number {
  const hours = time.split(":")[0];

  if (hours.length > 0) {
    const num = parseInt(hours);

    return num > 24 || num < 0 ? 0 : num;
  }

  return NaN;
}
export function getMinutes(time: string): number {
  const minutes = time.split(":")[1];

  if (minutes.length > 0) {
    const num = parseInt(minutes);

    return num > 60 || num < 0 ? 0 : num;
  }

  return NaN;
}
export function getTime(time: string): number {
  const h = getHours(time);
  const m = getMinutes(time);

  return h * 60 + m;
}
