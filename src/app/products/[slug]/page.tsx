import { Suspense } from "react";
import { ProductDetail } from "@/features/catalog/product-detail";
import { PageShell } from "@/ui/page-shell";
import { BackLink } from "@/ui/text-link";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <PageShell>
      <BackLink href="/">Back to catalog</BackLink>
      <Suspense
        fallback={
          <p className="text-sm text-muted" aria-busy="true">
            Loading product…
          </p>
        }
      >
        <ProductFromParams params={params} />
      </Suspense>
    </PageShell>
  );
}

async function ProductFromParams({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
