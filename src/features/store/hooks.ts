"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminDashboard,
  fetchAdminStoreSettings,
  fetchPublicStoreSettings,
  invalidateStoreQueries,
  storeQueryKey,
  updateAdminStoreSettings,
  type PublicStoreSettings,
} from "@/features/store/api";

export function usePublicStoreSettingsQuery() {
  return useQuery({
    queryKey: storeQueryKey.public(),
    queryFn: fetchPublicStoreSettings,
    staleTime: 5 * 60_000,
  });
}

export function useAdminStoreSettingsQuery() {
  return useQuery({
    queryKey: storeQueryKey.admin(),
    queryFn: fetchAdminStoreSettings,
  });
}

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: storeQueryKey.dashboard(),
    queryFn: fetchAdminDashboard,
  });
}

export function useUpdateStoreSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublicStoreSettings) =>
      updateAdminStoreSettings(input),
    onSuccess: async () => {
      await invalidateStoreQueries(queryClient);
    },
  });
}
