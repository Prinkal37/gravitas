import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Library,
  User,
  CreditCard,
  LogOut,
} from "lucide-react";
import { GravitasLogo } from "@/components/GravitasLogo";
import { CreditsWidget } from "@/components/CreditsWidget";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Generate", to: "/generate", icon: Sparkles },
  { label: "Content Library", to: "/library", icon: Library },
  { label: "Brand Profile", to: "/brand", icon: User },
  { label: "Billing", to: "/billing", icon: CreditCard },
];

export function AppSidebar() {
  return (
    <aside className="w-60 min-h-screen flex flex-col border-r border-border bg-surface shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <GravitasLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? "nav-item-active" : "nav-item"
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Credits + Logout */}
      <div className="px-3 pb-4 space-y-3">
        <CreditsWidget />
        <button className="nav-item w-full">
          <LogOut size={16} strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
