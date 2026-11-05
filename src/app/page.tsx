import { Suspense } from "react";
import { CatalogBrowser } from "@/features/catalog/catalog-browser";
import { PageShell } from "@/ui/page-shell";

export default function Home() {
  return (
    <PageShell>
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Drolly
          </h1>
          <p className="max-w-prose text-sm leading-6 text-muted sm:text-base sm:leading-7">
            Browse active products. Cash on delivery checkout comes in a later
            phase.
          </p>
        </div>
      </header>
      <Suspense fallback={<CatalogFallback />}>
        <CatalogBrowser />
      </Suspense>
    </PageShell>
  );
}

function CatalogFallback() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="h-11 max-w-md rounded-md bg-border/70" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li className="h-64 rounded-lg bg-border/70" />
        <li className="h-64 rounded-lg bg-border/70" />
        <li className="hidden h-64 rounded-lg bg-border/70 lg:block" />
      </ul>
    </div>
  );
}
