"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelOwnOrder,
  createAddress,
  fetchAddresses,
  fetchOrder,
  fetchOrders,
  invalidateOrderQueries,
  ordersQueryKey,
} from "@/features/orders/api";

export function useAddressesQuery() {
  return useQuery({
    queryKey: ordersQueryKey.addresses(),
    queryFn: fetchAddresses,
  });
}

export function useOrdersQuery() {
  return useQuery({
    queryKey: ordersQueryKey.list(),
    queryFn: () => fetchOrders(1),
  });
}

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: ordersQueryKey.detail(id),
    queryFn: () => fetchOrder(id),
    enabled: id.length > 0,
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ordersQueryKey.addresses(),
      });
    },
  });
}

export function useCancelOrderMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelOwnOrder(id),
    onSuccess: async () => {
      await invalidateOrderQueries(queryClient);
    },
  });
}
