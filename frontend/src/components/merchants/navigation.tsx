import {
  LayoutDashboard,
  GitBranch,
  History,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavProps {
  merchant: { username: string; wallet: string } | null;
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: GitBranch, label: "Streams", path: "/streams" },
  { icon: History, label: "History", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Nav({
  merchant,
  loading,
  sidebarOpen,
  setSidebarOpen,
}: NavProps) {
  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-[#1a3a2a]/20">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a3a2a] flex items-center justify-center">
              <span className="text-[#a8e6cf] font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-[#1a3a2a]">SplitStream</span>
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 border border-[#1a3a2a]/20"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-[#1a3a2a]" />
            ) : (
              <Menu className="w-5 h-5 text-[#1a3a2a]" />
            )}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r-2 border-[#1a3a2a]/20 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#1a3a2a]/10">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a3a2a] flex items-center justify-center relative">
              <span className="text-[#a8e6cf] font-bold">SS</span>
              <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-[#a8e6cf]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-[#a8e6cf]" />
            </div>
            <div>
              <span className="font-bold text-[#1a3a2a] text-lg">
                SplitStream
              </span>
              <span className="block text-xs text-[#1a3a2a]/50 font-mono">
                v1.0.0
              </span>
            </div>
          </a>
        </div>

        {/* Merchant Info */}
        <div className="p-4 mx-4 mt-4 bg-[#f5f5f5] border border-[#1a3a2a]/10">
          <span className="text-xs text-[#1a3a2a]/50 font-mono uppercase tracking-wider">
            Merchant
          </span>
          {loading ? (
            <p className="text-[#1a3a2a]/50 text-sm mt-1">Loading...</p>
          ) : merchant ? (
            <>
              <p className="font-semibold text-[#1a3a2a] truncate mt-1">
                {merchant.username.charAt(0).toUpperCase() +
                  merchant.username.slice(1).toLowerCase()}
              </p>
              <p className="text-xs text-[#1a3a2a]/50 font-mono truncate mt-1">
                {merchant.wallet}
              </p>
            </>
          ) : (
            <p className="text-red-600 text-xs mt-1">Failed to load merchant</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 mt-4">
          <span className="text-xs text-[#1a3a2a]/40 font-mono uppercase tracking-wider px-3 mb-2 block">
            Navigation
          </span>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-[#a8e6cf]/20 border-l-2 border-[#a8e6cf] text-[#1a3a2a]"
                        : "text-[#1a3a2a]/60 hover:text-[#1a3a2a] hover:bg-[#f5f5f5]"
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1a3a2a]/10">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-[#1a3a2a]/60 hover:text-[#1a3a2a] hover:bg-[#f5f5f5] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Exit Protocol</span>
          </a>
        </div>
      </aside>
    </>
  );
}
