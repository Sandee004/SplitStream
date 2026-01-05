import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  GitBranch,
  History,
  Settings,
  Check,
  Copy,
  Store, // Added
  ExternalLink,
  DollarSign, // Added
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
  const [copied, setCopied] = useState(false);
  const [storeUrl, setStoreLink] = useState("");

  const handleCopy = async () => {
    if (!storeUrl) return;
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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

        if (!res.ok) {
          if (res.status === 401) {
            alert("Session expired. Please login again");
            navigate("/login");
          }
          throw new Error("Can't load dashboard data");
        }
        const data = await res.json();

        if (data && data.merchant_profile) {
          const merchantData = {
            username: data.merchant_profile.username || "Merchant",
            wallet: data.merchant_profile.wallet || "",
          };
          setMerchant(merchantData);
          const slug = data.merchant_profile.slug;
          setStoreLink(`${window.location.origin}/store/${slug}`);
          localStorage.setItem("Merchant Data", JSON.stringify(merchantData));
        }
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

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Streams", path: "/dashboard/streams", icon: GitBranch },
    { label: "Payouts", path: "/dashboard/payouts", icon: DollarSign },
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

        {/* Merchant Info & Store Link */}
        <div className="p-4 mx-4 mt-4 bg-[#f5f5f5] border border-[#1a3a2a]/10 relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#1a3a2a]/20" />

          <span className="text-xs text-[#1a3a2a]/50 font-mono uppercase tracking-wider mb-2 block">
            Merchant Profile
          </span>

          {loading ? (
            <p className="text-[#1a3a2a]/50 text-sm animate-pulse">
              Syncing...
            </p>
          ) : merchant ? (
            <>
              {/* User Details */}
              <div className="mb-4">
                <p className="font-bold text-[#1a3a2a] truncate">
                  {(merchant.username || "User").charAt(0).toUpperCase() +
                    (merchant.username || "User").slice(1)}
                </p>
                <p className="text-[10px] text-[#1a3a2a]/50 font-mono truncate bg-[#1a3a2a]/5 px-1.5 py-0.5 rounded w-fit mt-1">
                  {merchant.wallet
                    ? `${merchant.wallet.slice(0, 6)}...${merchant.wallet.slice(
                        -4
                      )}`
                    : "No Wallet"}
                </p>
              </div>

              {/* Improved Store Link Section */}
              {storeUrl && (
                <div className="pt-3 border-t border-[#1a3a2a]/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#1a3a2a]/40 flex items-center gap-1">
                      <Store className="w-3 h-3" /> STORE URL
                    </span>
                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
                    >
                      Visit <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="group flex items-center bg-white border border-[#1a3a2a]/10 hover:border-accent/50 transition-colors rounded-sm p-1 pr-1.5">
                    <div className="flex-1 min-w-0 px-2 border-r border-[#1a3a2a]/5">
                      <p className="text-xs font-mono text-[#1a3a2a]/70 truncate select-all">
                        {storeUrl.replace(/^https?:\/\//, "")}
                      </p>
                    </div>

                    <button
                      onClick={handleCopy}
                      className="ml-1.5 p-1 hover:bg-[#a8e6cf]/20 rounded transition-colors"
                      title="Copy URL"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#1a3a2a]/40 group-hover:text-[#1a3a2a]" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-red-600 text-xs mt-1">Failed to load data</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 mt-2">
          <span className="text-xs text-[#1a3a2a]/40 font-mono uppercase px-3 mb-2 block">
            Navigation
          </span>

          <div className="mt-2 w-full flex flex-col gap-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-sm font-medium rounded-sm ${
                    isActive
                      ? "bg-[#1a3a2a] text-[#a8e6cf] shadow-sm"
                      : "text-[#1a3a2a]/60 hover:text-[#1a3a2a] hover:bg-[#1a3a2a]/5"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#a8e6cf]" : "text-[#1a3a2a]/40"
                    }`}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1a3a2a]/10 bg-white">
          <button
            onClick={logOut}
            className="flex items-center gap-3 px-3 py-2.5 text-[#1a3a2a]/60 hover:text-red-600 hover:bg-red-50 transition-colors w-full rounded-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Exit Protocol</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1a3a2a]/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
