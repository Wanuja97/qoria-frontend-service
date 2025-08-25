"use client";

import React from "react";
import { Building2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton 
              size="lg" 
              className="group px-3 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
                  <Building2 className="size-5" />
                </div>
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    ABT Corporation
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Business Intelligence
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}