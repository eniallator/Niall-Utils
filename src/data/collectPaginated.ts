import { raise } from "../core/utils.ts";

/**
 * Repeatedly calls `getPage` with an incrementing page number, collecting every page's results into a single
 * array until a page returns fewer than `perPage` items.
 * @template T The type of item returned by each page.
 * @param {number} perPage The expected number of items per page; used to detect the last page. Must be greater than `0`.
 * @param {(page: number, perPage: number) => Promise<T[]>} getPage Fetches a single page (1-indexed) of results.
 * @param {(data: T[], page: number) => boolean} hasMoreData Should the loop run again?
 * @returns {Promise<T[]>} All items from every page, concatenated in order.
 * @throws {Error} If `perPage` isn't greater than `0`.
 */
export const collectPaginated = async <T>(
  perPage: number,
  getPage: (page: number, perPage: number) => Promise<T[]>,
  hasMoreData: (data: T[], page: number) => boolean = (data, page) =>
    data.length === page * perPage
): Promise<T[]> => {
  if (perPage <= 0) {
    raise(new Error(`perPage must be greater than 0, got ${perPage}`));
  }

  let page = 1;
  const data: T[] = [];
  do data.push(...(await getPage(page, perPage)));
  while (hasMoreData(data, page++));
  return data;
};
