import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { calculateConcentration } from '@/lib/math';

export interface Vial {
    id: string;
    name: string;
    totalMg: number;
    waterMl: number;
    concentration: number; // mg/ml
    remainingMg: number;
    dateAdded: string; // ISO string
}

export interface Log {
    id: string;
    vialId: string;
    peptideName: string;
    date: string; // ISO string
    doseMg: number;
    unitsUsed: number;
}

interface PeptideStore {
    vials: Vial[];
    logs: Log[];

    addVial: (vial: Omit<Vial, 'id' | 'concentration' | 'remainingMg' | 'dateAdded'>) => void;
    removeVial: (id: string) => void;
    logDose: (vialId: string, doseMg: number, units: number) => void;
    removeLog: (logId: string) => void;
    getVial: (id: string) => Vial | undefined;
}

const storage: StateStorage = {
    getItem: (name: string): string | null => {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(name);
    },
    setItem: (name: string, value: string): void => {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(name);
    },
}

export const useStore = create<PeptideStore>()(
    persist(
        (set, get) => ({
            vials: [],
            logs: [],

            addVial: (vialData) => {
                const concentration = calculateConcentration(vialData.totalMg, vialData.waterMl);
                // randomUUID fallback
                const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

                const newVial: Vial = {
                    ...vialData,
                    id,
                    concentration,
                    remainingMg: vialData.totalMg,
                    dateAdded: new Date().toISOString(),
                };

                set((state) => ({
                    vials: [newVial, ...state.vials],
                }));
            },

            removeVial: (id) => {
                set((state) => ({
                    vials: state.vials.filter((v) => v.id !== id),
                }));
            },

            logDose: (vialId, doseMg, units) => {
                set((state) => {
                    const vialIndex = state.vials.findIndex((v) => v.id === vialId);
                    if (vialIndex === -1) return state;

                    const updatedVials = [...state.vials];
                    const vial = updatedVials[vialIndex];

                    const newRemaining = Math.max(0, vial.remainingMg - doseMg);
                    updatedVials[vialIndex] = { ...vial, remainingMg: newRemaining };

                    const logId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

                    const newLog: Log = {
                        id: logId,
                        vialId,
                        peptideName: vial.name,
                        date: new Date().toISOString(),
                        doseMg,
                        unitsUsed: units,
                    };

                    return {
                        vials: updatedVials,
                        logs: [newLog, ...state.logs],
                    };
                });
            },

            removeLog: (logId) => {
                set((state) => {
                    const logToRemove = state.logs.find((l) => l.id === logId);
                    if (!logToRemove) return state;

                    // Restore the dose to the vial
                    const vialIndex = state.vials.findIndex((v) => v.id === logToRemove.vialId);
                    let updatedVials = state.vials;

                    if (vialIndex !== -1) {
                        updatedVials = [...state.vials];
                        const vial = updatedVials[vialIndex];
                        updatedVials[vialIndex] = {
                            ...vial,
                            remainingMg: vial.remainingMg + logToRemove.doseMg
                        };
                    }

                    return {
                        vials: updatedVials,
                        logs: state.logs.filter((l) => l.id !== logId),
                    };
                });
            },

            getVial: (id) => get().vials.find((v) => v.id === id),
        }),
        {
            name: 'peptide-log-storage',
            storage: createJSONStorage(() => storage),
            skipHydration: true,
        }
    )
);
