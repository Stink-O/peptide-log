"use client";

import { Modal } from "@/components/ui/Modal";
import { DoseCalculator } from "./DoseCalculator";
import { Vial } from "@/store/useStore";

interface CalculatorModalProps {
    vial: Vial | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CalculatorModal({ vial, isOpen, onClose }: CalculatorModalProps) {
    if (!vial) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dose Calculator">
            <DoseCalculator vial={vial} onClose={onClose} />
        </Modal>
    );
}
