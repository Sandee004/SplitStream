import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Store } from "lucide-react";
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
      const res = await fetch(`http://localhost:8000/api/store/${slug}`);
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
    <div className="min-h-screen p-8 grid-bg-pattern grid-animate-scroll bg-white text-emerald-900">
      {/* Decorative corners */}
      <div className="fixed top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-emerald-800/70" />
      <div className="fixed top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-emerald-800/70" />
      <div className="fixed bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-emerald-800/70" />
      <div className="fixed bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-emerald-800/70" />

      {/* Wallet Connect */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={walletAddress ? disconnectWallet : connectWallet}
          className="px-4 py-2 rounded-md border-2 border-emerald-800 
               bg-lime-400 hover:bg-lime-500 
               text-emerald-900 font-mono text-sm
               transition-colors"
        >
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </div>

      {/* ================= MAIN ================= */}
      <main className="max-w-6xl mx-auto space-y-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-lime-400" />
            <span className="text-xs font-mono text-emerald-700/60">
              LIVE STOREFRONT
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Available Products</h2>
          <p className="text-emerald-700/70">
            Select a product to get and make direct payment
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20 font-mono text-emerald-700/60">
            Getting products…
          </div>
        )}

        {/* Products */}
        {!isLoading && merchantProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {merchantProducts.map((product) => (
              <div
                key={product.id}
                className="relative border-2 border-emerald-800 bg-white p-6"
              >
                {/* corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-lime-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-lime-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-lime-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-lime-400" />

                <h3 className="text-lg font-semibold mb-2">
                  {product.product_name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">
                    {product.price} MNEE
                  </span>
                  <span className="text-xs flex gap-3 items-center justify-center font-mono text-emerald-700/60">
                    <CheckCircle />
                    Available
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="hover:cursor-pointer w-full py-2.5 mt-3 mb-1 rounded-md 
                   bg-lime-400 hover:bg-lime-500 
                   text-emerald-900 text-lg font-bold 
                   transition-colors"
                >
                  Buy now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && merchantProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed border-emerald-800/40 p-16 text-center"
          >
            <Store className="w-12 h-12 mx-auto mb-4 text-emerald-700/50" />
            <h3 className="text-lg font-semibold mb-2">No Products</h3>
            <p className="text-sm font-mono text-emerald-700/60">
              This merchant hasn’t added any products yet.
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="pt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-emerald-800 bg-gray-100 text-xs font-mono text-emerald-700/70">
            <span className="w-2 h-2 bg-lime-400 animate-pulse" />
            VERIFIED PAYMENT INFRASTRUCTURE
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
