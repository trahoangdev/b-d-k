import { 
  Database, 
  BarChart3, 
  Upload, 
  Settings, 
  Search,
  FolderOpen,
  Activity,
  Users
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navigationItems = [
  { title: "Tổng quan", url: "/", icon: BarChart3 },
  { title: "Kho dữ liệu", url: "/explorer", icon: FolderOpen },
  { title: "Tải lên", url: "/upload", icon: Upload },
  { title: "Phân tích", url: "/analytics", icon: Activity },
  { title: "Người dùng", url: "/users", icon: Users },
  { title: "Cài đặt", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    const active = isActive(path);
    const baseClass = "flex items-center rounded-lg transition-smooth";
    const activeClass = "bg-primary text-primary-foreground shadow-glow";
    const inactiveClass = "text-muted-foreground hover:text-foreground hover:bg-accent";
    
    if (collapsed) {
      return `${baseClass} justify-center w-16 h-10 px-2 ${
        active 
          ? `${activeClass} ring-2 ring-primary/20` 
          : `${inactiveClass} hover:bg-accent/50`
      }`;
    }
    
    return `${baseClass} gap-3 px-3 py-2 ${
      active 
        ? activeClass 
        : inactiveClass
    }`;
  };

  return (
    <Sidebar 
      className={`sidebar-transition ${collapsed && !isMobile ? "w-20" : "w-64"}`} 
      collapsible="icon"
      data-state={state}
    >
      <SidebarContent className={collapsed && !isMobile ? "p-3" : "p-4"}>
        <div className={collapsed && !isMobile ? "mb-4" : "mb-6"}>
          <div className={`flex items-center gap-2 ${collapsed && !isMobile ? 'justify-center px-2' : 'px-3'}`}>
            <div className={`gradient-primary rounded-lg ${collapsed && !isMobile ? 'p-2' : 'p-2'}`}>
              <Database className={`${collapsed && !isMobile ? 'h-6 w-6' : 'h-6 w-6'} text-primary-foreground`} />
            </div>
            {(!collapsed || isMobile) && (
              <div>
                <h1 className="text-xl font-bold text-foreground">Big Data Keeper</h1>
                <p className="text-xs text-muted-foreground">Data Platform</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2">
            {(!collapsed || isMobile) && "NAVIGATION"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={collapsed && !isMobile ? "space-y-2" : "space-y-1"}>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {collapsed && !isMobile ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavClass(item.url)}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2 bg-popover border border-border shadow-lg">
                        <p className="font-medium">{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(!collapsed || isMobile) && (
          <div className="mt-auto pt-6">
            <div className="card-modern p-4">
              <h3 className="font-semibold text-sm mb-2">Dung lượng</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Đã sử dụng</span>
                  <span className="text-foreground font-medium">2.4 TB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="gradient-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tổng</span>
                  <span className="text-foreground font-medium">4.0 TB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}