/**
 * Formats a `Date` as an ISO-8601-like `YYYY-MM-DDTHH:mm:ss` string, deriving the day/month/year order from a
 * locale (default `en-GB`, i.e. day/month/year) rather than assuming one.
 * @param {Date} date The date to format.
 * @param {Intl.LocalesArgument} [locale] The locale whose date ordering to use. Defaults to `"en-GB"`.
 * @returns {string} The formatted date string, e.g. `"2024-03-05T14:30:00"`.
 */
export const formatLocaleDate = (
  date: Date,
  locale: Intl.LocalesArgument = "en-GB"
) =>
  date
    .toLocaleString(locale)
    .replace(
      /^(?<d>\d+)\/(?<m>\d+)\/(?<y>\d+), (?<t>[:\d]+)$/,
      "$<y>-$<m>-$<d>T$<t>"
    );
