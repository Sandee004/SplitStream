/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pencil, Trash2, Users, DollarSign, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductModal from "./product-modal";

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

export default function ActiveStreams() {
  const navigate = useNavigate();
  const [streams, setStreams] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [merchantWallet, setMerchantWallet] = useState("");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const storedWallet = JSON.parse(
        localStorage.getItem("merchantData") || "{}"
      ).wallet;
      setMerchantWallet(storedWallet);

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:8000/api/products", {
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
        throw new Error("Can't get products");
      }

      const data = await res.json();

      setStreams(
        data.map((item: any) => ({
          id: item.id.toString(),
          product_name: item.name || item.product_name,
          price: item.price,
          description: item.description || "",
          splits: item.splits
            ? item.splits.map((s: any) => ({
                id: s.id?.toString() || crypto.randomUUID(),
                // FIX: Map API response to 'wallet_address'
                wallet_address: s.wallet_address,
                percentage: s.percentage,
                isOwner: s.is_owner || false,
              }))
            : [],
        }))
      );
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
      loadProducts();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="min-h-screen relative grid-bg-pattern bg-white text-emerald-900">
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#FFFFFF] border border-[#BED4C7] p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#1a3a2a] animate-spin" />
            <span className="font-mono text-sm text-[#1a3a2a]">
              Getting Products...
            </span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b-2 border-[#1a3a2a]/20">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a2a]">Active Streams</h1>
          <p className="text-sm text-[#1a3a2a]/50">
            Manage your revenue streams
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#a8e6cf]/20 border border-[#a8e6cf]/30">
            <div className="w-2 h-2 bg-[#a8e6cf] rounded-full animate-pulse" />
            <span className="font-mono text-sm text-[#1a3a2a]/50">
              {streams.length} DEPLOYED
            </span>
          </div>
        </div>
      </header>

      {/* GRID LAYOUT */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {streams.map((product) => (
          <div
            key={product.id}
            className="h-fit border-2 border-[#1a3a2a]/20 bg-[#f5f5f5]/30 relative group hover:border-[#1a3a2a]/40 transition-colors flex flex-col"
          >
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#a8e6cf]" />

            <div className="p-4">
              {/* Product Name */}
              <h4 className="font-semibold text-[#1a3a2a] text-lg truncate">
                {product.product_name}
              </h4>

              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4 text-[#1a3a2a]/50" />
                <span className="font-mono text-lg text-[#1a3a2a] tabular-nums">
                  {product.price.toFixed(2)}
                </span>
                <span className="font-mono text-xs text-[#1a3a2a]/50">
                  MNEE
                </span>
              </div>

              {/* Split Info */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a3a2a]/10">
                <Users className="w-4 h-4 text-[#1a3a2a]/50" />
                <span className="text-sm text-[#1a3a2a]/70">
                  {product.splits.length} recipient
                  {product.splits.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Split Visualization */}
              <div className="mt-3 h-2 bg-[#1a3a2a]/10 flex overflow-hidden">
                {product.splits.map((split, idx) => (
                  <div
                    key={split.id}
                    style={{ width: `${split.percentage}%` }}
                    className={`h-full ${
                      split.isOwner
                        ? "bg-[#1a3a2a]"
                        : idx % 2 === 0
                        ? "bg-[#a8e6cf]"
                        : "bg-[#70c49b]"
                    }`}
                  />
                ))}
              </div>

              {/* Split labels */}
              <div className="mt-2 space-y-1">
                {product.splits.slice(0, 3).map((split) => (
                  <div
                    key={split.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-[#1a3a2a]/60 truncate max-w-[60%]">
                      {split.isOwner
                        ? "You"
                        : `${split.wallet_address.slice(
                            0,
                            6
                          )}...${split.wallet_address.slice(-4)}`}
                      {/* FIX: Updated render to use split.wallet_address */}
                    </span>
                    <span className="font-mono text-[#1a3a2a] font-semibold">
                      {split.percentage}%
                    </span>
                  </div>
                ))}
                {product.splits.length > 3 && (
                  <span className="text-xs text-[#1a3a2a]/40 font-mono">
                    +{product.splits.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex border-t-2 border-[#1a3a2a]/20 bg-[#f5f5f5]/50 mt-auto">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-[#1a3a2a]/70 hover:text-[#1a3a2a] hover:bg-[#a8e6cf]/10 transition-colors border-r border-[#1a3a2a]/20"
              >
                <Pencil className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-[#e53e3e]/70 hover:text-[#e53e3e] hover:bg-[#e53e3e]/5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PRODUCT MODAL */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
        merchantWallet={merchantWallet}
        onSuccess={loadProducts}
      />
    </div>
  );
}
