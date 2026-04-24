export interface PartnerProduct {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  partner: string;
  pricePoints: number;
  category: 'voucher' | 'gift' | 'donation';
}

export const PARTNER_PRODUCTS: PartnerProduct[] = [
  {
    id: 'eco-cafe-discount',
    name: 'Eco Cafe - 20% endirim kuponu',
    description: 'Şəhərin müxtəlif filiallarında 20% endirim üçün kupon.',
    longDescription:
      'Eco Cafe partnyor şəbəkəsində içki və yemək sifarişlərində 20% endirim verir. Kupon aktivləşdirildikdən sonra 14 gün ərzində istifadə edilməlidir.',
    imageUrl: 'https://picsum.photos/seed/aura-eco-cafe/640/420',
    partner: 'Eco Cafe',
    pricePoints: 20,
    category: 'voucher',
  },
  {
    id: 'bookstore-gift',
    name: 'Bookland - 10 AZN hədiyyə kartı',
    description: 'Kitab və aksesuar alış-verişində istifadə edilə bilər.',
    longDescription:
      'Bookland mağazalarında kitab, ofis ləvazimatları və aksesuarlar üçün 10 AZN dəyərində rəqəmsal hədiyyə kartı.',
    imageUrl: 'https://picsum.photos/seed/aura-bookland/640/420',
    partner: 'Bookland',
    pricePoints: 35,
    category: 'voucher',
  },
  {
    id: 'mobility-kit',
    name: 'Mobility care kit',
    description: 'Şəxsi qulluq dəsti: maska, antiseptik və mini ilk yardım.',
    longDescription:
      'Gündəlik istifadə üçün mobil qulluq dəsti. İçində antiseptik, maska, mini ilk yardım vasitələri və faydalı bələdçi kartı var.',
    imageUrl: 'https://picsum.photos/seed/aura-mobility-kit/640/420',
    partner: 'SafeMove Store',
    pricePoints: 45,
    category: 'gift',
  },
  {
    id: 'green-fund',
    name: 'Yaşıl şəhər fonduna ianə',
    description: 'Şəhərin əlçatanlıq və yaşıllaşdırma layihələrinə dəstək.',
    longDescription:
      'Bu ianə ilə ictimai məkanlarda ağaclandırma, kölgə sahələri və piyada zonalarında inklüziv infrastruktur layihələri dəstəklənir.',
    imageUrl: 'https://picsum.photos/seed/aura-green-fund/640/420',
    partner: 'Green City Foundation',
    pricePoints: 60,
    category: 'donation',
  },
  {
    id: 'inclusion-fund',
    name: 'İnklüzivlik fonduna ianə',
    description: 'Məhdud hərəkətli şəxslər üçün infrastruktur layihələrinə ianə.',
    longDescription:
      'İanə məbləği pandus, taktil zolaq, əlçatan keçid və sosial dəstək proqramlarının genişləndirilməsi üçün istifadə olunur.',
    imageUrl: 'https://picsum.photos/seed/aura-inclusion-fund/640/420',
    partner: 'Inclusive Future',
    pricePoints: 80,
    category: 'donation',
  },
  {
    id: 'city-pass',
    name: 'Urban Pass - premium paket',
    description: 'Seçilmiş partnyor xidmətlərində premium üstünlüklər.',
    longDescription:
      'Urban Pass premium paketinə partnyor xidmətlərində xüsusi endirimlər, prioritet rezervasiya və əlavə istifadəçi bonusları daxildir.',
    imageUrl: 'https://picsum.photos/seed/aura-city-pass/640/420',
    partner: 'Urban Partners',
    pricePoints: 100,
    category: 'gift',
  },
];

export function getPartnerProductById(productId: string): PartnerProduct | undefined {
  return PARTNER_PRODUCTS.find((item) => item.id === productId);
}
