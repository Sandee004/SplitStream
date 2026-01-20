import { useState } from "react";
import PayoutStats from "./payout-stats";
import CollaboratorsCard from "./collaborators";
import SettlementLog from "./settlement-log";

interface Transaction {
  id: string;
  to: string;
  wallet: string;
  amount: number;
  product: string;
  time: string;
  status: "SETTLED" | "PENDING" | "FAILED";
}

interface Collaborator {
  id: string;
  name: string;
  wallet: string;
  total: number;
  share: number;
}

// --- MOCK DATA (Move this to an API call later) ---
const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: "c1",
    name: "Design Studio A",
    wallet: "0x71...9A23",
    total: 1250.0,
    share: 30,
  },
  {
    id: "c2",
    name: "Dev Team Core",
    wallet: "0x89...B112",
    total: 850.0,
    share: 20,
  },
  {
    id: "c3",
    name: "Marketing DAO",
    wallet: "0x12...C991",
    total: 420.0,
    share: 10,
  },
];

const INITIAL_HISTORY: Transaction[] = [
  {
    id: "tx_005",
    to: "Dev Team Core",
    wallet: "0x89...B112",
    amount: 75.0,
    product: "Consulting",
    time: "Just now",
    status: "PENDING",
  },
  {
    id: "tx_001",
    to: "Design Studio A",
    wallet: "0x71...9A23",
    amount: 150.0,
    product: "AI Art Pack",
    time: "2m ago",
    status: "SETTLED",
  },
  {
    id: "tx_002",
    to: "Dev Team Core",
    wallet: "0x89...B112",
    amount: 50.0,
    product: "SaaS Template",
    time: "15m ago",
    status: "SETTLED",
  },
];

export default function PayoutsSection() {
  const [history, setHistory] = useState<Transaction[]>(INITIAL_HISTORY);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    INITIAL_COLLABORATORS,
  );

  // --- ACTIONS ---

  const settleTransaction = async (txId: string) => {
    // Simulate API delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setHistory((prev) =>
          prev.map((tx) =>
            tx.id === txId ? { ...tx, status: "SETTLED" } : tx,
          ),
        );
        resolve();
      }, 1500);
    });
  };

  const removeCollaborator = (id: string) => {
    if (confirm("Revoke access for this collaborator?")) {
      setCollaborators((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen relative grid-bg-pattern grid-animate-scroll">
      {/* HEADER */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b-2 border-[#1a3a2a]/20">
        <div>
          <h1 className="text-xl font-bold text-[#065f46]">Payouts</h1>
          <p className="text-sm text-[#065f46]/50">
            Track pending and completed settlements
          </p>
        </div>
        <span className="text-xs font-mono text-[#065f46]/50 px-2 py-1 bg-[#F2F6F4] border border-[#065f46]/10">
          LIVE_FEED
        </span>
      </header>

      <div className="space-y-6 my-5 mx-4">
        {/* 1. Stats */}
        <PayoutStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2. Left Sidebar (List + Modal) */}
          <CollaboratorsCard
            collaborators={collaborators}
            onRemove={removeCollaborator}
          />

          {/* 3. Main Table (+ Modal) */}
          <SettlementLog history={history} onSettle={settleTransaction} />
        </div>
      </div>
    </div>
  );
}
