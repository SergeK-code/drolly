"use client";

import { useState } from "react";
import type { AdminCategory } from "@/features/admin-catalog/api";
import { AdminApiError } from "@/features/admin-catalog/api";
import { CategoryForm } from "@/features/admin-catalog/category-form";
import {
  useAdminCategoriesQuery,
  useDeleteCategoryMutation,
  useSetCategoryActiveMutation,
} from "@/features/admin-catalog/hooks";
import { AdminPanel, AdminTableCard } from "@/features/admin/admin-panel";
import { Button } from "@/ui/button";
import { ConfirmModal } from "@/ui/confirm-modal";
import { Modal } from "@/ui/modal";
import { QueryState } from "@/ui/error-retry";
import { useToast } from "@/ui/toast";

export function CategoryTable() {
  const query = useAdminCategoriesQuery();
  const deleteMutation = useDeleteCategoryMutation();
  const activeMutation = useSetCategoryActiveMutation();
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [removing, setRemoving] = useState<AdminCategory | null>(null);
  const [inUse, setInUse] = useState<AdminCategory | null>(null);
  const [toggling, setToggling] = useState<AdminCategory | null>(null);

  async function onDelete() {
    if (!removing) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(removing.id);
      showToast("success", "Category deleted.");
      setRemoving(null);
    } catch (error) {
      if (error instanceof AdminApiError && error.code === "CONFLICT") {
        setInUse(removing);
        setRemoving(null);
        return;
      }

      showToast(
        "error",
        error instanceof Error ? error.message : "The request failed.",
      );
    }
  }

  async function onSetActive(category: AdminCategory, isActive: boolean) {
    try {
      await activeMutation.mutateAsync({ id: category.id, isActive });
      showToast(
        "success",
        isActive ? "Category activated." : "Category deactivated.",
      );
      setToggling(null);
      setInUse(null);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "The request failed.",
      );
    }
  }

  return (
    <AdminPanel
      title="Categories"
      description="Create, edit, activate, deactivate, and delete store categories."
      action={
        <Button onClick={() => setCreateOpen(true)} className="w-fit">
          New category
        </Button>
      }
    >
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading categories…"
        errorMessage="Could not load categories."
        onRetry={() => void query.refetch()}
      >
        <>
          {query.data?.items.length === 0 ? (
            <AdminTableCard>
              <p className="px-4 py-8 text-sm text-muted">No categories yet.</p>
            </AdminTableCard>
          ) : null}

          {query.data && query.data.items.length > 0 ? (
            <AdminTableCard>
              <table className="w-full min-w-xl border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-background">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-muted">{category.slug}</td>
                      <td className="px-4 py-3">
                        {category.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditing(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              category.isActive
                                ? setToggling(category)
                                : void onSetActive(category, true)
                            }
                          >
                            {category.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRemoving(category)}
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
        title="New category"
        onClose={() => setCreateOpen(false)}
      >
        <CategoryForm onSaved={() => setCreateOpen(false)} />
      </Modal>
      <Modal
        open={Boolean(editing)}
        title="Edit category"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <CategoryForm
            key={editing.id}
            category={editing}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </Modal>
      <ConfirmModal
        open={Boolean(removing)}
        title="Delete category"
        message={`Permanently delete “${removing?.name ?? ""}”? If products use this category, it will not be removed.`}
        confirmLabel="Delete"
        pending={deleteMutation.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => void onDelete()}
      />
      <Modal
        open={Boolean(inUse)}
        title="Cannot delete category"
        onClose={() => setInUse(null)}
      >
        <p className="mb-5 text-sm leading-6 text-muted">
          “{inUse?.name ?? ""}” cannot be deleted because it is used by
          products. Deactivate it to hide it from the public catalog.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setInUse(null)}>
            Cancel
          </Button>
          {inUse?.isActive ? (
            <Button
              onClick={() => void onSetActive(inUse, false)}
              disabled={activeMutation.isPending}
            >
              {activeMutation.isPending ? "Working…" : "Deactivate"}
            </Button>
          ) : null}
        </div>
      </Modal>
      <ConfirmModal
        open={Boolean(toggling)}
        title="Deactivate category"
        message={`Deactivate “${toggling?.name ?? ""}”? It will be hidden from the public catalog.`}
        confirmLabel="Deactivate"
        pending={activeMutation.isPending}
        onClose={() => setToggling(null)}
        onConfirm={() => toggling && void onSetActive(toggling, false)}
      />
    </AdminPanel>
  );
}
