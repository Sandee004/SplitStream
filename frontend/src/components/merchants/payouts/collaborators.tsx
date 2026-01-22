/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Users, Plus, X, Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Collaborator } from "./types";
import { useNavigate } from "react-router-dom";

// NEW PROP INTERFACE
interface Props {
  onUpdateCount?: (count: number) => void;
}

export default function CollaboratorsCard({ onUpdateCount }: Props) {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const merchantData = JSON.parse(
        localStorage.getItem("merchantData") || "{}",
      );
      const ownerWallet = merchantData.wallet
        ? merchantData.wallet.toLowerCase()
        : "";

      if (!token) return;

      const res = await fetch("http://localhost:8000/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch data");

      const products = await res.json();
      const uniqueCollabs = new Map<string, Collaborator>();

      products.forEach((prod: any) => {
        if (!prod.splits) return;

        prod.splits.forEach((split: any) => {
          if (split.is_owner) return; // Trust the API flag

          const wallet = split.wallet_address || "";

          // Fallback check just in case
          if (wallet.toLowerCase() === ownerWallet) return;

          if (!uniqueCollabs.has(wallet)) {
            uniqueCollabs.set(wallet, {
              id: split.id.toString(),
              name: `Collaborator ${wallet.slice(0, 4)}`,
              wallet: wallet,
              total: 0,
              share: split.percentage,
            });
          }
        });
      });

      const finalCollabs = Array.from(uniqueCollabs.values());
      setCollaborators(finalCollabs);

      // REPORT THE COUNT UP TO THE PARENT
      if (onUpdateCount) {
        onUpdateCount(finalCollabs.length);
      }
    } catch (err) {
      console.error("Error loading collaborators:", err);
    } finally {
      setIsLoading(false);
    }
  }, [onUpdateCount]); // Add dependency

  useEffect(() => {
    loadCollaborators();
  }, [loadCollaborators]);

  return (
    <>
      {/* SIDEBAR CARD */}
      <div className="lg:col-span-1 bg-white border-2 border-[#065f46]/20 flex flex-col h-fit">
        <div className="px-5 py-4 border-b border-[#065f46]/10 bg-[#F2F6F4]/30">
          <h3 className="text-sm font-bold text-[#065f46] flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Earners
          </h3>
        </div>

        <div className="p-4 space-y-4 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#065f46]/30" />
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-8 text-[#065f46]/40 text-xs font-mono flex flex-col items-center">
              <Users className="w-8 h-8 mb-2 opacity-20" />
              <span>No external collaborators found.</span>
              <span className="opacity-50 mt-1">
                Add splits to your streams.
              </span>
            </div>
          ) : (
            collaborators.slice(0, 3).map((collab) => (
              <div
                key={collab.id}
                className="relative group border-b border-[#065f46]/5 last:border-0 pb-3 last:pb-0"
              >
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <p className="text-sm font-bold text-[#065f46] font-mono">
                      {collab.wallet.slice(0, 6)}...{collab.wallet.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-[#a3e635] bg-[#065f46] inline-block px-1 font-bold">
                      {collab.share}% SHARE
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto p-4 border-t border-[#065f46]/10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 text-xs font-mono border border-[#065f46]/20 hover:bg-[#065f46] hover:text-[#a3e635] transition-colors uppercase"
          >
            View All Collaborators
          </button>
        </div>
      </div>

      {/* MODAL (Keep as is) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#065f46]/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white border-2 border-[#065f46] w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#065f46]/10 bg-[#F2F6F4]">
                <h3 className="font-bold text-[#065f46] flex items-center gap-2">
                  <Users className="w-4 h-4" /> Global Collaborators
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-[#065f46]/10 p-1 rounded"
                >
                  <X className="w-5 h-5 text-[#065f46]" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-[#065f46]/60">
                    Wallets currently receiving splits from your streams.
                  </p>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate("/dashboard/streams");
                    }}
                    className="text-xs flex items-center gap-1 bg-[#a3e635] text-[#065f46] px-3 py-1 font-bold uppercase hover:brightness-110"
                  >
                    <Plus className="w-3 h-3" /> New Stream
                  </button>
                </div>

                <div className="space-y-3">
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 border border-[#065f46]/10 bg-[#F2F6F4]/30 hover:bg-[#F2F6F4] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#065f46]/10 flex items-center justify-center rounded-full text-[#065f46] font-bold text-xs">
                          {c.wallet.substring(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#065f46] font-mono">
                            {c.wallet.slice(0, 10)}...{c.wallet.slice(-8)}
                          </p>
                          <a
                            href={`https://etherscan.io/address/${c.wallet}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-[#065f46]/50 flex items-center gap-1 hover:text-[#065f46] hover:underline"
                          >
                            View on Etherscan{" "}
                            <ExternalLink className="w-2 h-2" />
                          </a>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#065f46]">
                        ~{c.share}%
                      </span>
                    </div>
                  ))}

                  {collaborators.length === 0 && (
                    <div className="text-center py-10 text-[#065f46]/40">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No collaborators yet.</p>
                      <p className="text-xs">
                        Create a stream with splits to see them here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
