"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  accountQueryKey,
  deleteAddress,
  fetchProfile,
  invalidateAccountQueries,
  updateAddress,
  updateProfile,
} from "@/features/account/api";

export function useProfileQuery() {
  return useQuery({
    queryKey: accountQueryKey.profile(),
    queryFn: fetchProfile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await invalidateAccountQueries(queryClient);
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof updateAddress>[1];
    }) => updateAddress(id, input),
    onSuccess: async () => {
      await invalidateAccountQueries(queryClient);
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: async () => {
      await invalidateAccountQueries(queryClient);
    },
  });
}
