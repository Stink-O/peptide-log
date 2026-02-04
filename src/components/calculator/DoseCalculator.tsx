"use client";

import { useState } from "react";
import { Vial, useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calculateDoseUnits, unitsToMl, mgToMcg } from "@/lib/math";
import { ArrowLeftRight, Syringe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

interface DoseCalculatorProps {
    vial: Vial;
    onClose: () => void;
}

export function DoseCalculator({ vial, onClose }: DoseCalculatorProps) {
    const logDose = useStore((state) => state.logDose);

    const [mode, setMode] = useState<"target" | "volume">("target");
    const [inputValue, setInputValue] = useState("");
    const [inputUnit, setInputUnit] = useState<"mg" | "mcg">("mg");

    // Calculations
    const doseMg = parseFloat(inputValue) || 0;
    const doseUnits = parseFloat(inputValue) || 0;

    // Derived values
    let resultUnits = 0;
    let resultMl = 0;
    let resultMg = 0;
    let resultMcg = 0;

    // Recalculate based on mode
    if (mode === "target") {
        // User inputs dose
        let validDoseMg = doseMg;
        if (inputUnit === "mcg") validDoseMg = doseMg / 1000;

        resultUnits = calculateDoseUnits(validDoseMg, vial.concentration);
        resultMl = unitsToMl(resultUnits);
        resultMg = validDoseMg;
        resultMcg = mgToMcg(validDoseMg);
    } else {
        // User inputs units
        resultUnits = doseUnits;
        resultMl = unitsToMl(doseUnits);
        resultMg = resultMl * vial.concentration;
        resultMcg = mgToMcg(resultMg);
    }

    const handleLog = () => {
        if (resultMg <= 0) return;
        logDose(vial.id, resultMg, resultUnits);
        onClose();
    };

    const isValid = inputValue && parseFloat(inputValue) > 0;
    const isExceeding = resultMg > vial.remainingMg;

    return (
        <div className="space-y-6">
            {/* Vial Info Header */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">{vial.name}</span>
                    <span className="mx-2">•</span>
                    {vial.concentration} mg/ml
                </div>
                <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">
                    {vial.remainingMg.toFixed(2)}mg Left
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                    onClick={() => setMode("target")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "target" ? "bg-white shadow text-charcoal" : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Calculate Dose
                </button>
                <button
                    onClick={() => setMode("volume")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "volume" ? "bg-white shadow text-charcoal" : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Check Volume
                </button>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
                <div className="relative">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                        {mode === "target" ? "Desired Dose" : "Drawing Amount"}
                    </label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="0"
                            className={cn(
                                "text-2xl h-14 font-mono font-medium transition-colors",
                                isExceeding ? "text-coral border-coral focus-visible:ring-coral" : ""
                            )}
                            autoFocus
                        />
                        {mode === "target" ? (
                            <div className="flex flex-col gap-1 w-24">
                                <button
                                    onClick={() => setInputUnit("mcg")}
                                    className={`flex-1 rounded-md text-xs font-bold transition-colors ${inputUnit === "mcg" ? "bg-sage-100 text-sage-700 border border-sage-200" : "bg-slate-50 text-slate-400 border border-transparent"}`}
                                >
                                    mcg
                                </button>
                                <button
                                    onClick={() => setInputUnit("mg")}
                                    className={`flex-1 rounded-md text-xs font-bold transition-colors ${inputUnit === "mg" ? "bg-sage-100 text-sage-700 border border-sage-200" : "bg-slate-50 text-slate-400 border border-transparent"}`}
                                >
                                    mg
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-24 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                                Units
                            </div>
                        )}
                    </div>
                    {isExceeding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                            className="text-xs font-medium text-coral flex items-center"
                        >
                            Not enough in vial ({vial.remainingMg.toFixed(2)}mg left)
                        </motion.div>
                    )}
                </div>

                {/* Result Card */}
                <div className={cn(
                    "border rounded-2xl p-6 text-center space-y-2 transition-colors",
                    isExceeding ? "bg-coral-light border-coral text-coral" : "bg-sage-50 border-sage-100"
                )}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode === "target" ? resultUnits : resultMg}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={cn(
                                "text-sm font-medium uppercase tracking-widest mb-1",
                                isExceeding ? "text-coral" : "text-sage-600"
                            )}>
                                {mode === "target" ? "Draw exactly" : "Contains"}
                            </div>

                            {mode === "target" ? (
                                <>
                                    <div className={cn(
                                        "text-5xl font-mono font-bold tracking-tight",
                                        isExceeding ? "text-coral-600" : "text-sage-700"
                                    )}>
                                        {isFinite(resultUnits) ? resultUnits.toFixed(1) : "0"}
                                    </div>
                                    <div className={cn("font-medium mt-1", isExceeding ? "text-coral" : "text-sage-500")}>Units (IU)</div>
                                    <div className={cn("text-xs mt-2 font-mono", isExceeding ? "text-coral/70" : "text-sage-400")}>
                                        = {isFinite(resultMl) ? resultMl.toFixed(3) : "0"} ml
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={cn(
                                        "text-4xl font-mono font-bold tracking-tight",
                                        isExceeding ? "text-coral-600" : "text-sage-700"
                                    )}>
                                        {isFinite(resultMcg) ? resultMcg.toFixed(0) : "0"}
                                    </div>
                                    <div className={cn("font-medium mt-1", isExceeding ? "text-coral" : "text-sage-500")}>mcg</div>
                                    <div className={cn("text-xs mt-2 font-mono", isExceeding ? "text-coral/70" : "text-sage-400")}>
                                        = {isFinite(resultMg) ? resultMg.toFixed(3) : "0"} mg
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <Button size="lg"
                className={cn(
                    "w-full rounded-xl shadow-lg transition-all",
                    isExceeding
                        ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed hover:bg-slate-200"
                        : "bg-sage-600 hover:bg-sage-700 text-white shadow-sage-200"
                )}
                onClick={handleLog}
                disabled={!isValid || isExceeding}
            >
                <Syringe className="mr-2 h-5 w-5" />
                Log Dose & Update Vial
            </Button>
        </div>
    );
}
