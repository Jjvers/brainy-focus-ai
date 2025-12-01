import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, History, User, LogOut, TrendingUp, Target, BookOpen, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/materials", icon: BookOpen, label: "Materi" },
    { path: "/history", icon: History, label: "Riwayat" },
    { path: "/analytics", icon: TrendingUp, label: "Analitik" },
    { path: "/goals", icon: Target, label: "Target" },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <nav className="border-b-2 border-primary/20 bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src={logoImage} alt="StudyBuddy" className="w-12 h-12 drop-shadow-glow" />
            <span className="text-2xl font-black text-foreground tracking-tight">
              Study<span className="bg-gradient-primary bg-clip-text text-transparent">Buddy</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={`gap-2 font-bold ${isActive ? 'shadow-glow' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          <Button variant="outline" className="gap-2 border-2 border-destructive/30 hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Keluar</span>
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
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`gap-2 whitespace-nowrap font-bold ${isActive ? 'shadow-glow' : ''}`}
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
