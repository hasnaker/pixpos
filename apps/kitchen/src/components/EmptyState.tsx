import { Coffee, ChefHat } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="empty-state">
      <div className="relative">
        <Coffee className="empty-state-icon" />
        <ChefHat className="w-8 h-8 absolute -top-2 -right-2 text-[var(--color-orange)] opacity-60" />
      </div>
      <h2 className="empty-state-title">Bekleyen sipariş yok</h2>
      <p className="empty-state-text">Yeni siparişler burada görünecek</p>
    </div>
  );
}
