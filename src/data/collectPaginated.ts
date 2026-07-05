/**
 * Repeatedly calls `getPage` with an incrementing page number, collecting every page's results into a single
 * array until a page returns fewer than `perPage` items.
 * @template T The type of item returned by each page.
 * @param {number} perPage The expected number of items per page; used to detect the last page.
 * @param {(page: number, perPage: number) => Promise<T[]>} getPage Fetches a single page (1-indexed) of results.
 * @returns {Promise<T[]>} All items from every page, concatenated in order.
 */
export const collectPaginated = async <T>(
  perPage: number,
  getPage: (page: number, perPage: number) => Promise<T[]>,
): Promise<T[]> => {
  let page = 1;
  const data: T[] = [];
  do data.push(...(await getPage(page, perPage)));
  while (data.length === page++ * perPage);
  return data;
};
