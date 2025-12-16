/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2, Clock, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

interface Transaction {
  id: string;
  txHash: string;
  productName: string;
  amount: number;
  timestamp: Date;
}

const History = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const navigate = useNavigate();

  const loadTransactionHistory = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:8000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Session expired. Please login again");
          navigate("/login");
        }
        throw new Error("Failed to load transactions");
      }

      const data = await res.json();
      console.log(data);

      const mapped: Transaction[] = data.map((tx: any) => ({
        id: tx.id.toString(),
        txHash: tx.tx_hash,
        productName: tx.product_name ?? "Unknown Product",
        amount: tx.amount,
        timestamp: new Date(tx.bought_at),
      }));

      setTransactions(mapped);
    } catch (err) {
      console.error("Transaction Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadTransactionHistory();
  }, [loadTransactionHistory]);

  const goToTx = (hash: string) => {
    navigate(`/tx/${hash}`);
  };

  const availableMonths = Array.from(
    new Set(transactions.map((tx) => getMonthKey(tx.timestamp)))
  ).sort((a, b) => b.localeCompare(a));

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.productName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesMonth =
      selectedMonth === "all" || getMonthKey(tx.timestamp) === selectedMonth;

    return matchesSearch && matchesMonth;
  });

  return (
    <div className="min-h-screen relative grid-bg-pattern grid-animate-scroll">
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white border border-[#BED4C7] p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#1a3a2a] animate-spin" />
            <span className="font-mono text-sm text-[#1a3a2a]">
              Getting Transaction History...
            </span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b-2 border-[#1a3a2a]/20">
        <div>
          <h1 className="text-xl font-bold text-[#065f46]">
            Transaction History
          </h1>
          <p className="text-sm text-[#065f46]/50">
            Complete ledger of all inflow events.
          </p>
        </div>
        <span className="text-xs font-mono text-[#065f46]/50 px-2 py-1 bg-[#F2F6F4] border border-[#065f46]/10">
          LIVE_FEED
        </span>
      </header>

      {/* FILTER BAR */}
      <div className="my-5 flex flex-col mx-4 sm:flex-row gap-4">
        {/* MONTH FILTER */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-3 border border-[#065f46]/20 bg-white text-sm font-mono text-[#065f46] focus:outline-none"
        >
          <option value="all">All Months</option>
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-3 border border-[#065f46]/20 bg-white text-sm font-mono text-[#065f46] focus:outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white mx-4 border-2 border-[#065f46]/20">
        <div className="px-6 py-4 border-b border-[#065f46]/10 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#065f46]/60" />
          <h3 className="font-semibold text-[#065f46]">Recent Inflow Events</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#065f46]/10 bg-[#F2F6F4]/50">
                <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                  TX Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                  Amount Split
                </th>
                <th className="px-6 py-3 text-right text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                  Time
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#065f46]/5">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-[#a3e635]/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[#065f46]">
                        {truncateHash(tx.txHash)}
                      </span>
                      <ExternalLink
                        className="w-3 h-3 text-[#065f46]/30 opacity-0 group-hover:opacity-100 cursor-pointer"
                        onClick={() => goToTx(tx.txHash)}
                      />
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#065f46]">
                    {tx.productName}
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-[#065f46]">
                    {tx.amount.toFixed(2)}{" "}
                    <span className="text-[#065f46]/50">MNEE</span>
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-xs text-[#065f46]/50">
                    {formatTimeAgo(tx.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-[#065f46]/10 bg-[#F2F6F4]/30">
          <p className="text-xs text-[#065f46]/40 font-mono text-center">
            Showing {transactions.length} most recent transactions
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;
