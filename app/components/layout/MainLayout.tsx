import { Header } from "./Header";
import { Footer } from "./Footer";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebars?: boolean;
}

export function MainLayout({ children, showSidebars = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-6 px-4 py-6">
        {showSidebars && <LeftSidebar />}
        <main className="min-w-0 flex-1">{children}</main>
        {showSidebars && <RightSidebar />}
      </div>
      <Footer />
    </div>
  );
}
