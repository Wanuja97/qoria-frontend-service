// nav-user.jsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    
    router.push('/');
    router.refresh(); 
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group px-3 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-md">
                  {user.avatar}
                </div>
                <div className="flex flex-col flex-1 text-left min-w-0">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-semibold">
                  {user.avatar}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="p-3 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}