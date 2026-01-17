import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  UtensilsCrossed,
  Printer,
  BarChart3,
  Settings,
  Users,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reports', icon: BarChart3, label: 'Raporlar' },
  { to: '/products', icon: Package, label: 'Ürünler' },
  { to: '/categories', icon: FolderTree, label: 'Kategoriler' },
  { to: '/tables', icon: UtensilsCrossed, label: 'Masalar' },
  { to: '/printers', icon: Printer, label: 'Yazıcılar' },
];

// PIXPOS Logo
const PixposLogo = ({ size = 36 }: { size?: number }) => (
  <svg viewBox="0 0 1000 1000" width={size} height={size}>
    <path d="M224.25,549.47l-.87,53.44-28.57-.1.21-106.4c.04-20.87,13.87-39.16,32.48-47.16,20.16-8.66,43.34-5.87,59.82,8.47,26.16,22.78,24.72,63.87-1.61,85.85-17.39,13.51-40.01,16.25-61.47,5.9Z" fill="#fcfcfb"/>
    <path d="M506.23,549.49l-.82,53.4-28.35-.03-.37-99.87c-.07-19.26,7.11-37.01,22.94-48.29,19.63-13.99,46.41-14.13,66.02.08,15.5,11.23,22.69,29.29,21.96,48.11-1.09,28.27-22.34,50.56-50.54,52.71-10.42.79-19.59-.86-30.84-6.1Z" fill="#fdfcfc"/>
    <path d="M648.91,555.59c-31.78-1.95-54.39-28.55-52.3-59.54,1.93-28.67,24.2-50.09,52.72-51.68,33.79-1.88,60.57,24.77,58.61,58.61-1.79,30.94-27.17,54.56-59.02,52.61Z" fill="#fcfcfc"/>
    <path d="M466.08,553.57l-32.4-.36-23-30.93-21.78,31.28-34.53-.65,38.36-53.85-38.14-52.26,35.62-.42,20.77,29.32,21.01-29.13,35.48.05-38.61,52.72,38.4,51.65c.66.89.32,2.31-1.18,2.58Z" fill="#fcfbfb"/>
    <path d="M803.05,534.45c-12.11,30.59-71.23,25.45-90.15,2.48,5.74-6.53,11.47-12.49,18.6-18.22,10.92,9.8,24.91,14.8,38.79,11.61,4.5-1.03,8.46-5.17,7.1-9.6-1.13-3.69-5.06-5.48-8.51-6.36l-26.58-6.75c-20.26-5.14-29.41-20.18-24.56-38.91,2.11-8.15,8.99-16.61,18.72-20.38,22.36-8.67,48.7-4.06,66.93,12.57-1.78,2.86-16.58,19.46-18.91,17.44-16.65-14.41-40.41-11.97-40.64-2.24-.08,3.24,2.32,5.92,5.82,6.83l29.3,7.62c8.49,2.21,16.59,6.15,21.89,13.52,6.12,8.53,6.39,19.82,2.2,30.4Z" fill="#fcfcfc"/>
    <path d="M346.55,553.16c-4.33.82-26.11.85-27.15,0-.63-.51-.96-1.91-.96-3.4l-.08-103.2c9.62-.46,18.47-.7,28.02-.03l.17,106.64Z" fill="#fdfdfd"/>
    <path d="M336.19,430.21c-7.91,1.43-15.13-2.39-18.54-8.08-4.18-6.98-3.27-15,2-20.85,4.91-5.45,12.97-7.2,20.2-3.91,7.18,3.26,10.97,10.15,10.3,17.83-.61,7.02-5.8,13.54-13.95,15.02Z" fill="#fbfafa"/>
    <path d="M272.51,517.17c-7.66,9.82-19.89,13.74-31.22,9.88-10.41-3.55-18.32-13.1-18.97-25.09-.5-9.27,3.05-17.75,9.73-23.4s16.26-7.96,25.53-5.77,16.08,8.99,18.89,16.32c3.74,9.77,2.37,19.96-3.95,28.06Z" fill="#030203"/>
    <path d="M558,510.79c-3.85,9.53-12.42,15.54-20.97,17.12-10.6,1.96-20.77-1.97-27.18-10.35-10.9-14.25-5.9-35.43,10.19-43.02,10.85-5.12,23.01-3.09,31.46,4.63,8.39,7.67,11.19,20.03,6.5,31.62Z" fill="#030303"/>
    <path d="M668.74,522.77c-10.95,8.13-24.37,7.58-34.45-.89-12.87-10.81-14.09-30.05-2.43-41.8,11.5-11.59,30.72-11.36,41.63,1.11,10.77,12.31,9.16,31.25-4.75,41.58Z" fill="#030203"/>
  </svg>
);

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-[#1C1C1E]/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <PixposLogo size={36} />
          <div>
            <h1 className="text-[15px] font-semibold text-white">PIXPOS</h1>
            <p className="text-[10px] text-white/40">Boss Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-[13px] transition-all duration-150
              ${isActive
                ? 'bg-[#0A84FF]/20 text-[#0A84FF]'
                : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
              }
            `}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-[13px] transition-all duration-150
            ${isActive
              ? 'bg-[#0A84FF]/20 text-[#0A84FF]'
              : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
            }
          `}
        >
          <Settings size={18} />
          <span>Ayarlar</span>
        </NavLink>
        
        {/* Version */}
        <div className="mt-4 px-3 text-[10px] text-white/30">
          v1.0.0 • PIXPOS Boss
        </div>
      </div>
    </aside>
  );
}
