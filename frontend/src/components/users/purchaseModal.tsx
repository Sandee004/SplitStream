/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import Web3 from "web3";

/* =======================
   TYPES
======================= */

type Product = {
  id: number;
  product_name: string;
  price: number; // smallest token unit
};

type PurchaseModalProps = {
  product: Product | null;
  slug: string;
  walletAddress: string | null;
  onClose: () => void;
};

/* =======================
   CONSTANTS
======================= */

// ERC20 minimal ABI (transfer only)
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

// Your token address
const TOKEN_ADDRESS = "0xYOUR_MNEE_TOKEN_ADDRESS"; // 👈 replace

/* =======================
   COMPONENT
======================= */

const PurchaseModal = ({
  product,
  slug,
  onClose,
  walletAddress,
}: PurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const total = product.price * quantity; // already smallest unit

  const makePurchase = async () => {
    if (!walletAddress) {
      alert("Please connect wallet to make a transaction");
      return;
    }

    try {
      setIsSubmitting(true);

      /* =======================
         1️⃣ Create purchase intent
      ======================= */
      const res = await fetch("http://localhost:8000/api/make-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          slug,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create purchase");
      }

      const {
        transaction_id,
        amount,
        merchant_wallet,
        chain_id,
        token_address,
      } = await res.json();

      /* =======================
         2️⃣ Switch chain
      ======================= */
      const web3 = new Web3(window.ethereum as any);

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(chain_id) }],
      });

      /* =======================
         3️⃣ ERC20 transfer
         amount is already smallest unit
      ======================= */
      const tokenContract = new web3.eth.Contract(
        ERC20_ABI as any,
        token_address || TOKEN_ADDRESS
      );

      const tx = await tokenContract.methods
        .transfer(merchant_wallet, amount)
        .send({ from: walletAddress });

      const txHash = tx.transactionHash;

      /* =======================
         4️⃣ Confirm payment
      ======================= */
      const confirmRes = await fetch(
        "http://localhost:8000/api/confirm-payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id,
            tx_hash: txHash,
          }),
        }
      );

      if (!confirmRes.ok) {
        throw new Error("Payment verification failed");
      }

      alert("Payment successful!");
      onClose();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-md border-2 border-emerald-800 bg-white p-6"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-emerald-700 hover:text-emerald-900"
          >
            <X />
          </button>

          <h3 className="text-xl font-bold mb-4">Purchase Summary</h3>

          {/* Product Info */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-mono text-sm text-emerald-700/60">
                Product
              </span>
              <span className="font-semibold">{product.product_name}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-mono text-sm text-emerald-700/60">
                Price
              </span>
              <span className="font-semibold">{product.price} MNEE</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-mono text-emerald-700/60 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 border-2 border-emerald-800 font-bold"
              >
                −
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 border-2 border-emerald-800 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between mb-6 border-t pt-4">
            <span className="font-mono text-sm text-emerald-700/60">Total</span>
            <span className="text-lg font-bold">{total} MNEE</span>
          </div>

          {/* CTA */}
          <button
            onClick={makePurchase}
            disabled={!walletAddress || isSubmitting}
            className={`w-full py-3 rounded-md font-bold transition-colors
              ${
                walletAddress && !isSubmitting
                  ? "bg-lime-400 hover:bg-lime-500 text-emerald-900"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {isSubmitting
              ? "Processing..."
              : walletAddress
              ? "Confirm Purchase"
              : "Connect wallet to continue"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseModal;
