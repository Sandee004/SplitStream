import { useState } from "react";
import { Users, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Collaborator {
  id: string;
  name: string;
  wallet: string;
  total: number;
  share: number;
}

interface Props {
  collaborators: Collaborator[];
  onRemove: (id: string) => void;
}

export default function CollaboratorsCard({ collaborators, onRemove }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* SIDEBAR CARD */}
      <div className="lg:col-span-1 bg-white border-2 border-[#065f46]/20 flex flex-col">
        <div className="px-5 py-4 border-b border-[#065f46]/10 bg-[#F2F6F4]/30">
          <h3 className="text-sm font-bold text-[#065f46] flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Earners
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {collaborators.map((collab) => (
            <div key={collab.id} className="relative group">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <p className="text-sm font-bold text-[#065f46]">
                    {collab.name}
                  </p>
                  <p className="text-xs font-mono text-[#065f46]/50">
                    {collab.wallet}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-[#065f46]">
                    {collab.total.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-mono text-[#a3e635] bg-[#065f46] inline-block px-1">
                    {collab.share}% SHARE
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-[#065f46]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#065f46]"
                  style={{ width: `${collab.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto p-4 border-t border-[#065f46]/10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 text-xs font-mono border border-[#065f46]/20 hover:bg-[#065f46] hover:text-[#a3e635] transition-colors uppercase"
          >
            Manage Collaborators
          </button>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#065f46]/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white border-2 border-[#065f46] w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#065f46]/10 bg-[#F2F6F4]">
                <h3 className="font-bold text-[#065f46] flex items-center gap-2">
                  <Users className="w-4 h-4" /> Global Collaborators
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-[#065f46]/10 p-1 rounded"
                >
                  <X className="w-5 h-5 text-[#065f46]" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-[#065f46]/60">
                    Manage your trusted recipients.
                  </p>
                  {/*<button className="text-xs flex items-center gap-1 bg-[#a3e635] text-[#065f46] px-3 py-1 font-bold uppercase hover:brightness-110">
                    <Plus className="w-3 h-3" /> Add New
                  </button>*/}
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 border border-[#065f46]/10 bg-[#F2F6F4]/30 hover:bg-[#F2F6F4] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#065f46]/10 flex items-center justify-center rounded-full text-[#065f46] font-bold text-xs">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#065f46]">
                            {c.name}
                          </p>
                          <p className="text-xs font-mono text-[#065f46]/50">
                            {c.wallet}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(c.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
