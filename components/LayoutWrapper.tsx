'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';
import { ErrorLoggerButton } from '@/components/debug/ErrorViewer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboardingPage = pathname?.startsWith('/onboarding') && 
    !pathname?.includes('/welcome-premium') && 
    !pathname?.includes('/welcome-free');

  if (isOnboardingPage) {
    // Onboarding pages: no navigation, full width
    return (
      <main className="min-h-screen">
        {children}
        <ErrorLoggerButton />
      </main>
    );
  }

  // Regular pages: with navigation
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <ErrorLoggerButton />
    </div>
  );
}