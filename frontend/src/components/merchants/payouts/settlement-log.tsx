/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Wallet,
  Loader2,
  LogIn,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "./types";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useConnect,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { parseUnits } from "viem";

const MNEE_ADDRESS = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";
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

interface Props {
  history: Transaction[];
  onSuccess?: () => void;
}

type FilterStatus = "ALL" | "PENDING" | "SETTLED";

export default function SettlementLog({ history = [], onSuccess }: Props) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  // --- WAGMI HOOKS ---
  const { isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const {
    data: hash,
    isPending: isWalletLoading,
    writeContract,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // --- FILTER LOGIC ---
  const filteredHistory = useMemo(() => {
    if (filter === "ALL") return history;
    return history.filter((tx) =>
      filter === "PENDING" ? tx.status === "PENDING" : tx.status !== "PENDING",
    );
  }, [history, filter]);

  const toggleFilter = () => {
    if (filter === "ALL") setFilter("PENDING");
    else if (filter === "PENDING") setFilter("SETTLED");
    else setFilter("ALL");
  };

  useEffect(() => {
    if (isConfirmed && selectedTx) {
      handleBackendUpdate(selectedTx.id, hash!);
    }
  }, [isConfirmed, hash, selectedTx]); // eslint-disable-line

  const handleBackendUpdate = async (txId: string, txHash: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8000/api/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tx_hash: txId, confirmation_hash: txHash }),
      });
      setTimeout(() => {
        setSelectedTx(null);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error("Backend update failed:", err);
    }
  };

  const handleSettleClick = () => {
    if (!selectedTx) return;
    try {
      writeContract({
        address: MNEE_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [
          selectedTx.wallet,
          parseUnits((selectedTx.amount || 0).toString(), 18),
        ],
      });
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <>
      {/* CONTAINER: Fixed height removed from here, applied to scroll area below */}
      <div className="lg:col-span-2 bg-white border-2 border-[#065f46]/20 flex flex-col">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[#065f46]/10 bg-[#F2F6F4]/30 flex justify-between items-center shrink-0">
          <h3 className="text-sm font-bold text-[#065f46] flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Settlement Log
          </h3>
          <div className="flex gap-2">
            <button
              onClick={toggleFilter}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 border border-[#065f46]/20 text-[#065f46] hover:bg-[#065f46] hover:text-[#a8e6cf] transition-colors uppercase"
            >
              <Filter className="w-3 h-3" />
              FILTER: {filter}
            </button>
          </div>
        </div>

        {/* TABLE HEADER (Sticky) */}
        <div className="bg-[#F2F6F4]/50 border-b border-[#065f46]/10 shrink-0">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider w-[30%]">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider w-[20%]">
                  Source
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider w-[20%]">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider w-[15%]">
                  Time
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* SCROLLABLE TABLE BODY */}
        {/* h-[500px] forces the height, overflow-y-auto enables scroll */}
        <div className="overflow-y-auto h-[500px]">
          <table className="w-full">
            <tbody className="divide-y divide-[#065f46]/5">
              {!filteredHistory || filteredHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[#065f46]/40 font-mono text-xs"
                  >
                    No {filter !== "ALL" ? filter.toLowerCase() : ""} payouts
                    found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((tx) => (
                  <tr
                    key={tx?.id || Math.random()}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-[#a3e635]/5 group cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 w-[30%]">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#065f46]">
                          {tx?.to || "Unknown"}
                        </span>
                        <span className="text-[10px] font-mono text-[#065f46]/40 flex items-center gap-1">
                          {tx?.wallet
                            ? `${tx.wallet.slice(0, 6)}...${tx.wallet.slice(-4)}`
                            : "No Wallet"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-[20%]">
                      <span className="text-xs text-[#065f46] px-2 py-1 bg-[#065f46]/5 rounded-sm truncate block max-w-[120px]">
                        {tx?.product || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right w-[20%]">
                      <span className="text-sm font-mono font-bold text-[#065f46]">
                        {Number(tx?.amount || 0).toFixed(2)}{" "}
                        <span className="text-[10px]">MNEE</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center w-[15%]">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase ${
                          tx?.status === "PENDING"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-[#F2F6F4] border-[#065f46]/20 text-[#065f46]"
                        }`}
                      >
                        {tx?.status === "PENDING" ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {tx?.status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right w-[15%]">
                      <span className="text-xs font-mono text-[#065f46]/40 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {tx?.time ? tx.time.split(" ")[0] : ""}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (Keep your existing Modal code here) */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#065f46]/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-[#065f46] w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#065f46]/10 bg-[#F2F6F4]">
                <h3 className="font-bold text-[#065f46] flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Transaction Details
                </h3>
                <button
                  onClick={() => !isWalletLoading && setSelectedTx(null)}
                  className="hover:bg-[#065f46]/10 p-1 rounded"
                >
                  <X className="w-5 h-5 text-[#065f46]" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center p-4 bg-[#F2F6F4] border border-[#065f46]/10">
                  <p className="text-xs font-mono text-[#065f46]/50 mb-1">
                    AMOUNT DUE
                  </p>
                  <p className="text-3xl font-mono font-bold text-[#065f46]">
                    {Number(selectedTx.amount || 0).toFixed(2)} MNEE
                  </p>
                </div>

                {isConfirmed ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-emerald-800 font-bold">
                      Settlement Confirmed!
                    </p>
                    <p className="text-xs text-emerald-600">
                      Blockchain transaction successful.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-[#065f46]/10 pb-2">
                      <span className="text-sm text-[#065f46]/60">Status</span>
                      <span
                        className={`text-sm font-bold ${
                          selectedTx.status === "PENDING"
                            ? "text-amber-600"
                            : "text-[#065f46]"
                        }`}
                      >
                        {selectedTx.status}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#065f46]/10 pb-2">
                      <span className="text-sm text-[#065f46]/60">
                        Recipient
                      </span>
                      <span className="text-sm font-bold text-[#065f46]">
                        {selectedTx.to}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-sm text-[#065f46]/60">Wallet</span>
                      <span className="text-sm font-mono text-[#065f46]">
                        {selectedTx.wallet}
                      </span>
                    </div>
                  </div>
                )}

                {/* --- SMART ACTION BUTTON --- */}
                {selectedTx.status === "PENDING" && !isConfirmed ? (
                  <>
                    {!isConnected ? (
                      <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full py-3 bg-[#065f46] text-[#a3e635] font-bold uppercase tracking-wider hover:bg-[#044c38] transition-colors flex items-center justify-center gap-2"
                      >
                        {isConnecting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogIn className="w-4 h-4" />
                        )}
                        {isConnecting
                          ? "Connecting..."
                          : "Connect Wallet to Pay"}
                      </button>
                    ) : (
                      <button
                        onClick={handleSettleClick}
                        disabled={isWalletLoading || isConfirming}
                        className="w-full py-3 bg-[#065f46] text-[#a3e635] font-bold uppercase tracking-wider hover:bg-[#044c38] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isWalletLoading || isConfirming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "⚡"
                        )}
                        {isWalletLoading
                          ? "Check Wallet..."
                          : isConfirming
                            ? "Verifying on Chain..."
                            : "Authorize Payout"}
                      </button>
                    )}
                    {writeError && (
                      <p className="text-xs text-red-500 text-center mt-2">
                        {writeError.message.slice(0, 60)}...
                      </p>
                    )}
                  </>
                ) : (
                  selectedTx.status !== "PENDING" && (
                    <a
                      href={`https://etherscan.io/address/${selectedTx.wallet}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full py-3 border-2 border-[#065f46] text-[#065f46] font-bold text-center uppercase tracking-wider hover:bg-[#065f46] hover:text-[#a3e635] transition-colors"
                    >
                      View Proof on Etherscan
                    </a>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
