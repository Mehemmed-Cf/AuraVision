import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PARTNER_PRODUCTS,
  type PartnerProduct,
} from '@/features/app/partnersCatalog';
import { useRewardsStore } from '@/stores/rewardsStore';

type FilterKey = 'all' | 'donation' | 'voucher' | 'gift';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Hamısı' },
  { key: 'donation', label: 'Donations' },
  { key: 'voucher', label: 'Vouchers' },
  { key: 'gift', label: 'Gifts' },
];

function ProductModal({
  product,
  userPoints,
  onClose,
  onAdd,
}: {
  product: PartnerProduct;
  userPoints: number;
  onClose: () => void;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const total = qty * product.pricePoints;
  const disabled = total > userPoints;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(0,0,0,0.55)] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-xl rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-5"
          initial={{ y: 20, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 14, opacity: 0, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
        >
          <img src={product.imageUrl} alt={product.name} className="h-48 w-full rounded-[var(--r-md)] object-cover" />
          <h3 className="mt-4 text-[20px] font-semibold text-[var(--text-1)]">{product.name}</h3>
          <p className="mt-2 text-[14px] text-[var(--text-2)]">{product.longDescription}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-[var(--cyan-dim)] px-3 py-1 text-[13px] font-semibold text-[var(--cyan)]">
              {product.pricePoints} pts / ədəd
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="h-9 w-9 rounded-[var(--r-md)] border border-[var(--navy-border)] text-[var(--text-1)]"
              >
                -
              </button>
              <span className="min-w-8 text-center text-[14px] text-[var(--text-1)]">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((v) => v + 1)}
                className="h-9 w-9 rounded-[var(--r-md)] border border-[var(--navy-border)] text-[var(--text-1)]"
              >
                +
              </button>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-[var(--text-3)]">Toplam: {total} pts</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAdd(qty)}
            className="mt-4 h-11 w-full rounded-[var(--r-md)] bg-[var(--cyan)] font-semibold text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled ? 'Point kifayət deyil' : 'Səbətə əlavə et'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function MarketplacePage() {
  const points = useRewardsStore((s) => s.points);
  const cart = useRewardsStore((s) => s.cart);
  const addToCart = useRewardsStore((s) => s.addToCart);

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeProduct, setActiveProduct] = useState<PartnerProduct | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return PARTNER_PRODUCTS;
    return PARTNER_PRODUCTS.filter((p) => p.category === activeFilter);
  }, [activeFilter]);
  const donationItems = useMemo(
    () => PARTNER_PRODUCTS.filter((p) => p.category === 'donation'),
    [],
  );

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return (
    <div className="space-y-5 px-4 py-6">
      <section className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--text-1)]">Partners Marketplace</h1>
            <p className="mt-1 text-[14px] text-[var(--text-2)]">Yığdığınız point-ləri məhsula və ianəyə çevirin.</p>
          </div>
          <Link
            to="/marketplace/cart"
            className="inline-flex items-center gap-2 rounded-[var(--r-md)] border border-[var(--navy-border)] px-3 py-2 text-[13px] text-[var(--cyan)] hover:border-[var(--cyan)]"
          >
            <ShoppingCart className="h-4 w-4" />
            Səbət ({cartCount})
          </Link>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-[var(--text-2)]">
            <Star className="h-4 w-4 text-[var(--cyan)]" />
            Cari bal: <span className="font-semibold text-[var(--cyan)]">{points}/100 pts</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--navy-raised)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${points}%` }}
              transition={{ duration: 0.35 }}
              className="h-full rounded-full bg-[var(--cyan)]"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={[
              'rounded-full border px-3 py-1.5 text-[13px]',
              activeFilter === filter.key
                ? 'border-[var(--cyan)] bg-[var(--cyan-dim)] text-[var(--cyan)]'
                : 'border-[var(--navy-border)] text-[var(--text-2)]',
            ].join(' ')}
          >
            {filter.label}
          </button>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--r-md)] border border-dashed border-[var(--navy-border)] p-8 text-center text-[14px] text-[var(--text-3)]">
          Seçilən filter üçün məhsul tapılmadı.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => {
            const disabled = product.pricePoints > points;
            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)]"
              >
                <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[var(--text-1)]">{product.name}</h3>
                    <p className="mt-1 text-[13px] text-[var(--text-2)]">{product.description}</p>
                  </div>
                  <p className="text-[13px] font-semibold text-[var(--cyan)]">{product.pricePoints} pts</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => addToCart(product.id, 1)}
                      className="h-10 flex-1 rounded-[var(--r-md)] bg-[var(--cyan)] text-[13px] font-semibold text-[var(--navy)] disabled:opacity-50"
                    >
                      Səbətə əlavə et
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveProduct(product)}
                      className="h-10 rounded-[var(--r-md)] border border-[var(--navy-border)] px-3 text-[13px] text-[var(--text-2)] hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-5">
        <h2 className="text-[18px] font-semibold text-[var(--text-1)]">Donation Funds</h2>
        <p className="mt-2 text-[14px] text-[var(--text-2)]">
          İanə məhsullarını seçərək point-lərinizi sosial fondlara yönləndirə bilərsiniz.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {donationItems.map((donation) => (
            <div
              key={donation.id}
              className="rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-raised)] p-3"
            >
              <p className="text-[14px] font-semibold text-[var(--text-1)]">{donation.name}</p>
              <p className="mt-1 text-[12px] text-[var(--text-3)]">{donation.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--cyan)]">{donation.pricePoints} pts</span>
                <button
                  type="button"
                  disabled={donation.pricePoints > points}
                  onClick={() => addToCart(donation.id, 1)}
                  className="rounded-[var(--r-md)] bg-[var(--cyan)] px-3 py-1.5 text-[12px] font-semibold text-[var(--navy)] disabled:opacity-50"
                >
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeProduct ? (
        <ProductModal
          product={activeProduct}
          userPoints={points}
          onClose={() => setActiveProduct(null)}
          onAdd={(qty) => {
            addToCart(activeProduct.id, qty);
            setActiveProduct(null);
          }}
        />
      ) : null}
    </div>
  );
}
