const History = () => {
  return (
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

      <div className="max-w-6xl mx-auto space-y-16">
        {/* HEADER */}
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

        {/* MONTH SECTIONS */}
      </div>
    </div>
  );
};

export default History;
