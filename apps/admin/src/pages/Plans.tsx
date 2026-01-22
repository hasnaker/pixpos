import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '₺0',
    period: '/ay',
    description: 'Küçük işletmeler için başlangıç',
    features: [
      '5 kullanıcı',
      '20 masa',
      '100 ürün',
      'Temel raporlar',
      'E-posta desteği',
    ],
    limits: {
      users: 5,
      tables: 20,
      products: 100,
    },
    color: 'border-white/20',
    buttonColor: 'bg-white/10 hover:bg-white/20',
  },
  {
    name: 'Starter',
    price: '₺299',
    period: '/ay',
    description: 'Büyüyen işletmeler için',
    features: [
      '10 kullanıcı',
      '50 masa',
      '500 ürün',
      'Gelişmiş raporlar',
      'Öncelikli destek',
      'QR Menü',
    ],
    limits: {
      users: 10,
      tables: 50,
      products: 500,
    },
    color: 'border-[#0A84FF]',
    buttonColor: 'bg-[#0A84FF] hover:bg-[#0A84FF]/90',
    popular: true,
  },
  {
    name: 'Professional',
    price: '₺599',
    period: '/ay',
    description: 'Profesyonel işletmeler için',
    features: [
      '25 kullanıcı',
      '100 masa',
      'Sınırsız ürün',
      'Tüm raporlar',
      '7/24 destek',
      'QR Menü',
      'Çoklu şube',
      'API erişimi',
    ],
    limits: {
      users: 25,
      tables: 100,
      products: 9999,
    },
    color: 'border-[#30D158]',
    buttonColor: 'bg-[#30D158] hover:bg-[#30D158]/90',
  },
  {
    name: 'Enterprise',
    price: 'Özel',
    period: '',
    description: 'Kurumsal çözümler',
    features: [
      'Sınırsız kullanıcı',
      'Sınırsız masa',
      'Sınırsız ürün',
      'Özel raporlar',
      'Dedicated destek',
      'Tüm özellikler',
      'Özel entegrasyonlar',
      'SLA garantisi',
    ],
    limits: {
      users: 9999,
      tables: 9999,
      products: 9999,
    },
    color: 'border-[#BF5AF2]',
    buttonColor: 'bg-[#BF5AF2] hover:bg-[#BF5AF2]/90',
  },
];

export default function Plans() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Planlar</h1>
        <p className="text-white/40 mt-1">Müşterilere sunulan plan seçenekleri</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white/6 backdrop-blur-xl border-2 ${plan.color} rounded-2xl p-6 flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0A84FF] text-white text-xs font-medium rounded-full">
                Popüler
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-white/40">{plan.period}</span>
              </div>
              <p className="text-white/40 text-sm mt-2">{plan.description}</p>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#30D158]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#30D158]" />
                  </div>
                  <span className="text-white/70 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/8">
              <div className="text-white/40 text-xs mb-3">Limitler:</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/4 rounded-lg p-2">
                  <div className="text-white font-semibold">{plan.limits.users === 9999 ? '∞' : plan.limits.users}</div>
                  <div className="text-white/40 text-xs">Kullanıcı</div>
                </div>
                <div className="bg-white/4 rounded-lg p-2">
                  <div className="text-white font-semibold">{plan.limits.tables === 9999 ? '∞' : plan.limits.tables}</div>
                  <div className="text-white/40 text-xs">Masa</div>
                </div>
                <div className="bg-white/4 rounded-lg p-2">
                  <div className="text-white font-semibold">{plan.limits.products === 9999 ? '∞' : plan.limits.products}</div>
                  <div className="text-white/40 text-xs">Ürün</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-12 text-center">
        <p className="text-white/40 text-sm">
          Plan değişiklikleri için store detay sayfasından düzenleme yapabilirsiniz.
        </p>
      </div>
    </div>
  );
}
