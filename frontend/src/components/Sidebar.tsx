"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Inbox" },
  { href: "/dashboard?priority=high", label: "Priority" },
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center transition-transform duration-200 hover:rotate-3">
            <span className="text-white font-semibold text-sm">T</span>
          </div>
          <span className="text-base font-semibold text-gray-900 tracking-tight">trackmail</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href.includes("priority") && pathname === "/dashboard" && item.href.includes("?"));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center h-9 px-3 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex items-center h-9 w-full px-3 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:translate-x-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
