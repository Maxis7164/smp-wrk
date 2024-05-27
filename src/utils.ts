export function getEuroDate(date: string[]): string[] {
  return [date[2], date[1], date[0]];
}

export function round(val: number): number {
  return Math.floor(val * 100) / 100;
}
