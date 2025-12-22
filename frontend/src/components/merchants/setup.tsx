/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ArrowRight, User, Wallet, Check, X, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
//import CryptoJS from "crypto-js";

export default function SetupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoWallet, setAutoWallet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWalletValid, setIsWalletValid] = useState<boolean | null>(null);

  const [errors, setErrors] = useState<{
    username?: string;
    walletAddress?: string;
    email?: string;
    password?: string;
  }>({});

  const validateAddress = (address: string) => {
    if (!address) {
      setIsWalletValid(null);
      return false;
    }

    const isValid = ethers.isAddress(address);
    setIsWalletValid(isValid);
    return isValid;
  };

  async function generateWallet(password: string) {
    const wallet = ethers.Wallet.createRandom();
    const salt = crypto.getRandomValues(new Uint8Array(16)); //used to protect password
    const iv = crypto.getRandomValues(new Uint8Array(12)); // used to protect encryption

    const encoder = new TextEncoder(); //convert password from string to raw byte(Unit8Array)

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 310000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const encryptedPrivateKeyBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encoder.encode(wallet.privateKey)
    );

    const encryptedPrivateKey = btoa(
      String.fromCharCode(...new Uint8Array(encryptedPrivateKeyBuffer))
    );

    return {
      address: wallet.address,
      encryptedPrivateKey,
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
      mnemonic: wallet.mnemonic?.phrase,
    };
  }

  const handleGenerateWallet = async () => {
    const walletData = await generateWallet(password);

    setWalletAddress(walletData.address);
    console.log(walletData);

    alert("SAVE THIS SEED PHRASE NOW:\n\n" + walletData.mnemonic);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    const newErrors: any = {};

    if (!username.trim()) newErrors.username = "Required";
    if (!email.trim()) newErrors.email = "Required";
    if (!password.trim()) newErrors.password = "Required";

    if (!walletAddress.trim()) {
      newErrors.walletAddress = "Required";
    } else if (!ethers.isAddress(walletAddress)) {
      newErrors.walletAddress = "Invalid Ethereum Address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, walletAddress }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      navigate("/dashboard");
    } catch (err) {
      alert("Error setting up account");
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center p-6 
        bg-white relative overflow-hidden grid-bg-pattern grid-animate-scroll
      "
    >
      {/* Corner decorations */}
      <div className="fixed top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-emerald-800/20" />
      <div className="fixed top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-emerald-800/20" />
      <div className="fixed bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-emerald-800/20" />
      <div className="fixed bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-emerald-800/20" />

      <div className="w-full max-w-lg">
        <div className="relative bg-white border-2 border-emerald-800">
          {/* Card corner accents */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-lime-400" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-lime-400" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-lime-400" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-lime-400" />

          {/* Header */}
          <div className="p-6 border-b border-emerald-800/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-lime-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-800/60">
                Initialization
              </span>
            </div>

            <h1 className="text-2xl font-bold text-emerald-800">
              Establish Origin Identity
            </h1>
            <p className="text-sm text-emerald-800/60 mt-2">
              Configure your merchant profile to begin receiving programmable
              payments.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-emerald-800">
                <User className="w-4 h-4" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((p) => ({ ...p, username: undefined }));
                }}
                placeholder="e.g., sandee_dev"
                className={`
                  w-full px-4 py-3 bg-gray-100 text-emerald-800 
                  border-2 transition-colors 
                  ${
                    errors.username ? "border-red-600" : "border-emerald-800/30"
                  }
                `}
              />
              {errors.username && (
                <p className="text-xs mt-1 font-mono text-red-600">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-emerald-800">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="you@example.com"
                className={`
                  w-full px-4 py-3 bg-gray-100 text-emerald-800 
                  border-2 transition-colors 
                  ${errors.email ? "border-red-600" : "border-emerald-800/30"}
                `}
              />
              {errors.email && (
                <p className="text-xs mt-1 font-mono text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-emerald-800">
                <Lock className="w-4 h-4" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="••••••••"
                className={`
                  w-full px-4 py-3 bg-gray-100 text-emerald-800 
                  border-2 transition-colors 
                  ${
                    errors.password ? "border-red-600" : "border-emerald-800/30"
                  }
                `}
              />
              {errors.password && (
                <p className="text-xs mt-1 font-mono text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Wallet */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-emerald-800">
                <Wallet className="w-4 h-4" /> Default Payout Wallet
              </label>

              {/* 6. Added 'relative' wrapper for icon positioning */}
              <div className="relative">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWalletAddress(val);
                    validateAddress(val); // Trigger real-time validation
                    setErrors((p) => ({ ...p, walletAddress: undefined }));
                  }}
                  placeholder="0x..."
                  disabled={autoWallet}
                  // Added 'pr-10' to prevent text overlapping the icon
                  className={`
                    w-full px-4 py-3 pr-10 bg-gray-100 text-emerald-800 font-mono text-sm
                    border-2 transition-colors disabled:opacity-60 
                    ${
                      // Logic: Red border if error OR explicitly invalid state
                      errors.walletAddress || isWalletValid === false
                        ? "border-red-600 focus:border-red-600"
                        : isWalletValid === true
                        ? "border-emerald-600 focus:border-emerald-600"
                        : "border-emerald-800/30"
                    }
                  `}
                />

                {/* 7. The Validation Icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300">
                  {/* Show Green Check if valid */}
                  {walletAddress && isWalletValid === true && (
                    <Check
                      className="w-5 h-5 text-emerald-600 opacity-60"
                      strokeWidth={3}
                    />
                  )}

                  {/* Show Red X if invalid */}
                  {walletAddress && isWalletValid === false && (
                    <X
                      className="w-5 h-5 text-red-500 opacity-60"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>

              {errors.walletAddress && (
                <p className="text-xs mt-1 font-mono text-red-600">
                  {errors.walletAddress}
                </p>
              )}

              <div className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={autoWallet}
                  onChange={(e) => {
                    setAutoWallet(e.target.checked);
                    if (e.target.checked) handleGenerateWallet();
                    else {
                      setWalletAddress("");
                      setIsWalletValid(null);
                    }
                  }}
                />
                <span className="text-xs font-mono text-emerald-800/60">
                  Generate a new wallet automatically
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full group relative flex items-center justify-center gap-3 py-4 border-2 font-semibold transition-all ${
                loading
                  ? "bg-gray-300 border-gray-500 text-gray-700 cursor-not-allowed"
                  : "bg-lime-400 border-emerald-800 text-emerald-900"
              }
  `}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Already have an account */}
            <p className="text-center text-sm mt-4 font-mono text-emerald-800/70">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-lime-400 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-emerald-800/10 bg-gray-200">
            <p className="text-xs font-mono text-center text-emerald-800/40">
              DATA_ENCRYPTED • LOCAL_STORAGE_ONLY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
