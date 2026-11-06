"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { placeOrder } from "@/features/checkout/api";
import { invalidateOrderQueries } from "@/features/orders/api";

export function useCheckoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: async () => {
      await invalidateOrderQueries(queryClient);
    },
  });
}
