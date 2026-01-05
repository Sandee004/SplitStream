{
  /*import { useParams, Link } from "react-router-dom";
try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: web3.utils.toHex(chain_id) }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            const networkParams = {
              chainId: web3.utils.toHex(1), // Chain ID 1 = Ethereum Mainnet
              chainName: "Ethereum Mainnet",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://eth.llamarpc.com"],
              blockExplorerUrls: ["https://etherscan.io"],
            };

            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [networkParams],
            });
          } catch (addError) {
            console.error("Failed to add network:", addError);
            alert("Could not add the network to your wallet.");
            return;
          }
        } else {
          console.error("Failed to switch network:", switchError);
          alert("Failed to switch network. Please switch manually.");
          return;
        }
      }











import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Zap } from "lucide-react";
import { useState } from "react";
import Mnee from 'mnee-sdk';

type Split = {
  wallet_address: string;
  percentage: number;
};

type Product = {
  id: number;
  product_name: string;
  price: number;
  splits: Split[];
};

type PurchaseModalProps = {
  product: Product | null;
  slug: string;
  onClose: () => void;
};

const PurchaseModal = ({ product, slug, onClose }: PurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [senderWif, setSenderWif] = useState(""); // User must provide WIF to sign

  if (!product) return null;
  
  const totalAmount = product.price * quantity;

  const makePurchase = async () => {
    if (!senderWif) {
      alert("Please enter a WIF (Private Key) to sign the transaction.");
      return;
    }

    try {
      setIsSubmitting(true);
      const recipients = product.splits.map((split) => ({
        address: split.wallet_address,
        amount: parseFloat((totalAmount * (split.percentage / 100)).toFixed(5)),
      }));

      
      const response = await Mnee.transfer(recipients, senderWif);
      
      console.log('Transfer result:', response);

      const confirmRes = await fetch("http://localhost:8000/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_hash: response.ticketId || "test_hash", 
          product_id: product.id,
          quantity: quantity,
          slug: slug
        }),
      });

      if (!confirmRes.ok) {
        console.warn("Payment succeeded but backend sync failed");
      }

      alert(`Payment Successful! Ticket ID: ${response.ticketId}`);
      onClose();

    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Check console for details.");
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md border-2 border-emerald-800 bg-white p-6 shadow-2xl"
        >
          {/* Close *}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-emerald-700 hover:text-emerald-900"
          >
            <X />
          </button>

          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="text-lime-500 fill-lime-500" />
            Instant Purchase
          </h3>

          {/* Product Info /}
          <div className="mb-4 bg-gray-50 p-4 border border-gray-100 rounded-sm">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-sm text-emerald-700/60">Item</span>
              <span className="font-bold text-emerald-900">{product.product_name}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-sm text-emerald-700/60">Price</span>
              <span className="text-2xl font-bold text-emerald-600">{product.price} <span className="text-xs text-emerald-400">MNEE</span></span>
            </div>
          </div>

          {/* Split Visualization (Optional but cool) /}
          <div className="mb-4 text-xs text-gray-400 font-mono px-2">
            <p className="mb-1 uppercase tracking-wider">Payment Distribution:</p>
            <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                {product.splits.map((s, i) => (
                    <div key={i} style={{width: `${s.percentage}%`}} className={`${i%2===0 ? 'bg-emerald-500' : 'bg-lime-400'}`} />
                ))}
            </div>
            <div className="flex justify-between mt-1">
                <span>{product.splits.length} Recipients</span>
                <span>100% Split</span>
            </div>
          </div>*/
}

{
  /* Quantity *}
          <div className="mb-6 flex items-center justify-between border-y border-gray-100 py-4">
             <span className="font-mono text-sm text-emerald-700/60">Quantity</span>
             <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 font-bold rounded"
              >
                −
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 font-bold rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* WIF Input *}
          <div className="mb-6">
            <label className="block text-xs font-bold text-emerald-800 uppercase mb-2 flex items-center gap-2">
                Sender WIF (Private Key)
            </label>
            <input 
                type="password"
                value={senderWif}
                onChange={(e) => setSenderWif(e.target.value)}
                placeholder="Enter WIF to sign..."
                className="w-full p-3 border-2 border-emerald-100 focus:border-emerald-500 outline-none font-mono text-sm rounded bg-emerald-50/30"
            />
            <div className="flex items-start gap-1.5 mt-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded">
                <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                <p>For testing only. Never paste your mainnet private key into untrusted applications.</p>
            </div>
          </div>

          {/* Total & Pay /}
          <div className="space-y-3">
             <div className="flex justify-between items-center px-1">
                <span className="font-bold text-emerald-900">Total to Pay</span>
                <span className="font-mono font-bold text-xl">{totalAmount.toFixed(2)} MNEE</span>
             </div>

             <button
                onClick={makePurchase}
                disabled={isSubmitting || !senderWif}
                className={`w-full py-3.5 rounded-lg font-bold shadow-lg transition-all
                ${senderWif && !isSubmitting 
                    ? "bg-gradient-to-r from-emerald-600 to-lime-500 text-white hover:scale-[1.01] hover:shadow-emerald-500/20" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
             >
                {isSubmitting ? "Broadcasting to 1Sat..." : "Pay & Split Instantly"}
             </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseModal;


#RPC_URL=https://rpc.sepolia.org
#MNEE_TOKEN_ADDRESS=0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
#CHAIN_ID=1


*/
}
