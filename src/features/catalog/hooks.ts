"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { fetchCategories, fetchProduct, fetchProducts } from "@/features/catalog/api";
import { catalogQueryKey } from "@/features/catalog/query-keys";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: catalogQueryKey.categories(),
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}

export function useProductListQuery(input: {
  q: string;
  category?: string;
  sort: string;
}) {
  return useInfiniteQuery({
    queryKey: catalogQueryKey.products(input),
    queryFn: ({ pageParam }) =>
      fetchProducts({
        q: input.q || undefined,
        category: input.category,
        sort: input.sort,
        page: pageParam,
      }),
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });
}

export function useProductQuery(idOrSlug: string) {
  return useQuery({
    queryKey: catalogQueryKey.product(idOrSlug),
    queryFn: () => fetchProduct(idOrSlug),
    enabled: idOrSlug.length > 0,
  });
}
