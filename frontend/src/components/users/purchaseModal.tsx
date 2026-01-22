/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import Web3 from "web3";

// 1. Ethereum Mainnet Configuration
const CHAIN_ID = 1; // Mainnet
const MNEE_TOKEN_ADDRESS = "0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf";

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

type Product = {
  id: number;
  product_name: string;
  price: number;
};

type PurchaseModalProps = {
  product: Product | null;
  slug: string;
  onClose: () => void;
  walletAddress: string | null;
};

const PurchaseModal = ({
  product,
  slug,
  onClose,
  walletAddress,
}: PurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;
  const totalAmount = product.price * quantity;

  const makePurchase = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (!window.ethereum) throw new Error("Metamask not found");
      const web3 = new Web3(window.ethereum);

      // 2. Switch to Ethereum Mainnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: web3.utils.toHex(CHAIN_ID) }],
        });
      } catch {
        alert("Please switch your wallet to Ethereum Mainnet");
        return;
      }

      // 3. Initiate Transaction in Backend
      const res = await fetch(
        "https://splitstream.onrender.com/api/make-purchase",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            quantity,
            slug,
          }),
        },
      );

      if (!res.ok) throw new Error("Could not initiate purchase");

      const { transaction_id, merchant_wallet } = await res.json();

      const contract = new web3.eth.Contract(
        ERC20_ABI as any,
        MNEE_TOKEN_ADDRESS,
      );
      const amountInWei = web3.utils.toWei(totalAmount.toString(), "ether");

      const tx = await contract.methods
        .transfer(merchant_wallet, amountInWei)
        .send({ from: walletAddress });

      const txHash = tx.transactionHash;

      const confirmRes = await fetch(
        "https://splitstream.onrender.com/api/confirm-payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id,
            tx_hash: txHash,
          }),
        },
      );

      if (confirmRes.ok) {
        alert("Payment Successful!");
        onClose();
      } else {
        alert("Payment sent, but verification failed. Contact support.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 4001) {
        alert("Transaction rejected by user.");
      } else {
        alert("Transaction failed. Check console.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white border-2 border-emerald-800 shadow-[8px_8px_0px_0px_#065f46]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-emerald-800 bg-emerald-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-800" />
              <h3 className="text-lg font-bold text-emerald-900 uppercase tracking-tight">
                Checkout
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-500 hover:text-white transition-colors border border-transparent hover:border-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Receipt Card */}
            <div className="bg-white border-2 border-dashed border-emerald-800/30 p-4 relative">
              {/* Receipt decoration */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-800 rounded-full" />

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-600 uppercase">
                    Item Name
                  </span>
                  <p className="font-bold text-xl text-emerald-900 leading-tight">
                    {product.product_name}
                  </p>
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-emerald-800/10">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-600 uppercase">
                      Unit Price
                    </span>
                    <p className="font-mono text-emerald-900">
                      {product.price} MNEE
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-600 uppercase">
                      Total Due
                    </span>
                    <p className="font-mono font-black text-2xl text-emerald-900">
                      {totalAmount.toFixed(2)} MNEE
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-emerald-800 uppercase mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center border-2 border-emerald-800 border-r-0 bg-gray-50 hover:bg-lime-400 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-emerald-900" />
                  </button>
                  <div className="h-12 flex-1 flex items-center justify-center border-2 border-emerald-800 font-mono text-lg font-bold text-emerald-900">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center border-2 border-emerald-800 border-l-0 bg-gray-50 hover:bg-lime-400 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-900" />
                  </button>
                </div>
              </div>

              {/* Wallet Warning */}
              {!walletAddress && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Wallet not connected. Connect in top right.</span>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={makePurchase}
                disabled={isSubmitting || !walletAddress}
                className="w-full group relative py-4 bg-emerald-900 text-white font-mono font-bold uppercase tracking-wider
                         hover:bg-lime-400 hover:text-emerald-900 transition-all border-2 border-transparent hover:border-emerald-900
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-900 disabled:hover:text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Confirm Payment</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="px-6 py-3 bg-gray-100 border-t-2 border-emerald-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-emerald-800/50">
              <span>SECURE_TX_GATEWAY</span>
              <span>{CHAIN_ID === 1 ? "MAINNET" : "TESTNET"}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseModal;
