import { cx } from "@/ui/cx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-md", className)} />;
}

export function CatalogSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <li>
        <Skeleton className="h-72 rounded-lg" />
      </li>
      <li>
        <Skeleton className="h-72 rounded-lg" />
      </li>
      <li className="hidden lg:block">
        <Skeleton className="h-72 rounded-lg" />
      </li>
    </ul>
  );
}
