import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, History, User, LogOut, TrendingUp, Target, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/materials", icon: BookOpen, label: "Materials" },
    { path: "/history", icon: History, label: "History" },
    { path: "/analytics", icon: TrendingUp, label: "Analytics" },
    { path: "/goals", icon: Target, label: "Goals" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <span className="text-2xl font-bold text-foreground tracking-tight">Study Sanctuary</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="gap-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
