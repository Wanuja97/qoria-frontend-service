// layout.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');
  const isAuthenticated = 
    typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';

  // Get current path
  useEffect(() => {
    const currentRoutePath = typeof window !== 'undefined' ? window.location.pathname : '';
    const pathParts = currentRoutePath.split('/');
    const currentPage = pathParts[pathParts.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()) || 'Dashboard';
    setCurrentPath(currentPage);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      toast.error('Please log in to access the dashboard.', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  }, [isAuthenticated, router]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md border-b border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60 transition-all duration-200">
          <div className="flex items-center gap-4 px-4 w-full">
            {/* <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200" /> */}
            <Separator
              orientation="vertical"
              className="h-4 bg-slate-200 dark:bg-slate-700"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Analytics
                  </span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-slate-300 dark:text-slate-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentPath}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}