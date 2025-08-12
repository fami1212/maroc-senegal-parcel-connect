import { ReactNode } from "react";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

const AppLayout = ({ children, showMobileNav = true }: AppLayoutProps) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header - hidden on mobile when logged in */}
      <div className={user ? "hidden md:block" : "block"}>
        <Header />
      </div>
      
      {/* Main content with bottom padding for mobile nav */}
      <main className={showMobileNav && user ? "pb-20 md:pb-0" : ""}>
        {children}
      </main>
      
      {/* Mobile Navigation */}
      {showMobileNav && user && <MobileNavigation />}
    </div>
  );
};

export default AppLayout;