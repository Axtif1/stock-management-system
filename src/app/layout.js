import './globals.css';
import { WarehouseProvider } from '@/context/WarehouseContext';
import { ToastProvider } from '@/context/ToastContext';
import DashboardShell from '@/components/layout/DashboardShell';

export const metadata = {
  title: 'Cold-Drink Inventory & Sales Management | Single Warehouse Dashboard',
  description: 'Fast, high-efficiency warehouse operations dashboard for wholesale beverage distributors.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        <ToastProvider>
          <WarehouseProvider>
            <DashboardShell>{children}</DashboardShell>
          </WarehouseProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
