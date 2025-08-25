// app-sidebar.jsx
"use client";
import { useEffect,useState } from "react";
import React from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Package,
  Calendar,
  Building2,
} from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Enhanced navigation data with better icons and organization
const data = {
  navItems: [
    { 
      name: "Overview", 
      url: "/dashboard/overview", 
      icon: BarChart3,
      description: "Dashboard summary"
    },
    { 
      name: "Revenue Analysis", 
      url: "/dashboard/revenue", 
      icon: TrendingUp,
      description: "Revenue insights"
    },
    { 
      name: "Regional Performance", 
      url: "/dashboard/sales/regions", 
      icon: MapPin,
      description: "Geographic analysis"
    },
    { 
      name: "Product Analytics", 
      url: "/dashboard/products", 
      icon: Package,
      description: "Top products"
    },
    { 
      name: "Sales Trends", 
      url: "/dashboard/sales", 
      icon: Calendar,
      description: "Monthly trends"
    },
  ],
  user: {
    name: "John Smith",
    email: "john@company.com",
    avatar: "JS",
    role: "Analytics Manager"
  }
};

export function AppSidebar(props) {
  // retrueve user data from local storage
    const [loggedInUser, setLoggedInUser] = useState({
    name: "User Name",
    email: "",
    avatar: "JS",                
    role: "Analytics Manager", 
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser((prev) => ({
        ...prev,                // keep avatar + role from default
        name: parsedUser.name || prev.name,
        email: parsedUser.email || prev.email,
      }));
    }
  }, []);
  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800" {...props}>
      <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-700/60">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavProjects projects={data.navItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200/60 dark:border-slate-700/60 p-2">
        <NavUser user={loggedInUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}