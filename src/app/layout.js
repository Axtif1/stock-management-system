import './globals.css';
import { WarehouseProvider } from '@/context/WarehouseContext';
import { ToastProvider } from '@/context/ToastContext';
import { LanguageProvider } from '@/context/LanguageContext';
import DashboardShell from '@/components/layout/DashboardShell';

export const metadata = {
  title: 'Cold-Drink Warehouse Management | Single Warehouse Dashboard',
  description: 'Fast, high-efficiency warehouse operations dashboard for wholesale beverage distributors.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        <LanguageProvider>
          <ToastProvider>
            <WarehouseProvider>
              <DashboardShell>{children}</DashboardShell>
            </WarehouseProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

