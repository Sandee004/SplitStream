/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  DollarSign,
} from "lucide-react";
import Web3 from "web3";

const CHAIN_ID = 1;
const MNEE_TOKEN_ADDRESS = "0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf";
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

type Payout = {
  id: number;
  recipient_wallet: string;
  amount: number;
  product_name: string;
  status: "unpaid" | "processing" | "paid";
  created_at: string;
};

export default function Payouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 1. Fetch Payouts
  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/payouts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data);
      }
    } catch (err) {
      console.error("Failed to fetch payouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  // 2. Handle Payment
  const handleSettle = async (payout: Payout) => {
    try {
      setProcessingId(payout.id);

      if (!window.ethereum) return alert("Metamask not found");
      const web3 = new Web3(window.ethereum);

      // B. Switch Network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: web3.utils.toHex(CHAIN_ID) }],
        });
      } catch {
        return alert("Please switch to Ethereum Mainnet");
      }

      // C. Get User Wallet
      const accounts = await web3.eth.requestAccounts();
      const walletAddress = accounts[0];

      // D. Send Transaction
      const contract = new web3.eth.Contract(
        ERC20_ABI as any,
        MNEE_TOKEN_ADDRESS
      );
      const amountWei = web3.utils.toWei(payout.amount.toString(), "ether");

      const tx = await contract.methods
        .transfer(payout.recipient_wallet, amountWei)
        .send({ from: walletAddress });

      // E. Update Backend
      if (tx.transactionHash) {
        const token = localStorage.getItem("token");
        await fetch(
          `http://localhost:8000/api/payouts/${payout.id}/mark-paid`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ tx_hash: tx.transactionHash }),
          }
        );

        // Remove from list or mark as paid locally
        setPayouts((prev) => prev.filter((p) => p.id !== payout.id));
        alert("Settlement Successful!");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 4001) return; // User rejected
      alert("Transaction failed.");
    } finally {
      setProcessingId(null);
    }
  };

  // Calculate Stats
  const totalOwed = payouts.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-white text-[#1a3a2a]">
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#1a3a2a]" />
            Settlements
          </h1>
          <p className="text-[#1a3a2a]/60 mt-1 text-sm">
            Review and settle pending splits with your partners.
          </p>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-[#1a3a2a] text-[#a8e6cf] px-6 py-4 rounded-lg shadow-lg flex items-center gap-4">
          <div className="p-3 bg-[#a8e6cf]/10 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-70">
              Total Pending
            </p>
            <p className="text-2xl font-bold font-mono">
              {totalOwed.toFixed(2)} MNEE
            </p>
          </div>
        </div>
      </header>

      {/* LIST */}
      <div className="max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a3a2a]/30" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#1a3a2a]/10 rounded-lg bg-[#f5f5f5]/50">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold">All Settled Up!</h3>
            <p className="text-[#1a3a2a]/50">You have no pending payouts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {payouts.map((payout) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="group border border-[#1a3a2a]/10 hover:border-[#1a3a2a]/30 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* INFO */}
                  <div className="flex items-start gap-4">
                    <div
                      className="mt-1 w-2 h-2 rounded-full bg-amber-400 shrink-0"
                      title="Pending"
                    />
                    <div>
                      <h4 className="font-bold text-lg font-mono">
                        {payout.amount.toFixed(2)} MNEE
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-[#1a3a2a]/60 mt-1">
                        <span>To:</span>
                        <span className="font-mono bg-[#f5f5f5] px-2 py-0.5 rounded text-[#1a3a2a]">
                          {payout.recipient_wallet.slice(0, 6)}...
                          {payout.recipient_wallet.slice(-4)}
                        </span>
                      </div>
                      <p className="text-xs text-[#1a3a2a]/40 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        From sale:{" "}
                        <span className="font-medium">
                          {payout.product_name || "Unknown Product"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* ACTION */}
                  <button
                    onClick={() => handleSettle(payout)}
                    disabled={processingId === payout.id}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1a3a2a] text-[#a8e6cf] font-bold rounded hover:bg-[#1a3a2a]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
                  >
                    {processingId === payout.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Signing...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">Settle</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
