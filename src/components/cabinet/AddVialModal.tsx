"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import { calculateConcentration } from "@/lib/math";
import { POPULAR_PEPTIDES } from "@/data/peptides";

interface AddVialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddVialModal({ isOpen, onClose }: AddVialModalProps) {
    const addVial = useStore((state) => state.addVial);

    const [name, setName] = useState("");
    const [totalMg, setTotalMg] = useState("");
    const [waterMl, setWaterMl] = useState("");
    const [concentration, setConcentration] = useState(0);

    // Auto-calculate concentration
    useEffect(() => {
        const mg = parseFloat(totalMg) || 0;
        const ml = parseFloat(waterMl) || 0;
        setConcentration(calculateConcentration(mg, ml));
    }, [totalMg, waterMl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !totalMg || !waterMl) return;

        addVial({
            name,
            totalMg: parseFloat(totalMg),
            waterMl: parseFloat(waterMl),
        });

        // Reset and close
        setName("");
        setTotalMg("");
        setWaterMl("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Setup New Vial">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-slate-700">Peptide Name</label>
                    <Input
                        placeholder="e.g. BPC-157"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            // Simple logic: if text exists, show suggestions
                        }}
                        autoFocus
                        autoComplete="off"
                    />

                    {/* Custom Autocomplete Dropdown */}
                    {name && !POPULAR_PEPTIDES.includes(name) && POPULAR_PEPTIDES.some(p => p.toLowerCase().includes(name.toLowerCase())) && (
                        <div className="absolute z-50 w-full mt-1 max-h-48 overflow-auto bg-white rounded-xl border border-slate-100 shadow-xl no-scrollbar">
                            {POPULAR_PEPTIDES
                                .filter(p => p.toLowerCase().includes(name.toLowerCase()))
                                .slice(0, 100) // Limit results for performance
                                .map((peptide) => (
                                    <div
                                        key={peptide}
                                        className="px-4 py-2 text-sm text-charcoal hover:bg-sage-50 hover:text-sage-700 cursor-pointer transition-colors"
                                        onClick={() => setName(peptide)}
                                    >
                                        {peptide}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Total Amount (mg)</label>
                        <Input
                            type="number"
                            step="0.1"
                            placeholder="5"
                            value={totalMg}
                            onChange={(e) => setTotalMg(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Water Added (ml)</label>
                        <Input
                            type="number"
                            step="0.1"
                            placeholder="2"
                            value={waterMl}
                            onChange={(e) => setWaterMl(e.target.value)}
                        />
                    </div>
                </div>

                {/* Live Concentration Preview */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Resulting Concentration</span>
                    <span className="font-mono text-xl font-bold text-sage-600">
                        {isFinite(concentration) ? concentration.toFixed(2) : "0.00"} <span className="text-sm font-sans text-slate-400">mg/ml</span>
                    </span>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
                    <Button type="submit" disabled={!name || !totalMg || !waterMl}>Save to Cabinet</Button>
                </div>
            </form>
        </Modal>
    );
}
