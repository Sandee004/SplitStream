import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

type Product = {
  id: number;
  product_name: string;
  price: number;
};

type PurchaseModalProps = {
  product: Product | null;
  onClose: () => void;
};

const PurchaseModal = ({ product, onClose }: PurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const total = product.price * quantity;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal Card */}
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
            className="w-full py-3 rounded-md bg-lime-400 hover:bg-lime-500 
                       text-emerald-900 font-bold transition-colors"
          >
            Confirm Purchase
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseModal;
