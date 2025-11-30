"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Zap, TrendingUp, Package } from "lucide-react";
import DashboardLayout from "./dashboard-layout";
import TransactionTable from "./transaction-table";
import ProductCard from "./product-card";
import ProductModal from "./product-modal";

interface Split {
  id: string;
  wallet: string;
  percentage: number;
  isOwner?: boolean;
}

interface Product {
  id: string;
  name: string;
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
  // TEMP MOCKS (replace with store or backend later)
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions] = useState<Transaction[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ===== EDIT HANDLERS =====
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ========================= STATS ========================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Total Inflow */}
          <div className="border-2 border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 border border-border flex items-center justify-center bg-secondary">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                TOTAL_INFLOW
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {totalRevenue.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">MNEE</span>
            </p>
          </div>

          {/* Active Streams */}
          <div className="border-2 border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 border border-border flex items-center justify-center bg-secondary">
                <Package className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                ACTIVE_STREAMS
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {products.length}
            </p>
          </div>

          {/* Transactions */}
          <div className="border-2 border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 border border-border flex items-center justify-center bg-secondary">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                TRANSACTIONS
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {transactions.length}
            </p>
          </div>
        </motion.div>

        {/* ====================== CTA: ADD STREAM ====================== */}
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
                <p className="text-sm text-muted-foreground">
                  Create a programmable split for your next product or
                  collaboration
                </p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* ====================== ACTIVE STREAMS ====================== */}
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
                <p className="text-xs font-mono text-muted-foreground">
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
                  onDelete={deleteProduct}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ====================== TRANSACTION TABLE ====================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TransactionTable transactions={transactions} />
        </motion.div>
      </div>

      {/* ==================== PRODUCT MODAL ==================== */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
      />
    </DashboardLayout>
  );
}
