import { simplePipeable } from "../functional/pipeable.ts";

/**
 * Formats a `Date` as an ISO-8601-like `YYYY-MM-DDTHH:mm:ss` string, reading each field via `Intl.DateTimeFormat`
 * rather than assuming a particular locale's rendered order/separators. Pipeable: call as
 * `formatLocaleDate(date, locale?)` or `formatLocaleDate(locale?)(date)`.
 * @param {Date} date The date to format.
 * @param {Intl.LocalesArgument} [locale] The locale to format with. Defaults to `"en-GB"`.
 * @returns {string | null} The formatted date string, e.g. `"2024-03-05T14:30:00"`, or `null` if `date` is
 * invalid.
 */
export const formatLocaleDate = simplePipeable(
  (date: Date, locale: Intl.LocalesArgument = "en-GB"): string | null => {
    if (Number.isNaN(date.getTime())) return null;

    const parts = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);

    const get = (type: Intl.DateTimeFormatPartTypes): string =>
      (parts.find(part => part.type === type) as Intl.DateTimeFormatPart).value;

    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
  },
  ([first]) => first instanceof Date
);
