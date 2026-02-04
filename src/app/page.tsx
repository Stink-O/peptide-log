"use client";

import { useState, useEffect } from "react";
import { useStore, Vial } from "@/store/useStore";
import { VialCard } from "@/components/cabinet/VialCard";
import { AddVialModal } from "@/components/cabinet/AddVialModal";
import { CalculatorModal } from "@/components/calculator/CalculatorModal";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { UsageChart } from "@/components/charts/UsageChart";
import { Plus, History as HistoryIcon, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  // Store
  const vials = useStore((state) => state.vials);
  const logs = useStore((state) => state.logs);

  // Hydration fix for persisted store
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVial, setSelectedVial] = useState<Vial | null>(null);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; type: 'vial' | 'log' | null; id: string | null }>({
    isOpen: false,
    type: null,
    id: null
  });

  // Delete Handlers
  const handleDeleteVial = (id: string) => {
    setConfirmState({ isOpen: true, type: 'vial', id });
  };

  const handleDeleteLog = (id: string) => {
    setConfirmState({ isOpen: true, type: 'log', id });
  };

  const handleConfirmAction = () => {
    if (confirmState.type === 'vial' && confirmState.id) {
      useStore.getState().removeVial(confirmState.id);
    } else if (confirmState.type === 'log' && confirmState.id) {
      useStore.getState().removeLog(confirmState.id);
    }
    setConfirmState({ isOpen: false, type: null, id: null });
  };

  // Open Calculator
  const handleOpenCalculator = (vial: Vial) => {
    setSelectedVial(vial);
  };

  const closeCalculator = () => {
    setSelectedVial(null);
  };

  // Prevent hydration mismatch by returning null until hydrated
  // Actually zustand persist usually handles this, but next.js might complain about mismatch 
  // if localstorage has data. Easiest fix is check hydrated.
  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-off-white pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sage-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-slate-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm mb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-gradient-to-br from-sage-500 to-sage-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sage-200">
              <Activity className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-charcoal font-sans">PeptideLog</h1>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Vial
          </Button>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">

        {/* Dashboard Hero */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-charcoal tracking-tight">Dashboard</h2>
            <p className="text-slate-500 mt-1">Manage your inventory and track your research.</p>
          </div>
        </div>

        {/* Usage Chart */}
        <UsageChart />

        {/* Active Cabinet */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-charcoal">Cabinet</h2>
            <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {vials.length} Active Vials
            </span>
          </div>

          {vials.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-4">
                <Plus className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-charcoal">Your cabinet is empty</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                Add your first peptide vial to start tracking doses and concentrations.
              </p>
              <Button onClick={() => setIsAddOpen(true)} variant="outline">Setup First Vial</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {vials.map((vial) => (
                  <VialCard
                    key={vial.id}
                    vial={vial}
                    onOpen={handleOpenCalculator}
                    onDelete={handleDeleteVial}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* History Section */}
        {logs.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-charcoal mb-6 flex items-center">
              <HistoryIcon className="mr-2 h-5 w-5 text-slate-400" /> Recent Activity
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Peptide</th>
                      <th className="px-6 py-3">Dose</th>
                      <th className="px-6 py-3 text-right">Units</th>
                      <th className="px-6 py-3 text-right w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(log.date).toLocaleDateString()} <span className="text-xs text-slate-400 ml-1">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-charcoal">
                          {log.peptideName}
                        </td>
                        <td className="px-6 py-4 font-mono text-sage-600">
                          {log.doseMg}mg
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-400">
                          {log.unitsUsed.toFixed(1)} IU
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 rounded-full text-slate-300 hover:bg-coral-light hover:text-coral transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Log & Restore Dose"
                          >
                            <Activity className="h-4 w-4 rotate-45" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <AddVialModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <CalculatorModal
        vial={selectedVial}
        isOpen={!!selectedVial}
        onClose={closeCalculator}
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmState.type === 'vial' ? "Remove Vial" : "Delete Log"}
        description={confirmState.type === 'vial'
          ? "Are you sure you want to remove this vial? This action cannot be undone."
          : "Are you sure you want to delete this log? The dose will be returned to the vial."}
        variant="destructive"
        confirmText="Remove"
      />
    </main>
  );
}
