/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Zap, TrendingUp, Package, Loader2 } from "lucide-react";
import TransactionTable from "./transaction-table";
import ProductCard from "./product-card";
import ProductModal from "./product-modal";
import { useNavigate } from "react-router-dom";

interface Split {
  id: string;
  wallet_address: string;
  percentage: number;
  isOwner?: boolean;
}

interface Product {
  id: string;
  product_name: string;
  price: number;
  description?: string;
  splits: Split[];
}

interface Transaction {
  id: string;
  txHash: string;
  productName: string;
  amount: number;
  timestamp: Date;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [merchantWallet, setMerchantWallet] = useState<string>("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:8000/api/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Session expired. Please login again");
          navigate("/login");
        }
        throw new Error("Can't load dashboard data");
      }

      const data = await res.json();
      setProducts(
        data.inventory.map((item: any) => ({
          id: item.id.toString(),
          product_name: item.name,
          price: item.price,
          splits: item.splits
            ? item.splits.map((s: any) => ({
                id: s.id?.toString() || crypto.randomUUID(),
                wallet_address: s.wallet_address,
                percentage: s.percentage,
                isOwner: s.is_owner || false,
              }))
            : [],
        }))
      );

      setTransactions(
        data.recent_sales.map((sale: any) => ({
          id: sale.tx_hash,
          txHash: sale.tx_hash,
          productName: sale.item_sold,
          amount: sale.earned,
          timestamp: new Date(sale.date),
        }))
      );

      setTotalRevenue(data.stats.total_revenue);

      setMerchantWallet(data.merchant_profile.wallet);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stream?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/api/delete-product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadDashboardData(); // Refresh list after delete
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="min-h-screen relative grid-bg-pattern grid-animate-scroll">
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#FFFFFF] border border-[#BED4C7] p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <span className="font-mono text-sm text-foreground">
              Updating Dashboard...
            </span>
          </div>
        </div>
      )}
      {/* HEADER */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b-2 border-[#1a3a2a]/20">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a2a]">Dashboard</h1>
          <p className="text-sm text-[#1a3a2a]/50">
            Manage your revenue streams
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#a8e6cf]/20 border border-[#a8e6cf]/30">
            <div className="w-2 h-2 bg-[#a8e6cf] rounded-full animate-pulse" />
            <span className="text-xs font-mono text-[#1a3a2a]">CONNECTED</span>
          </div>
        </div>
      </header>

      <div className="space-y-8 p-6 pt-20 lg:pt-6">
        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Total Inflow */}
          <div className="border-2 border-[#BED4C7] bg-[#FFFFFF] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 border border-[#BED4C7] flex items-center justify-center bg-secondary">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-mono text-[#F2F6F4]-foreground">
                TOTAL_INFLOW
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {totalRevenue.toLocaleString()}
              <span className="text-sm text-[#F2F6F4]-foreground ml-1">
                MNEE
              </span>
            </p>
          </div>

          {/* Active Streams */}
          <div className="border-2 border-[#BED4C7] bg-[#FFFFFF] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 border border-[#BED4C7] flex items-center justify-center bg-secondary">
                <Package className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-mono text-[#F2F6F4]-foreground">
                ACTIVE_STREAMS
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {products.length}
            </p>
          </div>

          {/* Transactions */}
          <div className="border-2 border-[#BED4C7] bg-[#FFFFFF] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 border border-[#BED4C7] flex items-center justify-center bg-secondary">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-mono text-[#F2F6F4]-foreground">
                TRANSACTIONS
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {transactions.length}
            </p>
          </div>
        </motion.div>

        {/* ADD STREAM CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full border-2 border-dashed border-accent/50 bg-accent/5 
                        hover:bg-accent/10 hover:border-accent transition-all p-8 md:p-12 group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-2 border-accent bg-accent/10 flex items-center justify-center group-hover:glow-accent transition-all">
                <Plus className="w-8 h-8 text-accent" strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Initialize New Revenue Stream
                </h3>
                <p className="text-sm text-[#F2F6F4]-foreground">
                  Create a programmable split for your next product or
                  collaboration
                </p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* ACTIVE STREAMS */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Active Streams
                </h3>
                <p className="text-xs font-mono text-[#F2F6F4]-foreground">
                  PRODUCT_REGISTRY
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* TRANSACTION TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TransactionTable transactions={transactions} />
        </motion.div>
      </div>

      {/* PRODUCT MODAL */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
        merchantWallet={merchantWallet}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
