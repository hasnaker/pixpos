import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getMenu, getFeaturedProducts } from './services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}

type Page = 'home' | 'menu' | 'category' | 'product' | 'search' | 'branches';

function MainApp() {
  const [page, setPage] = useState<Page>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenu(),
  });

  const navigate = (p: Page, cat?: Category, prod?: Product) => {
    setPage(p);
    if (cat) setSelectedCategory(cat);
    if (prod) setSelectedProduct(prod);
  };

  if (isLoading) return <LoadingScreen />;
  if (!menu?.categories?.length) return <EmptyScreen />;

  return (
    <div className="min-h-screen bg-black">
      <div className="animate-fade-in">
        {page === 'home' && <HomePage menu={menu} navigate={navigate} />}
        {page === 'menu' && <MenuPage menu={menu} navigate={navigate} />}
        {page === 'category' && selectedCategory && <CategoryPage category={selectedCategory} navigate={navigate} />}
        {page === 'product' && selectedProduct && <ProductPage product={selectedProduct} navigate={navigate} />}
        {page === 'search' && <SearchPage menu={menu} navigate={navigate} query={searchQuery} setQuery={setSearchQuery} />}
        {page === 'branches' && <BranchesPage />}
      </div>

      {/* iOS Tab Bar - Compact */}
      <nav className="fixed bottom-0 left-0 right-0 ios-tab-bar z-50 safe-area-bottom">
        <div className="flex justify-around pt-1.5 pb-0.5">
          <TabBarItem 
            icon={<HomeIcon />} 
            label="Ana Sayfa" 
            active={page === 'home'} 
            onClick={() => navigate('home')} 
          />
          <TabBarItem 
            icon={<SearchIcon />} 
            label="Ara" 
            active={page === 'search'} 
            onClick={() => navigate('search')} 
          />
          <TabBarItem 
            icon={<MapIcon />} 
            label="Şubeler" 
            active={page === 'branches'} 
            onClick={() => navigate('branches')} 
          />
        </div>
      </nav>
    </div>
  );
}

// Tab Bar Item
function TabBarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-4 py-0.5 transition-transform active:scale-90">
      <div className={active ? 'text-[#c49f74]' : 'text-[#8e8e93]'}>
        {icon}
      </div>
      <span className={`text-[10px] ${active ? 'text-[#c49f74]' : 'text-[#8e8e93]'}`}>
        {label}
      </span>
    </button>
  );
}

// Icons (SF Symbols style) - Smaller
function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 25 24" fill="none">
      <path d="M12.5 3L3.5 10V21H9.5V15H15.5V21H21.5V10L12.5 3Z" fill="currentColor"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 25 24" fill="none">
      <circle cx="11.5" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M16.5 16L21.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 25 24" fill="none">
      <path d="M12.5 2C8.64 2 5.5 5.14 5.5 9C5.5 14.25 12.5 22 12.5 22C12.5 22 19.5 14.25 19.5 9C19.5 5.14 16.36 2 12.5 2ZM12.5 11.5C11.12 11.5 10 10.38 10 9C10 7.62 11.12 6.5 12.5 6.5C13.88 6.5 15 7.62 15 9C15 10.38 13.88 11.5 12.5 11.5Z" fill="currentColor"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
      <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Loading Screen - Apple style
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-20 h-20 mb-6 animate-scale-in">
        <img src="/queenlogo.svg" alt="Queen Waffle" className="w-full h-full" />
      </div>
      <div className="w-8 h-8 relative">
        <div className="absolute inset-0 border-2 border-[#3a3a3c] rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-[#c49f74] rounded-full animate-spin" />
      </div>
    </div>
  );
}

function EmptyScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 mb-4 opacity-30">
        <img src="/queenlogo.svg" alt="" className="w-full h-full" />
      </div>
      <h2 className="sf-title-3 text-white mb-2">Menü Bulunamadı</h2>
      <p className="sf-subheadline text-[#8e8e93] text-center">Lütfen daha sonra tekrar deneyin.</p>
    </div>
  );
}

// iOS Navigation Bar
function NavBar({ title, onBack, large = false }: { title: string; onBack?: () => void; large?: boolean }) {
  if (large) {
    return (
      <div className="safe-area-top bg-black">
        <div className="px-4 pt-2 pb-2">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-[#c49f74] sf-body mb-2 active:opacity-50 transition-opacity">
              <BackIcon />
              <span>Geri</span>
            </button>
          )}
          <h1 className="sf-large-title text-white">{title}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 ios-nav-bar safe-area-top">
      <div className="flex items-center justify-between h-11 px-4">
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-1 text-[#c49f74] sf-body active:opacity-50 transition-opacity min-w-[60px]">
            <BackIcon />
            <span>Geri</span>
          </button>
        ) : <div className="min-w-[60px]" />}
        <h1 className="sf-headline text-white absolute left-1/2 -translate-x-1/2">{title}</h1>
        <div className="min-w-[60px]" />
      </div>
    </div>
  );
}

