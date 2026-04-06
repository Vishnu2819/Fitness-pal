export const cmToFtIn = (cm: number): { ft: number; inches: number } => {
  const totalInches = cm / 2.54;
  return { ft: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
};

export const ftInToCm = (ft: number, inches: number): number =>
  Math.round((ft * 12 + inches) * 2.54);

export const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 * 10) / 10;

export const lbsToKg = (lbs: number): number => Math.round((lbs / 2.20462) * 10) / 10;
