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
