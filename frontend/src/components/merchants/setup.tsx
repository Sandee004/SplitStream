import React, { useState } from "react";
import { ArrowRight, User, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SetupPage() {
  const navigate = useNavigate();
  const [alias, setAlias] = useState("");
  const [wallet, setWallet] = useState("");
  const [errors, setErrors] = useState<{ alias?: string; wallet?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { alias?: string; wallet?: string } = {};

    if (!alias.trim()) newErrors.alias = "Required";
    if (!wallet.trim()) {
      newErrors.wallet = "Required";
    } else if (wallet.length < 10) {
      newErrors.wallet = "Invalid wallet address";
    }

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage:
          "linear-gradient(rgba(6,95,70,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,95,70,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Corner decorations */}
      <div
        className="fixed top-8 left-8 w-8 h-8"
        style={{
          borderLeft: "2px solid #065f4626",
          borderTop: "2px solid #065f4626",
        }}
      />
      <div
        className="fixed top-8 right-8 w-8 h-8"
        style={{
          borderRight: "2px solid #065f4626",
          borderTop: "2px solid #065f4626",
        }}
      />
      <div
        className="fixed bottom-8 left-8 w-8 h-8"
        style={{
          borderLeft: "2px solid #065f4626",
          borderBottom: "2px solid #065f4626",
        }}
      />
      <div
        className="fixed bottom-8 right-8 w-8 h-8"
        style={{
          borderRight: "2px solid #065f4626",
          borderBottom: "2px solid #065f4626",
        }}
      />

      <div className="w-full max-w-lg">
        {/* Card */}
        <div
          className="relative"
          style={{
            backgroundColor: "white",
            border: "2px solid #065f46",
          }}
        >
          {/* Corner accents */}
          <div
            className="absolute -top-1 -left-1 w-4 h-4"
            style={{
              borderTop: "2px solid #a3e635",
              borderLeft: "2px solid #a3e635",
            }}
          />
          <div
            className="absolute -top-1 -right-1 w-4 h-4"
            style={{
              borderTop: "2px solid #a3e635",
              borderRight: "2px solid #a3e635",
            }}
          />
          <div
            className="absolute -bottom-1 -left-1 w-4 h-4"
            style={{
              borderBottom: "2px solid #a3e635",
              borderLeft: "2px solid #a3e635",
            }}
          />
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4"
            style={{
              borderBottom: "2px solid #a3e635",
              borderRight: "2px solid #a3e635",
            }}
          />

          {/* Header */}
          <div className="p-6" style={{ borderBottom: "1px solid #065f4633" }}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2"
                style={{ backgroundColor: "#a3e635" }}
              ></div>
              <span
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: "#065f4680" }}
              >
                Initialization
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#065f46" }}>
              Establish Origin Identity
            </h1>
            <p className="text-sm mt-2" style={{ color: "#065f4666" }}>
              Configure your merchant profile to begin receiving programmable
              payments.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Merchant Alias */}
            <div>
              <label
                className="flex items-center gap-2 text-sm font-medium mb-2"
                style={{ color: "#065f46" }}
              >
                <User className="w-4 h-4" />
                Merchant Alias
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => {
                    setAlias(e.target.value);
                    setErrors((prev) => ({ ...prev, alias: undefined }));
                  }}
                  placeholder="e.g., Acme Studio"
                  className="w-full px-4 py-3 transition-colors"
                  style={{
                    backgroundColor: "#f7f7f7",
                    border: `2px solid ${
                      errors.alias ? "#dc2626" : "#065f4633"
                    }`,
                    color: "#065f46",
                  }}
                />
                {errors.alias && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                    style={{ color: "#dc2626" }}
                  >
                    {errors.alias}
                  </span>
                )}
              </div>
            </div>

            {/* Wallet */}
            <div>
              <label
                className="flex items-center gap-2 text-sm font-medium mb-2"
                style={{ color: "#065f46" }}
              >
                <Wallet className="w-4 h-4" />
                Default Payout Wallet
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => {
                    setWallet(e.target.value);
                    setErrors((prev) => ({ ...prev, wallet: undefined }));
                  }}
                  placeholder="0x..."
                  className="w-full px-4 py-3 font-mono text-sm transition-colors"
                  style={{
                    backgroundColor: "#f7f7f7",
                    border: `2px solid ${
                      errors.wallet ? "#dc2626" : "#065f4633"
                    }`,
                    color: "#065f46",
                  }}
                />
                {errors.wallet && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                    style={{ color: "#dc2626" }}
                  >
                    {errors.wallet}
                  </span>
                )}
              </div>
              <p
                className="text-xs mt-2 font-mono"
                style={{ color: "#065f4680" }}
              >
                This will be your primary revenue destination.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full group relative flex items-center justify-center gap-3 py-4 border-2 font-semibold transition-all"
              style={{
                backgroundColor: "#a3e635",
                borderColor: "#065f46",
                color: "#064e3b",
              }}
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div
            className="px-6 py-4"
            style={{
              borderTop: "1px solid #065f461A",
              backgroundColor: "#f2f2f2",
            }}
          >
            <p
              className="text-xs font-mono text-center"
              style={{ color: "#065f4644" }}
            >
              DATA_ENCRYPTED • LOCAL_STORAGE_ONLY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
