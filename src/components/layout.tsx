import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Bell, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover-glow" />
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md w-full">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm dữ liệu, file, người dùng..." 
                    className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="hover-glow">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover-glow">
                  <User className="h-5 w-5" />
                </Button>
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