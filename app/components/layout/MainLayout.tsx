import { Header } from "./Header";
import { Footer } from "./Footer";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main Layout Component
 * Wraps all public pages with header and footer
 * Task: 1.1.1.3.1
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
