import { Suspense } from "react";
import { CatalogBrowser } from "@/ui/catalog/catalog-browser";
import { HomeIntro } from "@/ui/catalog/home-intro";
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
