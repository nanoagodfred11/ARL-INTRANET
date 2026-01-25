import { Header } from "./Header";
import { Footer } from "./Footer";
import { RightSidebar } from "./RightSidebar";
import { ChatWidget } from "../chat/ChatWidget";

interface MainLayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
  showChatWidget?: boolean;
}

export function MainLayout({
  children,
  showRightSidebar = false,
  showChatWidget = true,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start gap-6 px-4 py-6 pb-24 lg:pb-6">
        <main className="min-w-0 flex-1">{children}</main>
        {showRightSidebar && <RightSidebar />}
      </div>
      <Footer />
      {showChatWidget && <ChatWidget />}
    </div>
  );
}
