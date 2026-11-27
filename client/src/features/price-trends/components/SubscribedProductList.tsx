import { SubscribedProductItem } from '@/features/price-trends/components/SubscribedProductItem';
import type { SubscribedProduct } from '@/features/price-trends/types';

/** Tall white card on the right (all products with their subscription status); it grows with its rows and scrolls with the page. */
export function SubscribedProductList({ products }: { products: SubscribedProduct[] }) {
  return (
    <section aria-label="Products" className="rounded-xl border border-dash-hairline bg-dash-surface px-5 py-6">
      {products.length === 0 ? (
        <p className="py-6 text-center text-sm text-dash-subtle">No products in this category.</p>
      ) : (
        <ul className="grid">
          {products.map((product) => (
            <SubscribedProductItem key={product.id} product={product} />
          ))}
        </ul>
      )}
    </section>
  );
}
