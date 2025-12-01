/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ArrowRight, User, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {};
    if (!username.trim()) newErrors.username = "Required";
    if (!password.trim()) newErrors.password = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      console.log("Login data: ", data);

      // Save token
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        console.log("Saved token");
      }

      navigate("/dashboard");
    } catch {
      alert("Invalid username or password");
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
                Login
              </span>
            </div>

            <h1 className="text-2xl font-bold text-emerald-800">
              Welcome Back
            </h1>
            <p className="text-sm text-emerald-800/60 mt-2">
              Enter your credentials to access your dashboard.
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

            {/* Submit */}
            <button
              type="submit"
              className="
                w-full group relative flex items-center justify-center gap-3 py-4
                bg-lime-400 border-2 border-emerald-800 text-emerald-900 
                font-semibold transition-all
              "
            >
              Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* Don't have an account */}
            <p className="text-center text-sm mt-4 font-mono text-emerald-800/70">
              Don't have an account?{" "}
              <Link
                to="/setup"
                className="text-lime-400 font-semibold hover:underline"
              >
                Create one
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