// HOME PAGE
function HomePage({ menu, navigate }: { menu: any; navigate: (p: Page, c?: Category, pr?: Product) => void }) {
  // Fetch featured products from API
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getFeaturedProducts(),
  });

  // Use featured products from API, fallback to first 6 products
  const allProducts = menu.categories.flatMap((c: Category) => c.products);
  
  // Waffle kategorisindeki ürünleri öne al
  const waffleCategory = menu.categories.find((c: Category) => 
    c.name.toLowerCase().includes('waffle') || c.name.toLowerCase().includes('klasik')
  );
  const waffleProducts = waffleCategory?.products || [];
  const otherProducts = allProducts.filter((p: Product) => 
    !waffleProducts.some((wp: Product) => wp.id === p.id)
  );
  const sortedProducts = [...waffleProducts, ...otherProducts];
  
  const featured = featuredProducts && featuredProducts.length > 0 
    ? featuredProducts 
    : sortedProducts.slice(0, 6);

  return (
    <div className="pb-16">
      {/* Header with Logo - Compact */}
      <div className="safe-area-top bg-black">
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <img src="/queenlogo.svg" alt="Queen Waffle" className="w-full h-full" />
              </div>
              <div>
                <p className="text-[10px] text-[#8e8e93] uppercase tracking-wider">Hoş Geldiniz</p>
                <h1 className="text-[18px] font-semibold text-white">Queen Waffle</h1>
              </div>
            </div>
            {/* Menu Icon */}
            <button onClick={() => navigate('menu')} className="p-2 active:opacity-50">
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <path d="M1 1H21M1 8H21M1 15H21" stroke="#c49f74" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <button 
            onClick={() => navigate('search')} 
            className="w-full ios-search"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#8e8e93]">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-[15px] text-[rgba(235,235,245,0.3)]">Ürün ara</span>
          </button>
        </div>
      </div>

      {/* Quick Categories - Horizontal Scroll */}
      <div className="px-4 mb-5">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {menu.categories.slice(0, 8).map((cat: Category, index: number) => (
            <button 
              key={cat.id} 
              onClick={() => navigate('category', cat)} 
              className="flex flex-col items-center gap-1.5 min-w-[64px] animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1c1c1e] border border-[#38383a]">
                {cat.products[0]?.imageUrl ? (
                  <img src={cat.products[0].imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🧇</div>
                )}
              </div>
              <span className="text-[11px] text-[#ebebf5] text-center line-clamp-1 max-w-[64px]">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[17px] font-semibold text-white">Öne Çıkanlar</h2>
          <button onClick={() => navigate('menu')} className="text-[13px] text-[#c49f74] active:opacity-50 transition-opacity">
            Tümünü Gör
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {featured.map((product: Product, index: number) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => navigate('product', undefined, product)}
              delay={index * 50}
            />
          ))}
        </div>
      </div>

      {/* Categories List */}
      <div className="px-4">
        <h2 className="sf-title-3 text-white mb-3">Kategoriler</h2>
        <div className="ios-list">
          {menu.categories.map((cat: Category) => (
            <button 
              key={cat.id} 
              onClick={() => navigate('category', cat)} 
              className="ios-list-item w-full"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#2c2c2e] flex-shrink-0">
                {cat.products[0]?.imageUrl ? (
                  <img src={cat.products[0].imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🧇</div>
                )}
              </div>
              <div className="flex-1 text-left py-1">
                <p className="sf-body text-white">{cat.name}</p>
                <p className="sf-caption-1 text-[#8e8e93]">{cat.products.length} ürün</p>
              </div>
              <div className="text-[#48484a]">
                <ChevronRight />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 mt-4">
        <p className="sf-caption-2 text-[#48484a]">Powered by PIXPOS</p>
      </div>
    </div>
  );
}

// Product Card - iOS Style
function ProductCard({ product, onClick, delay = 0 }: { product: Product; onClick: () => void; delay?: number }) {
  return (
    <button 
      onClick={onClick}
      className="ios-card overflow-hidden text-left animate-slide-up active:scale-[0.98] transition-transform"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-[4/3] bg-[#2c2c2e] relative overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🧇</div>
        )}
      </div>
      <div className="p-2">
        <p className="text-[13px] text-white line-clamp-2 min-h-[32px] leading-tight">{product.name}</p>
        <p className="text-[14px] font-semibold text-[#c49f74] mt-0.5">₺{product.price}</p>
      </div>
    </button>
  );
}

// MENU PAGE
function MenuPage({ menu, navigate }: { menu: any; navigate: (p: Page, c?: Category) => void }) {
  return (
    <div className="pb-16">
      <NavBar title="Menü" large />
      <div className="px-4">
        <div className="ios-list">
          {menu.categories.map((cat: Category) => (
            <button 
              key={cat.id} 
              onClick={() => navigate('category', cat)} 
              className="ios-list-item w-full"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#2c2c2e] flex-shrink-0">
                {cat.products[0]?.imageUrl ? (
                  <img src={cat.products[0].imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🧇</div>
                )}
              </div>
              <div className="flex-1 text-left py-1">
                <p className="sf-body text-white">{cat.name}</p>
                <p className="sf-caption-1 text-[#8e8e93]">{cat.products.length} ürün</p>
              </div>
              <div className="text-[#48484a]">
                <ChevronRight />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// CATEGORY PAGE
function CategoryPage({ category, navigate }: { category: Category; navigate: (p: Page, c?: Category, pr?: Product) => void }) {
  return (
    <div className="pb-16">
      <NavBar title={category.name} onBack={() => navigate('menu')} />
      <div className="px-4 pt-4">
        <p className="sf-footnote text-[#8e8e93] mb-4">{category.products.length} ürün</p>
        <div className="grid grid-cols-2 gap-3">
          {category.products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => navigate('product', category, product)}
              delay={index * 30}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// PRODUCT PAGE - iOS Detail View
function ProductPage({ product, navigate }: { product: Product; navigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-black pb-16">
      {/* Hero Image */}
      <div className="relative">
        <div className="aspect-square bg-[#1c1c1e]">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🧇</div>
          )}
        </div>
        
        {/* Back Button - Floating */}
        <button 
          onClick={() => navigate('home')} 
          className="absolute top-4 left-4 w-10 h-10 rounded-full blur-chrome flex items-center justify-center text-white active:scale-90 transition-transform"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
        >
          <BackIcon />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-5 -mt-6 bg-black rounded-t-3xl relative">
        <div className="w-9 h-1 bg-[#3a3a3c] rounded-full mx-auto mb-5" />
        
        <h1 className="sf-title-1 text-white mb-3">{product.name}</h1>
        
        {product.description && (
          <p className="sf-body text-[#8e8e93] mb-5 leading-relaxed">{product.description}</p>
        )}
        
        {/* Price Card */}
        <div className="ios-card p-5 text-center mb-6">
          <p className="sf-caption-1 text-[#8e8e93] uppercase tracking-wider mb-1">Fiyat</p>
          <p className="text-[42px] font-bold text-white tracking-tight">₺{product.price}</p>
        </div>

        {/* Call Waiter */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] rounded-full">
            <span className="sf-footnote text-[#8e8e93]">Sipariş vermek için garson çağırın</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// SEARCH PAGE
function SearchPage({ menu, navigate, query, setQuery }: { menu: any; navigate: (p: Page, c?: Category, pr?: Product) => void; query: string; setQuery: (q: string) => void }) {
  const allProducts = menu.categories.flatMap((c: Category) => c.products);
  const results = query.length > 1 ? allProducts.filter((p: Product) => p.name.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="pb-16">
      {/* Search Header */}
      <div className="safe-area-top bg-black sticky top-0 z-40">
        <div className="px-4 pt-2 pb-3">
          <h1 className="sf-large-title text-white mb-3">Ara</h1>
          <div className="ios-search">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#8e8e93] flex-shrink-0">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün ara"
              autoFocus
            />
            {query && (
              <button 
                onClick={() => setQuery('')} 
                className="w-5 h-5 rounded-full bg-[#636366] flex items-center justify-center flex-shrink-0"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-2">
        {query.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-3 opacity-20">
              <img src="/queenlogo.svg" alt="" className="w-full h-full" />
            </div>
            <p className="sf-body text-[#8e8e93]">Aramak istediğiniz ürünü yazın</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="sf-body text-[#8e8e93]">"{query}" için sonuç bulunamadı</p>
          </div>
        ) : (
          <>
            <p className="sf-footnote text-[#8e8e93] mb-3">{results.length} sonuç</p>
            <div className="grid grid-cols-2 gap-3">
              {results.map((product: Product, index: number) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => navigate('product', undefined, product)}
                  delay={index * 30}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// BRANCHES PAGE
function BranchesPage() {
  const branches = [
    { 
      id: 1, 
      name: 'Kayseri Köşk Şubesi', 
      city: 'Kayseri',
      address: 'Köşk Mah. Sırdar Geçidi Sok.', 
      phone: '', 
      hours: '10:00 - 23:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-kosk-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/n6QNXK3RtU4nFgtR9'
    },
    { 
      id: 2, 
      name: 'Kayseri Talas Şubesi', 
      city: 'Kayseri',
      address: 'Bahçelievler, Mevlana Cd. No:4B', 
      phone: '+90 352 503 92 09', 
      hours: '10:00 - 23:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-talas-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/hC16HuNvEhoYmEnH6'
    },
    { 
      id: 3, 
      name: 'Konya Meram Şubesi', 
      city: 'Konya',
      address: 'Süleyman Şah, Fatih Cd.', 
      phone: '+90 332 320 90 90', 
      hours: '10:00 - 23:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-meram-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/WJmnDnJgNLGVMVL5A'
    },
    { 
      id: 4, 
      name: 'Konya Selçuklu Şubesi', 
      city: 'Konya',
      address: 'Parsana, 42250 Selçuklu/Konya', 
      phone: '+90 332 503 13 00', 
      hours: '10:00 - 23:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-selcuklu-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/QvEutoEgGsSosqT4A'
    },
    { 
      id: 5, 
      name: 'Nevşehir Ürgüp Şubesi', 
      city: 'Nevşehir',
      address: 'Temenni, Kazım Karabekir Cd. No:1', 
      phone: '+90 541 341 78 36', 
      hours: '10:00 - 23:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-urgup-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/C1MxrZsjLhto8rCm6'
    },
    { 
      id: 6, 
      name: 'Gaziantep İbrahimli Şubesi', 
      city: 'Gaziantep',
      address: 'Emek, İbrahimli Yolu Cd. No:11 Şehitkamil', 
      phone: '+90 342 322 96 62', 
      hours: '10:00 - 23:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-gaziantep-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/Cejjvd4XPRDJxyC59'
    },
    { 
      id: 7, 
      name: 'Sivas Merkez Şubesi', 
      city: 'Sivas',
      address: 'Yenişehir Mah. Üstad Sok. İskaMall Yaşam Mrk.', 
      phone: '+90 346 502 43 49', 
      hours: '10:00 - 22:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-sivas-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/zufdmGY3CFzgwqbR6'
    },
    { 
      id: 8, 
      name: 'Ankara Çayyolu Şubesi', 
      city: 'Ankara',
      address: 'Prf. Ahmet Taner Kışlalı Mah. Dora Park İş Mrk.', 
      phone: '', 
      hours: '10:00 - 22:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-ankara-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/4LXfyymc34NFMdAk6'
    },
    { 
      id: 9, 
      name: 'Bursa Özlüce Şubesi', 
      city: 'Bursa',
      address: 'Özlüce, 29 Ekim Mah. 402. SK. NO:3 B', 
      phone: '+90 537 060 22 02', 
      hours: '10:00 - 23:00',
      image: 'https://wafflequeen.com.tr/assets/images/queen-waffle-bursa-subesi.jpeg',
      mapUrl: 'https://maps.app.goo.gl/rjMwzN4SWdv2sBTv8'
    },
  ];

  // Group branches by city
  const citiesWithBranches = branches.reduce((acc, branch) => {
    if (!acc[branch.city]) acc[branch.city] = [];
    acc[branch.city].push(branch);
    return acc;
  }, {} as Record<string, typeof branches>);

  const openMaps = (url: string) => {
    window.open(url, '_blank');
  };

  const callPhone = (phone: string) => {
    if (phone) window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  return (
    <div className="pb-16">
      <NavBar title="Şubeler" large />
      
      <div className="px-4">
        <p className="sf-footnote text-[#8e8e93] mb-4">{branches.length} şube</p>
        
        {Object.entries(citiesWithBranches).map(([city, cityBranches]) => (
          <div key={city} className="mb-6">
            <h3 className="sf-headline text-[#c49f74] mb-3">{city}</h3>
            <div className="space-y-3">
              {cityBranches.map((branch, index) => (
                <div 
                  key={branch.id} 
                  className="ios-card overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Branch Image */}
                  <div className="aspect-[16/9] bg-[#2c2c2e] relative overflow-hidden">
                    <img 
                      src={branch.image} 
                      alt={branch.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h4 className="sf-headline text-white mb-3">{branch.name}</h4>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-[#8e8e93] mt-0.5">📍</span>
                        <p className="sf-subheadline text-[#ebebf5]">{branch.address}</p>
                      </div>
                      {branch.phone && (
                        <div className="flex items-center gap-3">
                          <span className="text-[#8e8e93]">📞</span>
                          <p className="sf-subheadline text-[#ebebf5]">{branch.phone}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-[#8e8e93]">🕐</span>
                        <p className="sf-subheadline text-[#ebebf5]">{branch.hours}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => openMaps(branch.mapUrl)}
                        className="flex-1 ios-button ios-button-filled"
                      >
                        Yol Tarifi
                      </button>
                      {branch.phone && (
                        <button 
                          onClick={() => callPhone(branch.phone)}
                          className="flex-1 ios-button ios-button-gray"
                        >
                          Ara
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-8 mt-4">
        <p className="sf-caption-2 text-[#48484a]">Powered by PIXPOS</p>
      </div>
    </div>
  );
}
