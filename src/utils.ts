export const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

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

export type DatestampData = { day: number; month: number; year: number };
export class Datestamp implements DatestampData {
  static PLACEHOLDER: DatestampData = { day: 0, month: 0, year: 0 };

  static fromIsoString(iso: string): Datestamp {
    const d = new Date(iso);

    return new Datestamp(d.getDate(), d.getMonth(), d.getFullYear());
  }

  static fromData(data: DatestampData): Datestamp {
    return new Datestamp(data.day, data.month, data.year);
  }

  constructor(date: Date);
  constructor(day: number, month: number, year: number);
  constructor(dateOrDay: Date | number, month?: number, year?: number) {
    if (dateOrDay instanceof Date) {
      this.day = dateOrDay.getDate();
      this.month = dateOrDay.getMonth();
      this.year = dateOrDay.getFullYear();
    } else {
      if (typeof month === "undefined" || typeof year === "undefined")
        throw new Error(
          "Cannot create datestamp: month or year was undefined!"
        );

      this.day = dateOrDay;
      this.month = month;
      this.year = year;
    }
  }

  day: number;
  month: number;
  year: number;

  isEqual(to: Date | Datestamp): boolean {
    if (to instanceof Date) to = new Datestamp(to);

    return this.day == to.day && this.month == to.month && this.year == to.year;
  }

  serialize(): DatestampData {
    return {
      day: this.day,
      month: this.month,
      year: this.year,
    };
  }

  toEuroDate(): string {
    return `${this.day}.${MONTHS[this.month]} ${this.year}`;
  }
}
