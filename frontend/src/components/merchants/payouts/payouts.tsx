import { useState, useEffect, useCallback } from "react";
import PayoutStats from "./payout-stats";
import CollaboratorsCard from "./collaborators";
import SettlementLog from "./settlement-log";
import type { Transaction } from "./types";
import { Loader2 } from "lucide-react";

export default function PayoutsSection() {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCollabCount, setActiveCollabCount] = useState<number>(0);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/payouts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else {
        // Fallback for demo if endpoint doesn't exist yet
        console.warn("Failed to fetch payouts, using fallback data");
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="min-h-screen relative grid-bg-pattern grid-animate-scroll">
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b-2 border-[#1a3a2a]/20">
        <div>
          <h1 className="text-xl font-bold text-[#065f46]">Payouts</h1>
          <p className="text-sm text-[#065f46]/50">
            Track all completed and pending disbursements.
          </p>
        </div>
        <span className="text-xs font-mono text-[#065f46]/50 px-2 py-1 bg-[#F2F6F4] border border-[#065f46]/10">
          LIVE_FEED
        </span>
      </header>

      <div className="space-y-6 mx-4 my-5">
        {/* 1. Stats (Static for now, can be connected to API later) */}
        <PayoutStats
          payouts={history}
          activeCollaboratorsCount={activeCollabCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* 2. Left Sidebar (Self-Contained) */}
          <CollaboratorsCard onUpdateCount={setActiveCollabCount} />

          {/* 3. Main Table */}
          {isLoading && history.length === 0 ? (
            <div className="lg:col-span-2 bg-white border-2 border-[#065f46]/20 h-[400px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#065f46]" />
            </div>
          ) : (
            <SettlementLog
              history={history}
              // CHANGE IS HERE:
              onSuccess={loadHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
