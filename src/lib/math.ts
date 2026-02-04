export type UnitType = 'mg' | 'mcg' | 'iu';

/**
 * Calculates the concentration of the solution in mg/ml.
 * @param totalMg Total amount of peptide in the vial in milligrams.
 * @param waterMl Amount of bacteriostatic water added in milliliters.
 * @returns Concentration in mg/ml.
 */
export function calculateConcentration(totalMg: number, waterMl: number): number {
    if (waterMl <= 0) return 0;
    return totalMg / waterMl;
}

/**
 * Calculates the number of units to draw on a U-100 syringe.
 * @param desiredDoseMg Desired dose in milligrams.
 * @param concentrationMgMl Concentration of the solution in mg/ml.
 * @returns Number of units (where 100 units = 1ml).
 */
export function calculateDoseUnits(desiredDoseMg: number, concentrationMgMl: number): number {
    if (concentrationMgMl <= 0) return 0;
    const volumeMl = desiredDoseMg / concentrationMgMl;
    return volumeMl * 100;
}

/**
 * Calculates the volume in ml given units and syringe type (assuming U-100 for now).
 */
export function unitsToMl(units: number): number {
    return units / 100;
}

/**
 * Converts mcg to mg.
 */
export function mcgToMg(mcg: number): number {
    return mcg / 1000;
}

/**
 * Converts mg to mcg.
 */
export function mgToMcg(mg: number): number {
    return mg * 1000;
}
