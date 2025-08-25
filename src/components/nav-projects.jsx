"use client";

import React from "react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({ projects }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-6">
        Analytics Dashboard
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {projects.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild
                className={`
                  group relative px-3 py-6 rounded-lg transition-all duration-200 ease-in-out
                  hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-800/50' 
                    : 'text-slate-700 dark:text-slate-300 hover:shadow-sm'
                  }
                `}
              >
                <a href={item.url} className="flex items-center gap-3 w-full">
                  <div className={`
                    p-1.5 rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-200/80 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-blue-200/50 group-hover:text-blue-600'
                    }
                  `}>
                    <item.icon size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 group-data-[collapsible=icon]:hidden">
                      {item.description}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-6 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}