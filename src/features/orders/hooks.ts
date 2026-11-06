"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cancelOwnOrder,
  createAddress,
  fetchAddresses,
  fetchAdminOrder,
  fetchAdminOrders,
  fetchOrder,
  fetchOrders,
  invalidateOrderQueries,
  placeOrder,
  updateAdminOrderStatus,
  ordersQueryKey,
} from "@/features/orders/api";
import type { OrderStatusCode } from "@/lib/order-status";

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

export function useAdminOrdersQuery(status?: string) {
  return useQuery({
    queryKey: [...ordersQueryKey.admin(), status ?? "all"],
    queryFn: () => fetchAdminOrders({ page: 1, status }),
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrderQuery(id: string) {
  return useQuery({
    queryKey: ordersQueryKey.adminDetail(id),
    queryFn: () => fetchAdminOrder(id),
    enabled: id.length > 0,
  });
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: async () => {
      await invalidateOrderQueries(queryClient);
    },
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

export function useUpdateOrderStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatusCode) => updateAdminOrderStatus(id, status),
    onSuccess: async () => {
      await invalidateOrderQueries(queryClient);
    },
  });
}
