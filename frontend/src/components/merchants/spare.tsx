{
  /*import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Transaction {
  id: string;
  txHash: string;
  productName: string;
  amount: number;
  timestamp: Date;
}

interface HistoryProps {
  transactions: Transaction[];
}


const History = ({ transactions }: HistoryProps) => {
  const navigate = useNavigate();
  const [visibleMonths, setVisibleMonths] = useState(MONTHS_PER_BATCH);
  const MONTHS_PER_BATCH = 3;

  const currentMonth = month[0];
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>(() => ({
    [currentMonthKey]: true,
  }));

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setVisibleMonths((v) =>
          Math.min(v + MONTHS_PER_BATCH, monthKeys.length)
        );
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [monthKeys.length]);

  const toggleMonth = (key: string) => {
    setOpenMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="
        min-h-screen p-8 relative grid-bg-pattern grid-animate-scroll
        bg-white text-emerald-900
      "
    >
      {/* Decorative corners *}
      <div className="fixed top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-emerald-800/20" />
      <div className="fixed top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-emerald-800/20" />
      <div className="fixed bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-emerald-800/20" />
      <div className="fixed bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-emerald-800/20" />

      <div className="max-w-6xl mx-auto space-y-16">
        {/* HEADER *}
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-400" />
            <span className="text-xs font-mono text-emerald-800/60 tracking-wide">
              HISTORY
            </span>
          </div>

          <h1 className="text-3xl font-bold text-emerald-900">
            Transaction History
          </h1>

          <p className="text-sm text-emerald-800/60 max-w-xl">
            Complete ledger of all inflow events. Grouped by month for review
            and auditing.
          </p>
        </header>

        {/* MONTH SECTIONS *}
        <div className="space-y-20">
          {monthKeys.slice(0, visibleMonths).map((key) => {
            const txs = grouped[key];
            const isOpen = openMonths[key];
            const monthLabel = formatMonthLabel(txs[0].timestamp);

            const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0);

            return (
              <section key={key} className="space-y-6">
                {/* Sticky Month Header /}
                <div className="sticky top-4 z-10 bg-white/90 backdrop-blur">
                  <button
                    onClick={() => toggleMonth(key)}
                    className="
                      w-full flex items-center justify-between
                      border border-emerald-800/10
                      px-5 py-3 hover:bg-lime/5 transition
                    "
                  >
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-emerald-800/60" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-emerald-800/60" />
                      )}
                      <span className="font-mono text-sm text-emerald-900">
                        {monthLabel}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-emerald-800/50">
                      {txs.length} txs
                    </span>
                  </button>
                </div>

                {/* Collapsible content /}
                {isOpen && (
                  <div className="space-y-4">
                    {/* Month Summary /}
                    <div className="flex justify-between text-xs font-mono text-emerald-800/50 px-1">
                      <span>{txs.length} transactions</span>
                      <span>Total: {totalAmount.toFixed(2)} MNEE</span>
                    </div>

                    {/* Table /}
                    <div className="border border-emerald-800/10 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="border-b border-emerald-800/10">
                            <th className="px-5 py-3 text-left font-mono text-xs text-emerald-800/50">
                              TX HASH
                            </th>
                            <th className="px-5 py-3 text-left font-mono text-xs text-emerald-800/50">
                              PRODUCT
                            </th>
                            <th className="px-5 py-3 text-right font-mono text-xs text-emerald-800/50">
                              AMOUNT
                            </th>
                            <th className="px-5 py-3 text-right font-mono text-xs text-emerald-800/50">
                              TIME
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-emerald-800/5">
                          {txs.map((tx) => (
                            <tr
                              key={tx.id}
                              className="hover:bg-lime/5 transition group"
                            >
                              <td className="px-5 py-3 font-mono">
                                <div className="flex items-center gap-2">
                                  {truncateHash(tx.txHash)}
                                  <ExternalLink
                                    className="w-3 h-3 text-emerald-800/30 opacity-0 group-hover:opacity-100 cursor-pointer"
                                    onClick={() => navigate(`/tx/${tx.txHash}`)}
                                  />
                                </div>
                              </td>

                              <td className="px-5 py-3">{tx.productName}</td>

                              <td className="px-5 py-3 text-right font-mono tabular-nums">
                                {tx.amount.toFixed(2)}{" "}
                                <span className="text-emerald-800/50">
                                  MNEE
                                </span>
                              </td>

                              <td className="px-5 py-3 text-right font-mono text-xs text-emerald-800/50">
                                {formatTime(tx.timestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default History */
}
