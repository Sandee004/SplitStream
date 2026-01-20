import { useState } from "react";
import {
  Activity,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Wallet,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  to: string;
  wallet: string;
  amount: number;
  product: string;
  time: string;
  status: "SETTLED" | "PENDING" | "FAILED";
}

interface Props {
  history: Transaction[];
  onSettle: (txId: string) => Promise<void>;
}

export default function SettlementLog({ history, onSettle }: Props) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isSettling, setIsSettling] = useState(false);

  const handleSettleClick = async () => {
    if (!selectedTx) return;
    setIsSettling(true);
    await onSettle(selectedTx.id);
    setIsSettling(false);
    // Update local modal state to show success immediately
    setSelectedTx((prev) => (prev ? { ...prev, status: "SETTLED" } : null));
  };

  return (
    <>
      {/* TABLE */}
      <div className="lg:col-span-2 bg-white border-2 border-[#065f46]/20 flex flex-col h-full">
        <div className="px-5 py-4 border-b border-[#065f46]/10 bg-[#F2F6F4]/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#065f46] flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Settlement Log
          </h3>
          <div className="flex gap-2">
            <span className="text-[10px] font-mono px-2 py-1 border border-[#065f46]/10 text-[#065f46]/60">
              FILTER: ALL
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2F6F4]/50 border-b border-[#065f46]/10">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider">
                  Source Product
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider">
                  Split Amount
                </th>
                <th className="px-6 py-3 text-center text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-mono text-[#065f46]/60 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#065f46]/5">
              {history.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-[#a3e635]/5 group cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#065f46]">
                        {tx.to}
                      </span>
                      <span className="text-[10px] font-mono text-[#065f46]/40 flex items-center gap-1">
                        {tx.wallet}{" "}
                        <ExternalLink className="w-2 h-2 opacity-0 group-hover:opacity-100" />
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-[#065f46] px-2 py-1 bg-[#065f46]/5 rounded-sm">
                      {tx.product}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-mono font-bold text-[#065f46]">
                      {tx.amount.toFixed(2)}{" "}
                      <span className="text-[10px]">MNEE</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase ${
                        tx.status === "PENDING"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-[#F2F6F4] border-[#065f46]/20 text-[#065f46]"
                      }`}
                    >
                      {tx.status === "PENDING" ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-mono text-[#065f46]/40 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {tx.time}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
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
                  onClick={() => setSelectedTx(null)}
                  className="hover:bg-[#065f46]/10 p-1 rounded"
                >
                  <X className="w-5 h-5 text-[#065f46]" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center p-4 bg-[#F2F6F4] border border-[#065f46]/10">
                  <p className="text-xs font-mono text-[#065f46]/50 mb-1">
                    TOTAL AMOUNT
                  </p>
                  <p className="text-3xl font-mono font-bold text-[#065f46]">
                    {selectedTx.amount.toFixed(2)} MNEE
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#065f46]/10 pb-2">
                    <span className="text-sm text-[#065f46]/60">Status</span>
                    <span
                      className={`text-sm font-bold ${selectedTx.status === "PENDING" ? "text-amber-600" : "text-[#065f46]"}`}
                    >
                      {selectedTx.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#065f46]/10 pb-2">
                    <span className="text-sm text-[#065f46]/60">Recipient</span>
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

                {selectedTx.status === "PENDING" ? (
                  <button
                    onClick={handleSettleClick}
                    disabled={isSettling}
                    className="w-full py-3 bg-[#065f46] text-[#a3e635] font-bold uppercase tracking-wider hover:bg-[#044c38] transition-colors flex items-center justify-center gap-2"
                  >
                    {isSettling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "⚡"
                    )}
                    {isSettling
                      ? "Processing On-Chain..."
                      : "Settle Payment Now"}
                  </button>
                ) : (
                  <a
                    href={`https://etherscan.io/address/${selectedTx.wallet}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-3 border-2 border-[#065f46] text-[#065f46] font-bold text-center uppercase tracking-wider hover:bg-[#065f46] hover:text-[#a3e635] transition-colors"
                  >
                    View Proof on Etherscan
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
