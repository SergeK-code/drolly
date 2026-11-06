"use client";

import { useState } from "react";
import type { AdminProduct } from "@/features/admin-catalog/api";
import { AdminApiError } from "@/features/admin-catalog/api";
import { ProductForm } from "@/features/admin-catalog/product-form";
import {
  useAdminCategoriesQuery,
  useAdminProductsQuery,
  useDeleteProductMutation,
  useSetProductActiveMutation,
} from "@/features/admin-catalog/hooks";
import { AdminPanel, AdminTableCard } from "@/features/admin/admin-panel";
import { Badge } from "@/ui/badge";
import { catalogImageUrl } from "@/lib/catalog-media";
import { Button } from "@/ui/button";
import { ConfirmModal } from "@/ui/confirm-modal";
import { QueryState } from "@/ui/error-retry";
import { MediaImage } from "@/ui/media-image";
import { Modal } from "@/ui/modal";
import { useToast } from "@/ui/toast";

function formatPrice(priceMinor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(priceMinor / 100);
}

export function ProductTable() {
  const query = useAdminProductsQuery();
  const categoriesQuery = useAdminCategoriesQuery();
  const deleteMutation = useDeleteProductMutation();
  const activeMutation = useSetProductActiveMutation();
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [removing, setRemoving] = useState<AdminProduct | null>(null);
  const [toggling, setToggling] = useState<AdminProduct | null>(null);

  const categories = categoriesQuery.data?.items ?? [];

  async function onDelete() {
    if (!removing) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(removing.id);
      showToast("success", "Product deleted.");
      setRemoving(null);
    } catch (error) {
      showToast(
        "error",
        error instanceof AdminApiError || error instanceof Error
          ? error.message
          : "The request failed.",
      );
    }
  }

  async function onSetActive(product: AdminProduct, isActive: boolean) {
    try {
      await activeMutation.mutateAsync({ id: product.id, isActive });
      showToast(
        "success",
        isActive ? "Product activated." : "Product deactivated.",
      );
      setToggling(null);
    } catch (error) {
      showToast(
        "error",
        error instanceof AdminApiError || error instanceof Error
          ? error.message
          : "The request failed.",
      );
    }
  }

  return (
    <AdminPanel
      title="Products"
      description="Create, edit, activate, deactivate, and delete catalog products."
      action={
        <Button onClick={() => setCreateOpen(true)} className="w-fit">
          New product
        </Button>
      }
    >
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading products…"
        errorMessage="Could not load products."
        onRetry={() => void query.refetch()}
      >
        <>
      {query.data?.items.length === 0 ? (
        <AdminTableCard>
          <p className="px-4 py-8 text-sm text-muted">No products yet.</p>
        </AdminTableCard>
      ) : null}

      {query.data && query.data.items.length > 0 ? (
        <AdminTableCard>
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-surface">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <MediaImage
                        src={catalogImageUrl(product.slug, product.imagePath)}
                        alt=""
                        zoom={false}
                        className="h-10 w-10 shrink-0 rounded-md"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.categoryName}</td>
                  <td className="px-4 py-3">
                    {formatPrice(product.priceMinor, product.currency)}
                  </td>
                  <td className="px-4 py-3">{product.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <Badge tone={product.isActive ? "success" : "neutral"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditing(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          product.isActive
                            ? setToggling(product)
                            : void onSetActive(product, true)
                        }
                      >
                        {product.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRemoving(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableCard>
      ) : null}
        </>
      </QueryState>

      <Modal
        open={createOpen}
        title="New product"
        onClose={() => setCreateOpen(false)}
      >
        {categoriesQuery.isPending ? (
          <p className="text-sm text-muted">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted">
            Create a category before adding a product.
          </p>
        ) : (
          <ProductForm
            categories={categories}
            onSaved={() => setCreateOpen(false)}
          />
        )}
      </Modal>
      <Modal
        open={Boolean(editing)}
        title="Edit product"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <ProductForm
            key={editing.id}
            product={editing}
            categories={categories}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </Modal>
      <ConfirmModal
        open={Boolean(removing)}
        title="Delete product"
        message={`Permanently delete “${removing?.name ?? ""}”? Past orders keep the product name.`}
        confirmLabel="Delete"
        pending={deleteMutation.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => void onDelete()}
      />
      <ConfirmModal
        open={Boolean(toggling)}
        title="Deactivate product"
        message={`Deactivate “${toggling?.name ?? ""}”? It will be hidden from the public catalog.`}
        confirmLabel="Deactivate"
        pending={activeMutation.isPending}
        onClose={() => setToggling(null)}
        onConfirm={() => toggling && void onSetActive(toggling, false)}
      />
    </AdminPanel>
  );
}
