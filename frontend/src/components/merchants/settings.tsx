import { useCallback, useEffect, useState } from "react";
import { Save, User, AlertTriangle, Lock, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State to toggle visibility
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:8000/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Session expired. Please login again");
          navigate("/login");
        }
        throw new Error("Can't load dashboard data");
      }

      const data = await res.json();
      console.log(data);
      setUsername(data.username);
      setEmail(data.email);
      setWalletAddress(data.wallet_address);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    if (!username.trim() || !email.trim() || !walletAddress.trim()) {
      alert("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email,
          wallet_address: walletAddress,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const savePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/profile/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) throw new Error("Failed to update password");

      alert("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      alert("Error updating password");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete account");

      toast.success("Account deleted successfully!");
      localStorage.clear();
      navigate("/setup");
    } catch (err) {
      console.error(err);
      alert("Error deleting account. Pls try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="
          min-h-screen p-8 relative grid-bg-pattern grid-animate-scroll 
          bg-white text-emerald-900
        "
      >
        {/* Decorative corners */}
        <div className="fixed top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-emerald-800/20" />
        <div className="fixed top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-emerald-800/20" />
        <div className="fixed bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-emerald-800/20" />
        <div className="fixed bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-emerald-800/20" />

        <div className="max-w-3xl mx-auto space-y-10">
          {/* HEADER */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-lime-400" />
              <span className="text-xs font-mono text-emerald-800/60 tracking-wide">
                SETTINGS
              </span>
            </div>
            <h1 className="text-3xl pt-5 lg:pt-2 font-bold text-emerald-900">
              Account Settings
            </h1>
          </div>

          {/* PROFILE BOX */}
          <div className="relative bg-white border-2 border-emerald-800 p-0">
            {/* corners */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-lime-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-lime-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-lime-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-lime-400" />

            <div className="p-6 border-b border-emerald-800/20">
              <h2 className="text-xl font-semibold text-emerald-800 flex items-center gap-2">
                <User className="w-5 h-5" /> Profile
              </h2>
              <p className="text-sm font-mono text-emerald-700/60">
                Merchant identity & payout settings
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-mono mb-2 text-emerald-900">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="
                    w-full px-4 py-3 bg-gray-100 text-emerald-900 
                    border-2 border-emerald-800/30
                  "
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-mono mb-2 text-emerald-900">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full px-4 py-3 bg-gray-100 text-emerald-900 
                    border-2 border-emerald-800/30
                  "
                />
              </div>

              {/* Wallet */}
              <div>
                <label className="block text-sm font-mono mb-2 text-emerald-900">
                  Default Payout Wallet
                </label>
                <input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="
                    w-full px-4 py-3 bg-gray-100 text-emerald-900 
                    border-2 border-emerald-800/30 font-mono
                  "
                />
              </div>
            </div>

            <div className="p-6 border-t border-emerald-800/20 bg-gray-100">
              <button
                className={`
                  px-6 py-3 border-2 font-semibold transition ${
                    isLoading
                      ? "bg-gray-300 border-gray-500 text-gray-700 cursor-not-allowed"
                      : "bg-lime-400 border-emerald-800 text-emerald-900 hover:bg-lime-300"
                  }
  `}
                onClick={saveProfile}
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Changes
              </button>
            </div>
          </div>

          {/* PASSWORD BOX */}
          <div className="relative bg-white border-2 border-emerald-800">
            {/* corners */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-lime-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-lime-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-lime-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-lime-400" />

            <div className="p-6 border-b border-emerald-800/20">
              <h2 className="text-xl font-semibold text-emerald-900 flex items-center gap-2">
                <Lock className="w-5 h-5" /> Update Password
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Old Password */}
              <div className="relative">
                <label className="block text-sm font-mono mb-2">
                  Old Password
                </label>
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-emerald-800/30 pr-10 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowOld((prev) => !prev)}
                  className="absolute right-3 top-10 flex items-center justify-center text-emerald-800"
                >
                  {showOld ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm font-mono mb-2">
                  New Password
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-emerald-800/30 pr-10 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute right-3 top-10 flex items-center justify-center text-emerald-800"
                >
                  {showNew ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-mono mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-emerald-800/30 pr-10 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-10 flex items-center justify-center text-emerald-800"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-emerald-800/20 bg-gray-100">
              <button
                className={`
                  px-6 py-3 border-2 font-semibold transition ${
                    isLoading
                      ? "bg-gray-300 border-gray-500 text-gray-700 cursor-not-allowed"
                      : "bg-lime-400 border-emerald-800 text-emerald-900 hover:bg-lime-300"
                  }
  `}
                onClick={savePassword}
              >
                Update Password
              </button>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="relative bg-white border-2 border-red-700">
            <div className="p-6 bg-red-50 border-b border-red-700/50">
              <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm font-mono text-red-700/70">
                <span className="font-semibold">Delete Your Account</span>
                <br />
                This will permanently delete your account, including your
                profile, products, and all revenue streams. This action cannot
                be undone.
              </p>
              <button
                className="
                  px-6 py-3 border-2 border-red-700 text-red-700 
                  font-semibold hover:bg-red-700 hover:text-white transition
                "
                onClick={() => {
                  if (confirm("Are you sure? This cannot be undone.")) {
                    deleteAccount();
                  }
                }}
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
