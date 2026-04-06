export type Gender = 'male' | 'female';
export type UnitSystem = 'metric' | 'imperial';
export type Goal = 'lose' | 'gain' | 'recomp' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
export type SurplusAmount = 250 | 500;

export interface PersonalDetails {
  name: string;
  age: number | '';
  gender: Gender;
  // Always stored in metric internally
  heightCm: number | '';
  weightKg: number | '';
  unitSystem: UnitSystem;
  // Imperial display fields
  heightFt: number | '';
  heightIn: number | '';
  weightLbs: number | '';
}

export interface GoalDetails {
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeightKg: number | '';
  targetWeightLbs: number | '';
  surplus: SurplusAmount;
}

export interface CalculationResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  weeksToGoal: number | null;
  weeklyRateKg: number | null;
  calsBelowMinimum: boolean;
  minimumCalories: number;
}

export interface WizardState {
  step: 1 | 2 | 3;
  personal: PersonalDetails;
  goals: GoalDetails;
  results: CalculationResults | null;
}
