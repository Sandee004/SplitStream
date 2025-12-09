/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { X, ChevronRight, Check, AlertCircle, Loader2 } from "lucide-react";
import SplitInputRow from "./split-input-row";
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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantWallet: string;
  product: Product | null;
  onSuccess: () => void; // <--- Added this prop
}

export default function ProductModal({
  isOpen,
  merchantWallet,
  onClose,
  product,
  onSuccess, // <--- Destructured here
}: ProductModalProps) {
  const ownerWallet = merchantWallet;
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [splits, setSplits] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  // Initialize Data
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      // EDIT MODE
      setName(product.product_name);
      setPrice(product.price.toString());

      const formattedSplits = product.splits.map((s: any) => ({
        ...s,
        isOwner: s.wallet_address === ownerWallet,
      }));

      setSplits(formattedSplits);
      setStep(1);
      setErrors({});
    } else {
      // CREATE MODE
      setName("");
      setPrice("");
      setSplits([
        {
          id: crypto.randomUUID(),
          wallet_address: ownerWallet,
          percentage: 100,
          isOwner: true,
        },
      ]);
      setStep(1);
      setErrors({});
    }
  }, [isOpen, product, ownerWallet]);

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  const isValidTotal = totalPercentage === 100;

  // Split Logic Handlers
  const handleAddCollaborator = () => {
    const newSplit: any = {
      id: crypto.randomUUID(),
      wallet_address: "",
      percentage: 0,
    };
    const ownerSplit = splits.find((s) => s.isOwner);
    if (ownerSplit && ownerSplit.percentage >= 20) {
      setSplits((prev) =>
        prev.map((s) =>
          s.isOwner ? { ...s, percentage: s.percentage - 20 } : s
        )
      );
      newSplit.percentage = 20;
    }
    setSplits((prev) => [...prev, newSplit]);
  };

  const handleRemoveCollaborator = (id: string) => {
    const splitToRemove = splits.find((s) => s.id === id);
    if (!splitToRemove) return;
    setSplits((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s) =>
          s.isOwner
            ? { ...s, percentage: s.percentage + splitToRemove.percentage }
            : s
        )
    );
  };

  const handleUpdateSplit = (id: string, updates: Partial<any>) => {
    setSplits((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleStep1Submit = () => {
    const newErrors: { name?: string; price?: string } = {};
    if (!name.trim()) newErrors.name = "Required";
    if (!price || Number.parseFloat(price) <= 0)
      newErrors.price = "Invalid price";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep(2);
  };

  // =========================================================
  //  DEPLOY HANDLER
  // =========================================================
  const handleDeploy = async () => {
    if (!isValidTotal) return;

    const productData = {
      product_name: name.trim(),
      price: Number.parseFloat(price),
      splits,
    };

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      // Dynamic URL & Method Selection
      let url = "http://localhost:8000/api/add-product";
      let method = "POST";

      if (product) {
        url = `http://localhost:8000/api/update-product/${product.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save product");
      }

      // Wait for response, but we don't need the data since we refetch
      await res.json();

      // Trigger Parent Refresh
      onSuccess();

      // Close Modal
      onClose();
    } catch (err: any) {
      console.error("Error deploying product:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(26,58,42,0.4)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-white border-2 border-[#1a3a2a]">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#a8e6cf]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#a8e6cf]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#a8e6cf]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#a8e6cf]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a3a2a]">
          <div>
            <span className="font-mono text-xs text-[#1a3a2a] uppercase tracking-wider">
              {product ? "Edit Stream" : "New Stream"} • Step {step}/2
            </span>
            <h2 className="text-xl font-bold text-[#1a3a2a] mt-1">
              {step === 1 ? "Stream Basics" : "Programmable Splits"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] transition-colors border border-[#1a3a2a]/20"
          >
            <X className="w-5 h-5 text-[#1a3a2a]" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 bg-[#f5f5f5]/50 border-b border-[#1a3a2a]/10 flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              step === 1 ? "text-[#1a3a2a]" : "text-[#1a3a2a]/40"
            }`}
          >
            <div
              className={`w-6 h-6 flex items-center justify-center text-xs font-mono ${
                step > 1
                  ? "bg-[#a8e6cf] text-[#1a3a2a]"
                  : step === 1
                  ? "bg-[#1a3a2a] text-white"
                  : "bg-[#1a3a2a]/20"
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span className="text-sm font-medium">Basics</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#1a3a2a]/30" />
          <div
            className={`flex items-center gap-2 ${
              step === 2 ? "text-[#1a3a2a]" : "text-[#1a3a2a]/40"
            }`}
          >
            <div
              className={`w-6 h-6 flex items-center justify-center text-xs font-mono ${
                step === 2 ? "bg-[#1a3a2a] text-white" : "bg-[#1a3a2a]/20"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Split Engine</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1a3a2a] mb-2">
                  Stream Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g., AI Art Pack"
                  className={`w-full px-4 py-3 bg-[#f5f5f5] border-2 ${
                    errors.name ? "border-[#e53e3e]" : "border-[#1a3a2a]/20"
                  } focus:border-[#1a3a2a] focus:outline-none transition-colors text-[#1a3a2a] placeholder:text-[#1a3a2a]/30`}
                />
                {errors.name && (
                  <span className="text-xs text-[#e53e3e] mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a3a2a] mb-2">
                  Total Price (MNEE)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 bg-[#f5f5f5] border-2 font-mono ${
                      errors.price ? "border-[#e53e3e]" : "border-[#1a3a2a]/20"
                    } focus:border-[#1a3a2a] focus:outline-none transition-colors text-[#1a3a2a] placeholder:text-[#1a3a2a]/30`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[#1a3a2a]/50 text-sm">
                    MNEE
                  </span>
                </div>
                {errors.price && (
                  <span className="text-xs text-[#e53e3e] mt-1 block">
                    {errors.price}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {splits.map((split, index) => (
                  <SplitInputRow
                    key={split.id}
                    split={split}
                    index={index}
                    onUpdate={(updates) => handleUpdateSplit(split.id, updates)}
                    onRemove={() => handleRemoveCollaborator(split.id)}
                    canRemove={!split.isOwner}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddCollaborator}
                className="w-full py-3 border-2 border-dashed border-[#1a3a2a]/30 text-[#1a3a2a]/70 hover:border-[#1a3a2a] hover:text-[#1a3a2a] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl leading-none">+</span>
                <span className="font-medium">Add Collaborator</span>
              </button>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#1a3a2a]">
                    Split Distribution
                  </span>
                  <span
                    className={`font-mono text-sm font-semibold ${
                      isValidTotal ? "text-[#1a3a2a]" : "text-[#e53e3e]"
                    }`}
                  >
                    {totalPercentage}%
                  </span>
                </div>

                <div className="h-4 bg-[#1a3a2a]/10 flex overflow-hidden border border-[#1a3a2a]/20">
                  {splits.map((split, idx) => (
                    <div
                      key={split.id}
                      style={{ width: `${split.percentage}%` }}
                      className={`h-full transition-all duration-300 ${
                        split.isOwner
                          ? "bg-[#1a3a2a]"
                          : idx % 2 === 0
                          ? "bg-[#a8e6cf]"
                          : "bg-[#70c49b]"
                      }`}
                    />
                  ))}
                  {totalPercentage < 100 && (
                    <div
                      style={{ width: `${100 - totalPercentage}%` }}
                      className="h-full bg-[#e53e3e]/30"
                    />
                  )}
                </div>

                {!isValidTotal && (
                  <div className="flex items-center gap-2 mt-2 text-[#e53e3e]">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">
                      {totalPercentage < 100
                        ? `Missing ${100 - totalPercentage}% allocation`
                        : `Exceeds 100% by ${totalPercentage - 100}%`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a3a2a]/20 bg-[#f5f5f5]/30 flex items-center justify-between gap-4">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 text-[#1a3a2a]/70 hover:text-[#1a3a2a] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStep1Submit}
                className="flex items-center gap-2 bg-[#1a3a2a] hover:bg-[#0f2a1e] text-white font-semibold px-6 py-3 transition-colors"
              >
                <span>Continue to Splits</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-[#1a3a2a]/70 hover:text-[#1a3a2a] transition-colors font-medium"
              >
                ← Back
              </button>
              <button
                onClick={handleDeploy}
                disabled={!isValidTotal || isSubmitting}
                className={`flex items-center gap-2 font-semibold px-8 py-3 transition-all border-2 ${
                  isValidTotal && !isSubmitting
                    ? "bg-[#a8e6cf] hover:bg-[#c6f0d5] text-[#1a3a2a] border-[#1a3a2a]"
                    : "bg-[#f5f5f5] text-[#1a3a2a]/30 border-[#1a3a2a]/20 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <span>Deploy Programmable Stream</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
