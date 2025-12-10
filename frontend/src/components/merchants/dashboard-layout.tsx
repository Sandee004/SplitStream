{
  /*
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: GitBranch, label: "Streams", active: false },
  { icon: History, label: "History", active: false },
  { icon: Settings, label: "Settings", active: false },
];
console.log(navItems);*/
}

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  GitBranch,
  History,
  Settings,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const [merchant, setMerchant] = useState<{
    username: string;
    wallet: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch merchant info
  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:8000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed fetch");

        const data = await res.json();

        setMerchant({
          username: data.merchant_profile.username,
          wallet: data.merchant_profile.wallet,
        });
      } catch (error) {
        console.error("Error fetching merchant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchant();
  }, [navigate]);

  const logOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // FULL NAVIGATION LIST WITH ICONS
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Streams", path: "/dashboard/streams", icon: GitBranch },
    { label: "History", path: "/dashboard/history", icon: History },
    { label: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] grid-bg">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-[#1a3a2a]/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a3a2a] flex items-center justify-center">
              <span className="text-[#a8e6cf] font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-[#1a3a2a]">SplitStream</span>
          </div>

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
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r-2 border-[#1a3a2a]/20 
        transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#1a3a2a]/10">
          <div className="flex items-center gap-3">
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
          </div>
        </div>

        {/* Merchant Info */}
        <div className="p-4 mx-4 mt-4 bg-[#f5f5f5] border border-[#1a3a2a]/10">
          <span className="text-xs text-[#1a3a2a]/50 font-mono uppercase">
            Merchant
          </span>

          {loading ? (
            <p className="text-[#1a3a2a]/50 text-sm mt-1">Loading...</p>
          ) : merchant ? (
            <>
              <p className="font-semibold text-[#1a3a2a] truncate mt-1">
                {merchant.username.charAt(0).toUpperCase() +
                  merchant.username.slice(1)}
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
          <span className="text-xs text-[#1a3a2a]/40 font-mono uppercase px-3 mb-2 block">
            Navigation
          </span>

          <div className="mt-2 w-full flex flex-col gap-2">
            {navItems.map(({ label, path, icon: Icon }) => {
              const isActive =
                path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(path);

              return (
                <Link
                  key={label}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-3 transition-colors ${
                    isActive
                      ? "bg-[#a8e6cf]/20 border-l-2 border-[#a8e6cf] text-[#1a3a2a]"
                      : "text-[#1a3a2a]/60 hover:text-[#1a3a2a] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1a3a2a]/10">
          <button
            onClick={logOut}
            className="flex items-center gap-3 px-3 py-2.5 text-[#1a3a2a]/60 hover:text-[#1a3a2a] hover:bg-[#f5f5f5] transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Exit Protocol</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1a3a2a]/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}
