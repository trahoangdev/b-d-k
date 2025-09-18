import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell, User, LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-4 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger className="hover-glow" />
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md w-full">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm dữ liệu, file, người dùng..." 
                    className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground min-w-0"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover-glow hidden sm:flex"
                  onClick={() => {
                    // TODO: Implement notifications panel
                    console.log('Notifications clicked');
                  }}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden md:block">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover-glow"
                    onClick={() => {
                      // Navigate to settings/profile
                      window.location.href = '/settings';
                    }}
                    title="Cài đặt"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover-glow"
                    onClick={logout}
                    title="Đăng xuất"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}