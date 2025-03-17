
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import { Navigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const Layout = ({ children, requireAuth = true }: LayoutProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Determine if we're on an auth page (login or register)
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin-slow rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // On auth pages or when auth is not required, don't show the sidebar
  if (!requireAuth || isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "lg:ml-16 lg:pl-0" // Changed from lg:ml-20 to lg:ml-16 for the slimmer sidebar
      )}>
        <div className="container max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
