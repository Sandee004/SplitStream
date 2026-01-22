import { useState } from "react";
import PayoutStats from "./payout-stats";
import CollaboratorsCard from "./collaborators";
import SettlementLog from "./settlement-log";
import type { Transaction } from "./types"

// --- MOCK DATA for History (We will fetch this later too) ---
const INITIAL_HISTORY: Transaction[] = [
  { id: "tx_005", to: "Dev Team Core", wallet: "0x89...B112", amount: 75.00, product: "Consulting", time: "Just now", status: "PENDING" },
  { id: "tx_001", to: "Design Studio A", wallet: "0x71...9A23", amount: 150.00, product: "AI Art Pack", time: "2m ago", status: "SETTLED" },
  { id: "tx_002", to: "Dev Team Core", wallet: "0x89...B112", amount: 50.00, product: "SaaS Template", time: "15m ago", status: "SETTLED" },
];

export default function PayoutsSection() {
  const [history, setHistory] = useState<Transaction[]>(INITIAL_HISTORY);

  // --- ACTIONS ---

  const settleTransaction = async (txId: string) => {
    // Simulate API delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setHistory(prev => prev.map(tx => 
          tx.id === txId ? { ...tx, status: "SETTLED" } : tx
        ));
        resolve();
      }, 1500);
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Stats */}
      <PayoutStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Left Sidebar - Now Self-Contained! */}
        <CollaboratorsCard />

        {/* 3. Main Table (+ Modal) */}
        <SettlementLog 
          history={history} 
          onSettle={settleTransaction} 
        />
      </div>
    </div>
  );
}