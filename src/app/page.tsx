import { Suspense } from "react";
import { CatalogBrowser } from "@/features/catalog/catalog-browser";
import { HomeIntro } from "@/features/catalog/home-intro";
import { CatalogSkeleton } from "@/ui/skeleton";
import { PageShell } from "@/ui/page-shell";

export default function Home() {
  return (
    <PageShell>
      <HomeIntro />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogBrowser />
      </Suspense>
    </PageShell>
  );
}
