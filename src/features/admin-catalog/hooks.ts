"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCategory,
  deleteAdminCategory,
  deleteAdminProduct,
  createAdminProduct,
  setAdminCategoryActive,
  setAdminProductActive,
  fetchAdminCategories,
  fetchAdminCategory,
  fetchAdminProduct,
  fetchAdminProducts,
  invalidateCatalogQueries,
  updateAdminCategory,
  updateAdminProduct,
} from "@/features/admin-catalog/api";
import { adminCatalogQueryKey } from "@/features/admin-catalog/query-keys";

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminCatalogQueryKey.categories(),
    queryFn: fetchAdminCategories,
  });
}

export function useAdminCategoryQuery(id: string) {
  return useQuery({
    queryKey: adminCatalogQueryKey.category(id),
    queryFn: () => fetchAdminCategory(id),
    enabled: id.length > 0,
  });
}

export function useAdminProductsQuery() {
  return useQuery({
    queryKey: adminCatalogQueryKey.products(),
    queryFn: fetchAdminProducts,
  });
}

export function useAdminProductQuery(id: string) {
  return useQuery({
    queryKey: adminCatalogQueryKey.product(id),
    queryFn: () => fetchAdminProduct(id),
    enabled: id.length > 0,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCategory,
    onSuccess: async () => {
      await invalidateCatalogQueries(queryClient);
    },
  });
}

export function useUpdateCategoryMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateAdminCategory>[1]) =>
      updateAdminCategory(id, input),
    onSuccess: async () => {
      await invalidateCatalogQueries(queryClient);
    },
  });
}

export function useSetCategoryActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setAdminCategoryActive(id, isActive),
    onSuccess: async () => {
      await invalidateCatalogQueries(queryClient);
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: async () => {
      await invalidateCatalogQueries(queryClient);
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminProduct,
    onSuccess: async ({ product }) => {
      await invalidateCatalogQueries(queryClient, product);
    },
  });
}

export function useUpdateProductMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateAdminProduct>[1]) =>
      updateAdminProduct(id, input),
    onSuccess: async ({ product }) => {
      await invalidateCatalogQueries(queryClient, product);
    },
  });
}

export function useSetProductActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setAdminProductActive(id, isActive),
    onSuccess: async ({ product }) => {
      await invalidateCatalogQueries(queryClient, product);
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: async () => {
      await invalidateCatalogQueries(queryClient);
    },
  });
}
