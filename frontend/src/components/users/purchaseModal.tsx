/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import Web3 from "web3";

// 1. Ethereum Mainnet Configuration
const CHAIN_ID = 1; // Mainnet
const MNEE_TOKEN_ADDRESS = "0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf"; // Real MNEE Contract

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
  walletAddress: string | null; // User's connected wallet
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

      // 3. Initiate Transaction in Backend (To get correct Merchant Address)
      // We don't want to trust the frontend with the merchant address
      const res = await fetch("http://localhost:8000/api/make-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          slug,
        }),
      });

      if (!res.ok) throw new Error("Could not initiate purchase");

      const { transaction_id, merchant_wallet } = await res.json();

      const contract = new web3.eth.Contract(
        ERC20_ABI as any,
        MNEE_TOKEN_ADDRESS
      );
      const amountInWei = web3.utils.toWei(totalAmount.toString(), "ether");
      console.log(`Paying ${totalAmount} MNEE to ${merchant_wallet}`);

      const tx = await contract.methods
        .transfer(merchant_wallet, amountInWei)
        .send({ from: walletAddress });

      const txHash = tx.transactionHash;

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white p-6 border-2 border-[#1a3a2a] shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-black"
          >
            <X />
          </button>

          <h3 className="text-xl font-bold mb-4 text-[#1a3a2a]">
            Confirm Purchase
          </h3>

          {/* Receipt Card */}
          <div className="bg-[#f5f5f5] p-4 mb-4 rounded border border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Product</span>
              <span className="font-bold">{product.product_name}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-[#1a3a2a]">
                {totalAmount} MNEE
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-3 font-mono">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {/* Pay Button */}
            <button
              onClick={makePurchase}
              disabled={isSubmitting || !walletAddress}
              className="flex-1 bg-[#1a3a2a] text-[#a8e6cf] font-bold py-3 rounded hover:bg-[#1a3a2a]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Pay with Metamask"
              )}
            </button>
          </div>

          {!walletAddress && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Please connect wallet first
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseModal;
