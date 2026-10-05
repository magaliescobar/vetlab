/**
 * Los paquetes @svar-ui/*-locales no publican tipos. Declaraciones mínimas
 * (estructura real: objetos de strings/grupos consumidos por <Locale words>).
 */
declare module "@svar-ui/core-locales" {
  export interface SvarCoreLocale {
    lang: string;
    core: Record<string, string>;
    calendar: {
      monthFull: string[];
      monthShort: string[];
      dayFull: string[];
      dayShort: string[];
      hours: string;
      minutes: string;
      done: string;
      clear: string;
      today: string;
      weekStart: number;
      clockFormat: number;
      [key: string]: unknown;
    };
    formats: Record<string, string>;
    [key: string]: unknown;
  }
  export const es: SvarCoreLocale;
}

declare module "@svar-ui/calendar-locales" {
  export interface SvarCalendarLocale {
    eventCalendar: Record<string, string>;
    calendar: Record<string, string>;
    [key: string]: unknown;
  }
  export const es: SvarCalendarLocale;
}
