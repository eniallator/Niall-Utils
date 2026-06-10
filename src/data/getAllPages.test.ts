import { describe, expect, it, vi } from "vitest";

import { getAllPages } from "./getAllPages";

const getPageFactory = (maxItems: number) => (page: number, perPage: number) =>
  Promise.resolve(
    Array.from(
      { length: Math.min(perPage, maxItems - (page - 1) * perPage) },
      (_, i) => i + (page - 1) * perPage + 1
    )
  );

describe("getAllPages", () => {
  it("returns all items from a single page", async () => {
    const getPage = vi.fn(getPageFactory(5));

    const result = await getAllPages<number>(getPage)(5);
    expect(result).toEqual([1, 2, 3, 4, 5]);
    expect(getPage).toHaveBeenCalledTimes(2);
  });

  it("paginates across multiple full pages", async () => {
    const getPage = vi.fn(getPageFactory(12));

    const result = await getAllPages<number>(getPage)(3);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(getPage).toHaveBeenCalledTimes(5);
  });

  it("returns empty array when first page is empty", async () => {
    const getPage = vi.fn(() => Promise.resolve([]));

    const result = await getAllPages<number>(getPage)(5);
    expect(result).toEqual([]);
    expect(getPage).toHaveBeenCalledOnce();
  });

  it("passes correct page and perPage arguments to getPage", async () => {
    const calls: Array<[number, number]> = [];
    const getPage = vi.fn((page: number, perPage: number) => {
      calls.push([page, perPage]);
      return Promise.resolve([]);
    });

    await getAllPages<number>(getPage)(10);
    expect(getPage).toHaveBeenCalledExactlyOnceWith(1, 10);
  });

  it("accumulates items from multiple pages in order", async () => {
    const getPage = vi.fn((page: number) =>
      Promise.resolve(page === 1 ? [page * 100, page * 100 + 1] : [])
    );

    const result = await getAllPages<number>(getPage)(2);
    expect(result).toEqual([100, 101]);
    expect(getPage).toHaveBeenCalledTimes(2);
  });

  it("works with objects not just primitives", async () => {
    type Item = { id: number; name: string };
    const getPage = vi.fn(
      (page: number): Promise<Item[]> =>
        Promise.resolve(page === 1 ? [{ id: page, name: `item-${page}` }] : [])
    );

    const result = await getAllPages<Item>(getPage)(1);
    expect(result).toEqual([{ id: 1, name: "item-1" }]);
    expect(getPage).toHaveBeenCalledTimes(2);
  });

  it("handles perPage of 1", async () => {
    const getPage = vi.fn(getPageFactory(3));

    const result = await getAllPages<number>(getPage)(1);
    expect(result).toEqual([1, 2, 3]);
    expect(getPage).toHaveBeenCalledTimes(4);
  });

  it("handles large perPage values", async () => {
    const getPage = vi.fn(getPageFactory(1000));

    const result = await getAllPages<number>(getPage)(1000);
    expect(result).toHaveLength(1000);
    expect(getPage).toHaveBeenCalledTimes(2);
  });
});
