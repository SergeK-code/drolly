import { Suspense } from "react";
import { ProductDetail } from "@/features/catalog/product-detail";
import { PageShell } from "@/ui/page-shell";
import { TextLink } from "@/ui/text-link";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <PageShell>
      <TextLink href="/" className="text-sm">
        Back to catalog
      </TextLink>
      <Suspense fallback={<p className="text-base text-muted">Loading product…</p>}>
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
