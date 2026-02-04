import { Vial } from "@/store/useStore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Droplet, Calendar, Beaker, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface VialCardProps {
    vial: Vial;
    onOpen: (vial: Vial) => void;
    onDelete: (id: string) => void;
}

export function VialCard({ vial, onOpen, onDelete }: VialCardProps) {
    const percentage = (vial.remainingMg / vial.totalMg) * 100;

    // Color coding based on percentage
    let progressColor = "bg-sage-600";
    if (percentage < 20) progressColor = "bg-coral";
    else if (percentage < 50) progressColor = "bg-sage-500";

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="overflow-hidden hover:shadow-xl hover:shadow-sage-100/50 transition-all cursor-pointer border border-white/50 bg-white/60 backdrop-blur-sm relative group" onClick={() => onOpen(vial)}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sage-400 to-sage-600 rounded-l" />

                <CardHeader className="flex flex-row items-center justify-between pb-2 pl-6">
                    <CardTitle className="text-xl font-bold font-sans text-charcoal tracking-tight">{vial.name}</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-sage-50 flex items-center justify-center">
                        <Beaker className="h-4 w-4 text-sage-600 opacity-70" />
                    </div>
                </CardHeader>
                <CardContent className="pl-6">
                    <div className="flex justify-between items-end mb-5">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Remaining</p>
                            <p className="text-3xl font-mono text-charcoal font-semibold tracking-tighter">
                                {vial.remainingMg.toFixed(2)} <span className="text-sm text-slate-400 font-sans font-medium">mg</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Concentration</p>
                            <div className="inline-flex items-baseline bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                <p className="text-base font-mono text-slate-600 font-medium">
                                    {vial.concentration.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans ml-0.5">mg/ml</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            className={`absolute top-0 left-0 h-full ${progressColor} shadow-[0_0_10px_rgba(var(--sage-500),0.5)]`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-400">
                        <span>{percentage.toFixed(0)}% Left</span>
                        <span>{vial.totalMg}mg Total</span>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 flex justify-between py-3">
                    <div className="flex items-center text-xs text-slate-400 gap-3">
                        <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(vial.dateAdded).toLocaleDateString()}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-300 hover:text-coral hover:bg-coral-light"
                            onClick={(e) => { e.stopPropagation(); onDelete(vial.id); }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onOpen(vial); }}>
                        <Droplet className="h-4 w-4 mr-1" /> Draw Dose
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
