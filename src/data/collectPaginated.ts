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
