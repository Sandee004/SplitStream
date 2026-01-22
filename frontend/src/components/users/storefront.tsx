import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Package, Zap, ShieldCheck, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PurchaseModal from "./purchaseModal";
import Web3 from "web3";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
    web3?: Web3;
  }
}

type Product = {
  id: number;
  product_name: string;
  price: number;
};

const Storefront = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [merchantProducts, setMerchantProducts] = useState<Product[]>([]);
  const { slug } = useParams<{ slug: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const getProducts = useCallback(async () => {
    if (!slug) return;
    try {
      setIsLoading(true);
      const res = await fetch(
        `https://splitstream.onrender.com/api/store/${slug}`,
      );
      if (!res.ok) throw new Error("Failed to load store products");
      const data = await res.json();
      setMerchantProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Wallet connection error:", error);
        alert("Looks like you declined the connection request.");
      }
    } else {
      alert("MetaMask isn't detected. Please install it to connect!");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <div className="min-h-screen p-8 grid-bg-pattern bg-gray-50 text-emerald-900 selection:bg-lime-400 selection:text-emerald-900">
      {/* Decorative corners */}
      <div className="fixed top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-emerald-800/70" />
      <div className="fixed top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-emerald-800/70" />
      <div className="fixed bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-emerald-800/70" />
      <div className="fixed bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-emerald-800/70" />

      {/* Wallet Connect */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={walletAddress ? disconnectWallet : connectWallet}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-sm border-2 border-emerald-800 
               bg-white hover:bg-emerald-800 
               text-emerald-900 hover:text-lime-400 font-mono text-sm font-bold
               transition-all shadow-[4px_4px_0px_0px_#065f46] hover:translate-y-1 hover:shadow-none"
        >
          <Wallet className="w-4 h-4" />
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "CONNECT WALLET"}
        </button>
      </div>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto space-y-16 pt-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-emerald-800/30 bg-emerald-50 rounded-full">
            <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-800 uppercase">
              Live Storefront
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-emerald-950">
            Available Products
          </h2>
          <p className="text-emerald-700/70 max-w-md mx-auto font-medium">
            Secure checkout powered by Web3. Select an item below.
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-800 border-t-lime-400 rounded-full animate-spin" />
            <span className="font-mono text-emerald-800 animate-pulse">
              LOADING_INVENTORY...
            </span>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && merchantProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {merchantProducts.map((product, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={product.id}
                className="group relative flex flex-col justify-between border-2 border-emerald-800 bg-white 
                           transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#065f46]"
              >
                {/* Product Image Placeholder / Header */}
                <div className="h-48 bg-emerald-50 border-b-2 border-emerald-800 flex items-center justify-center relative overflow-hidden group-hover:bg-lime-50 transition-colors">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Icon */}
                  <div className="relative z-10 p-4 bg-white border-2 border-emerald-800 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-8 h-8 text-emerald-800" />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-white border border-emerald-800 px-2 py-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-lime-600" />
                    <span className="text-[10px] font-mono font-bold text-emerald-800">
                      VERIFIED
                    </span>
                  </div>
                </div>

                {/* Product Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-emerald-600">
                      ITEM_ID: #{String(product.id).padStart(4, "0")}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-emerald-950 leading-tight mb-4 group-hover:text-emerald-700 transition-colors">
                    {product.product_name}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-dashed border-emerald-800/30 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-emerald-600 uppercase mb-1">
                        Current Price
                      </p>
                      <span className="text-2xl font-black font-mono text-emerald-900 tracking-tighter">
                        {product.price}{" "}
                        <span className="text-sm text-emerald-600 font-bold">
                          MNEE
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full py-4 bg-emerald-900 text-white font-mono font-bold text-sm tracking-wider uppercase
                           hover:bg-lime-400 hover:text-emerald-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Initiate Buy
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && merchantProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto border-2 border-dashed border-emerald-800/40 bg-white/50 p-16 text-center rounded-lg"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-emerald-700" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">
              Store Empty
            </h3>
            <p className="text-sm font-mono text-emerald-700/60">
              The merchant hasn't stocked any items yet.
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="pt-24 pb-12 text-center">
          <div className="inline-flex flex-col items-center gap-2 opacity-50">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-emerald-800" />
              <div className="w-1 h-1 bg-emerald-800" />
              <div className="w-1 h-1 bg-emerald-800" />
            </div>
            <p className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest">
              Powered by SplitStream Protocol
            </p>
          </div>
        </div>
      </main>

      <PurchaseModal
        product={selectedProduct}
        slug={slug!}
        walletAddress={walletAddress}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Storefront;
