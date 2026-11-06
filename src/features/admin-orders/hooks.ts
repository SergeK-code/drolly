"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchAdminOrder,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "@/features/admin-orders/api";
import { invalidateOrderQueries, ordersQueryKey } from "@/features/orders/api";
import type { OrderStatusCode } from "@/lib/order-status";

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

export function useUpdateOrderStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatusCode) => updateAdminOrderStatus(id, status),
    onSuccess: async () => {
      await invalidateOrderQueries(queryClient);
    },
  });
}
