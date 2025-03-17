
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ListChecks, Home, Trash2, BarChart3, LogOut, Menu, X } from "lucide-react";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false); // Changed to false to be hidden by default
  const location = useLocation();
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/tasks', label: 'Tasks', icon: ListChecks },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 lg:hidden z-50"
        onClick={toggleSidebar}
      >
        {expanded ? <X size={24} /> : <Menu size={24} />} {/* Increased icon size */}
      </Button>

      {/* Sidebar Backdrop for Mobile */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-0 lg:w-16", // Changed from w-20 to w-16 for a more compact collapsed state
          "bg-card border-r border-border lg:translate-x-0",
          expanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-6">
            <h1 className={cn("font-semibold text-xl transition-opacity", 
              expanded ? "opacity-100" : "opacity-0 lg:opacity-0")}>
              Tasko
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex"
            >
              {expanded ? (
                <X size={20} /> // Increased icon size
              ) : (
                <Menu size={20} /> // Increased icon size
              )}
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setExpanded(false);
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-3 rounded-md transition-all duration-200",
                      "hover:bg-secondary group",
                      isActive
                        ? "bg-secondary text-primary"
                        : "text-foreground/70"
                    )
                  }
                >
                  <Icon size={22} className="flex-shrink-0" /> {/* Increased icon size from 20 to 22 */}
                  <span
                    className={cn(
                      "ml-3 whitespace-nowrap transition-all",
                      expanded ? "opacity-100 duration-300" : "opacity-0 lg:opacity-0 duration-100"
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Log out"
              >
                <LogOut size={20} /> {/* Increased icon size from 18 to 20 */}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
