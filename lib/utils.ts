export const MATCH_THRESHOLD = 70;

export function detectCountry(location: string): string {
  const loc = location.toLowerCase();
  if (/\b(uk|united kingdom|london|manchester|birmingham|glasgow|edinburgh|leeds|bristol|liverpool)\b/.test(loc)) return "gb";
  if (/\b(australia|sydney|melbourne|brisbane|perth|adelaide|canberra)\b/.test(loc)) return "au";
  if (/\b(canada|toronto|vancouver|montreal|calgary|ottawa|edmonton)\b/.test(loc)) return "ca";
  return "us";
}
