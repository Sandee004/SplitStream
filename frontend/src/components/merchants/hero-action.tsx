"use client";

import { Plus, Zap } from "lucide-react";

interface HeroActionProps {
  onAddNew: () => void;
}

export default function HeroAction({ onAddNew }: HeroActionProps) {
  return (
    <div className="relative bg-white border-2 border-[#1a3a2a] overflow-hidden">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#a8e6cf]" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#a8e6cf]" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#a8e6cf]" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#a8e6cf]" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-50" />

      <button
        onClick={onAddNew}
        className="relative w-full p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-center gap-6 group hover:bg-[#a8e6cf]/10 transition-colors"
      >
        {/* Icon container */}
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#a8e6cf] border-2 border-[#1a3a2a] flex items-center justify-center group-hover:scale-105 transition-transform relative">
          <Plus
            className="w-10 h-10 lg:w-12 lg:h-12 text-[#1a3a2a]"
            strokeWidth={2.5}
          />
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#1a3a2a]" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#1a3a2a]" />
        </div>

        {/* Text content */}
        <div className="text-center lg:text-left">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1a3a2a]">
            Initialize New Revenue Stream
          </h2>
          <p className="text-[#1a3a2a]/60 mt-2 flex items-center justify-center lg:justify-start gap-2">
            <Zap className="w-4 h-4" />
            <span>Deploy programmable payment splits instantly</span>
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="hidden lg:flex items-center justify-center w-12 h-12 border border-[#1a3a2a]/20 ml-auto">
          <span className="text-2xl text-[#1a3a2a] group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </button>
    </div>
  );
}
