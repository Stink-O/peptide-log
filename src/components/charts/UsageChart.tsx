"use client";

import { useState, useMemo } from "react";
import { useStore, Vial } from "@/store/useStore";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { TrendingDown, ChevronDown } from "lucide-react";

export function UsageChart() {
    const vials = useStore((state) => state.vials);
    const logs = useStore((state) => state.logs);

    const [selectedVialId, setSelectedVialId] = useState<string | null>(
        vials.length > 0 ? vials[0].id : null
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const selectedVial = vials.find((v) => v.id === selectedVialId);

    // Build chart data from logs for the selected vial
    const chartData = useMemo(() => {
        if (!selectedVial) return [];

        // Get logs for this vial, sorted by date ascending
        const vialLogs = logs
            .filter((log) => log.vialId === selectedVialId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (vialLogs.length === 0) {
            // No activity yet, show starting point
            return [
                {
                    date: new Date(selectedVial.dateAdded).toLocaleDateString(),
                    remaining: selectedVial.totalMg,
                    fullDate: selectedVial.dateAdded,
                },
            ];
        }

        // Start with initial amount
        const data: { date: string; remaining: number; fullDate: string }[] = [
            {
                date: new Date(selectedVial.dateAdded).toLocaleDateString(),
                remaining: selectedVial.totalMg,
                fullDate: selectedVial.dateAdded,
            },
        ];

        // Accumulate doses
        let runningTotal = selectedVial.totalMg;
        vialLogs.forEach((log) => {
            runningTotal -= log.doseMg;
            data.push({
                date: new Date(log.date).toLocaleDateString(),
                remaining: Math.max(0, runningTotal),
                fullDate: log.date,
            });
        });

        return data;
    }, [selectedVialId, logs, selectedVial]);

    if (vials.length === 0) {
        return null; // Don't show chart if no vials
    }

    return (
        <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-charcoal">Usage Trend</h3>
                        <p className="text-xs text-slate-400">Track depletion over time</p>
                    </div>
                </div>

                {/* Vial Selector */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-sm font-medium text-charcoal transition-colors"
                    >
                        {selectedVial?.name || "Select Vial"}
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-xl z-20 overflow-hidden">
                            {vials.map((vial) => (
                                <button
                                    key={vial.id}
                                    onClick={() => {
                                        setSelectedVialId(vial.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-sage-50 transition-colors ${vial.id === selectedVialId
                                        ? "bg-sage-50 text-sage-700 font-medium"
                                        : "text-charcoal"
                                        }`}
                                >
                                    {vial.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7c9a7e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#7c9a7e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                            tickFormatter={(value) => `${value}mg`}
                            domain={[0, selectedVial?.totalMg || 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                                padding: "12px",
                            }}
                            labelStyle={{ color: "#334155", fontWeight: 600, marginBottom: 4 }}
                            formatter={(value) => [`${(value as number).toFixed(2)} mg`, "Remaining"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="remaining"
                            stroke="#7c9a7e"
                            strokeWidth={2.5}
                            fill="url(#colorRemaining)"
                            dot={{ fill: "#7c9a7e", strokeWidth: 2, r: 4, stroke: "white" }}
                            activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Row */}
            {selectedVial && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Started</p>
                        <p className="text-sm font-semibold text-charcoal">{selectedVial.totalMg}mg</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Remaining</p>
                        <p className="text-sm font-semibold text-sage-600">{selectedVial.remainingMg.toFixed(2)}mg</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Used</p>
                        <p className="text-sm font-semibold text-coral">
                            {(selectedVial.totalMg - selectedVial.remainingMg).toFixed(2)}mg
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Doses</p>
                        <p className="text-sm font-semibold text-charcoal">
                            {logs.filter((l) => l.vialId === selectedVialId).length}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
