"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, User, Download, LayoutDashboard, ScanSearch } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/generate", label: "Generate Resume", icon: Download },
  { href: "/dashboard/ats", label: "ATS Scanner", icon: ScanSearch, soon: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100" style={{ backgroundColor: "#2c2c2c" }}>
          <FileText size={18} className="text-blue-400" />
          <span className="text-white font-bold text-base">ResumeAI</span>
        </div>
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon, soon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={soon ? "#" : href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${soon ? "opacity-50 cursor-default pointer-events-none" : ""}`}
              >
                <Icon size={16} />
                {label}
                {soon && (
                  <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-normal">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <UserButton />
          <span className="text-xs text-gray-400 truncate">Account</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
