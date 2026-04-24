import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PARTNER_PRODUCTS, getPartnerProductById } from '@/features/app/partnersCatalog';
import { useRewardsStore } from '@/stores/rewardsStore';

export function MarketplaceCartPage() {
  const points = useRewardsStore((s) => s.points);
  const cart = useRewardsStore((s) => s.cart);
  const removeFromCart = useRewardsStore((s) => s.removeFromCart);
  const addToCart = useRewardsStore((s) => s.addToCart);
  const checkout = useRewardsStore((s) => s.checkout);

  const rows = cart
    .map((item) => {
      const product = getPartnerProductById(item.productId);
      if (!product) return null;
      return { item, product, lineTotal: item.qty * product.pricePoints };
    })
    .filter(Boolean) as { item: { productId: string; qty: number }; product: (typeof PARTNER_PRODUCTS)[number]; lineTotal: number }[];

  const total = rows.reduce((sum, row) => sum + row.lineTotal, 0);
  const remaining = points - total;

  if (rows.length === 0) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-xl rounded-[var(--r-lg)] border border-dashed border-[var(--navy-border)] p-8 text-center">
          <h1 className="text-[20px] font-semibold text-[var(--text-1)]">Səbət boşdur</h1>
          <p className="mt-2 text-[14px] text-[var(--text-3)]">Məhsul seçmək üçün marketplace səhifəsinə qayıdın.</p>
          <Link
            to="/marketplace"
            className="mt-5 inline-flex rounded-[var(--r-md)] bg-[var(--cyan)] px-4 py-2 text-[13px] font-semibold text-[var(--navy)]"
          >
            Marketplace-ə qayıt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6">
      <h1 className="text-[22px] font-semibold text-[var(--text-1)]">Səbət</h1>
      <section className="space-y-3">
        {rows.map((row) => (
          <motion.article
            key={row.item.productId}
            layout
            className="flex gap-3 rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-3"
          >
            <img src={row.product.imageUrl} alt={row.product.name} className="h-20 w-24 rounded-[var(--r-md)] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[var(--text-1)]">{row.product.name}</p>
              <p className="text-[12px] text-[var(--text-3)]">{row.product.pricePoints} pts x {row.item.qty}</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--cyan)]">{row.lineTotal} pts</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => removeFromCart(row.item.productId)}
                  className="rounded-[var(--r-md)] border border-[var(--navy-border)] px-2 py-1 text-[12px] text-[var(--text-2)]"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => addToCart(row.item.productId, 1)}
                  className="rounded-[var(--r-md)] border border-[var(--navy-border)] px-2 py-1 text-[12px] text-[var(--text-2)]"
                >
                  +1
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-4">
        <div className="flex justify-between text-[14px] text-[var(--text-2)]">
          <span>Toplam</span>
          <span className="font-semibold text-[var(--text-1)]">{total} pts</span>
        </div>
        <div className="mt-2 flex justify-between text-[14px] text-[var(--text-2)]">
          <span>Qalan point</span>
          <span className={remaining >= 0 ? 'font-semibold text-[var(--success)]' : 'font-semibold text-[var(--error)]'}>
            {remaining} pts
          </span>
        </div>
        <button
          type="button"
          disabled={total <= 0 || remaining < 0}
          onClick={() => {
            checkout(total);
          }}
          className="mt-4 h-11 w-full rounded-[var(--r-md)] bg-[var(--cyan)] font-semibold text-[var(--navy)] disabled:opacity-50"
        >
          Checkout / Redeem
        </button>
      </section>
    </div>
  );
}
