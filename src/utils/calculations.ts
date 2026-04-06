import { Gender, Goal, SurplusAmount } from '../types/fitness';
import { MIN_CALORIES_MALE, MIN_CALORIES_FEMALE } from '../constants/activityLevels';

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

export function calculateTDEE(bmr: number, multiplier: number): number {
  return Math.round(bmr * multiplier);
}

export function calculateTargetCalories(
  tdee: number,
  goal: Goal,
  gender: Gender,
  surplus: SurplusAmount = 500
): { targetCalories: number; calsBelowMinimum: boolean; minimumCalories: number } {
  const min = gender === 'male' ? MIN_CALORIES_MALE : MIN_CALORIES_FEMALE;

  let raw: number;
  switch (goal) {
    case 'lose':
      raw = tdee - 500;
      break;
    case 'gain':
      raw = tdee + surplus;
      break;
    case 'recomp':
    case 'maintain':
    default:
      raw = tdee;
  }

  const calsBelowMinimum = raw < min;
  return {
    targetCalories: Math.max(raw, min),
    calsBelowMinimum,
    minimumCalories: min,
  };
}

export function calculateMacros(
  targetCalories: number,
  weightKg: number
): { proteinG: number; fatG: number; carbsG: number } {
  const weightLbs = weightKg * 2.20462;
  let proteinG = Math.round(weightLbs * 1.0);
  const fatG = Math.round((targetCalories * 0.25) / 9);
  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;
  let carbsCals = targetCalories - proteinCals - fatCals;

  if (carbsCals < 0) {
    proteinG = Math.round(weightLbs * 0.8);
    carbsCals = targetCalories - proteinG * 4 - fatCals;
  }

  return {
    proteinG,
    fatG,
    carbsG: Math.max(0, Math.round(carbsCals / 4)),
  };
}

// 1 kg fat ≈ 7700 kcal
export function calculateWeeksToGoal(
  currentWeightKg: number,
  targetWeightKg: number,
  dailyDelta: number // negative = deficit, positive = surplus
): { weeks: number; weeklyRateKg: number } | null {
  const weightDelta = targetWeightKg - currentWeightKg;

  if (dailyDelta === 0 || Math.sign(weightDelta) !== Math.sign(dailyDelta)) {
    return null;
  }

  const weeklyRateKg = (Math.abs(dailyDelta) * 7) / 7700;
  const weeks = Math.ceil(Math.abs(weightDelta) / weeklyRateKg);
  return { weeks, weeklyRateKg: Math.round(weeklyRateKg * 100) / 100 };
}
