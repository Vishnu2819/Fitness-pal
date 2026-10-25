// Pure calculation core. Everything is metric internally; the UI converts at the edges.

export type Sex = 'male' | 'female'
export type Units = 'metric' | 'imperial'
export type Goal = 'lose' | 'maintain' | 'gain'
export type DietStyle = 'balanced' | 'highProtein' | 'lowCarb' | 'keto' | 'custom'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'

export interface Inputs {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  bodyFatPct?: number
  activity: ActivityLevel
  goal: Goal
  /** kg per week, always positive; ignored when goal is maintain */
  rateKg: number
  targetWeightKg?: number
  diet: DietStyle
  /** used only when diet is custom; percentages of calories, should sum to 100 */
  custom: { protein: number; carbs: number; fat: number }
  meals: number
}

export interface Macros {
  protein: number
  carbs: number
  fat: number
}

export interface Plan {
  bmr: number
  bmrFormula: 'Mifflin-St Jeor' | 'Katch-McArdle'
  tdee: number
  calories: number
  dailyDelta: number
  /** true when the requested deficit was limited by the safety floor */
  floored: boolean
  macros: Macros
  macroCalories: Macros
  fiber: number
  waterLiters: number
  bmi: number
  bmiCategory: string
  leanMassKg?: number
  weeksToTarget?: number
  meals: Array<{ name: string; calories: number; macros: Macros }>
  warnings: string[]
}

export const ACTIVITY: Record<ActivityLevel, { label: string; detail: string; factor: number }> = {
  sedentary: { label: 'Sedentary', detail: 'Desk job, little or no exercise', factor: 1.2 },
  light: { label: 'Lightly active', detail: 'Light exercise 1–3 days a week', factor: 1.375 },
  moderate: { label: 'Moderately active', detail: 'Moderate exercise 3–5 days a week', factor: 1.55 },
  active: { label: 'Very active', detail: 'Hard exercise 6–7 days a week', factor: 1.725 },
  athlete: { label: 'Athlete', detail: 'Twice-daily training or a physical job', factor: 1.9 },
}

export const DIETS: Record<DietStyle, { label: string; detail: string }> = {
  balanced: { label: 'Balanced', detail: 'Protein set by goal, 30% fat, carbs fill the rest' },
  highProtein: { label: 'High protein', detail: '2.4 g/kg protein, 25% fat; good for cutting or recomposition' },
  lowCarb: { label: 'Low carb', detail: 'Carbs capped at 20% of calories, more fat' },
  keto: { label: 'Keto', detail: 'About 25 g net carbs, moderate protein, mostly fat' },
  custom: { label: 'Custom', detail: 'Set your own split' },
}

export const KCAL_PER_KG = 7700
export const KCAL = { protein: 4, carbs: 4, fat: 9 } as const
const PROTEIN_G_PER_KG: Record<Goal, number> = { lose: 2.0, maintain: 1.6, gain: 1.8 }
const MEAL_NAMES: Record<number, string[]> = {
  2: ['Lunch', 'Dinner'],
  3: ['Breakfast', 'Lunch', 'Dinner'],
  4: ['Breakfast', 'Lunch', 'Snack', 'Dinner'],
  5: ['Breakfast', 'Snack', 'Lunch', 'Snack', 'Dinner'],
  6: ['Breakfast', 'Snack', 'Lunch', 'Snack', 'Dinner', 'Evening snack'],
}

export const lbToKg = (lb: number) => lb * 0.45359237
export const kgToLb = (kg: number) => kg / 0.45359237
export const inToCm = (inches: number) => inches * 2.54
export const cmToIn = (cm: number) => cm / 2.54

export function mifflinStJeor(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161)
}

export function katchMcArdle(leanMassKg: number): number {
  return 370 + 21.6 * leanMassKg
}

export function bmiOf(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return weightKg / (m * m)
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Healthy weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function minimumCalories(sex: Sex): number {
  return sex === 'male' ? 1500 : 1200
}

/** Split calories into grams for each macro according to the chosen diet style. */
export function splitMacros(calories: number, inputs: Pick<Inputs, 'diet' | 'goal' | 'weightKg' | 'custom'>, leanMassKg?: number): Macros {
  // Protein targets scale with lean mass when we know it, so heavier, higher-fat
  // bodies don't get absurd protein numbers.
  const proteinBase = leanMassKg ? leanMassKg * 1.15 : inputs.weightKg
  const fromPct = (p: number, c: number, f: number): Macros => ({
    protein: (calories * p) / 100 / KCAL.protein,
    carbs: (calories * c) / 100 / KCAL.carbs,
    fat: (calories * f) / 100 / KCAL.fat,
  })
  const rest = (protein: number, fatPct: number): Macros => {
    const fat = (calories * fatPct) / KCAL.fat
    const carbs = Math.max(0, (calories - protein * KCAL.protein - fat * KCAL.fat) / KCAL.carbs)
    return { protein, carbs, fat }
  }

  switch (inputs.diet) {
    case 'highProtein':
      return rest(Math.min(proteinBase * 2.4, (calories * 0.45) / KCAL.protein), 0.25)
    case 'lowCarb': {
      const protein = Math.min(proteinBase * PROTEIN_G_PER_KG[inputs.goal], (calories * 0.4) / KCAL.protein)
      const carbs = (calories * 0.2) / KCAL.carbs
      const fat = Math.max(0, (calories - protein * KCAL.protein - carbs * KCAL.carbs) / KCAL.fat)
      return { protein, carbs, fat }
    }
    case 'keto': {
      const carbs = 25
      const protein = Math.min(proteinBase * 1.6, (calories * 0.3) / KCAL.protein)
      const fat = Math.max(0, (calories - protein * KCAL.protein - carbs * KCAL.carbs) / KCAL.fat)
      return { protein, carbs, fat }
    }
    case 'custom': {
      const { protein, carbs, fat } = inputs.custom
      const total = protein + carbs + fat || 1
      return fromPct((protein / total) * 100, (carbs / total) * 100, (fat / total) * 100)
    }
    default:
      return rest(Math.min(proteinBase * PROTEIN_G_PER_KG[inputs.goal], (calories * 0.4) / KCAL.protein), 0.3)
  }
}

const round = (n: number, step = 1) => Math.round(n / step) * step

export function computePlan(inputs: Inputs): Plan {
  const warnings: string[] = []
  const hasBf = inputs.bodyFatPct !== undefined && inputs.bodyFatPct > 2 && inputs.bodyFatPct < 70
  const leanMassKg = hasBf ? inputs.weightKg * (1 - inputs.bodyFatPct! / 100) : undefined

  const bmr = leanMassKg ? katchMcArdle(leanMassKg) : mifflinStJeor(inputs.sex, inputs.weightKg, inputs.heightCm, inputs.age)
  const tdee = bmr * ACTIVITY[inputs.activity].factor

  const sign = inputs.goal === 'lose' ? -1 : inputs.goal === 'gain' ? 1 : 0
  const requested = (sign * inputs.rateKg * KCAL_PER_KG) / 7
  let calories = tdee + requested
  let floored = false
  const floor = minimumCalories(inputs.sex)
  if (calories < floor) {
    calories = floor
    floored = true
    warnings.push(`Your target was raised to ${floor} kcal, the usual safe minimum. Try a slower rate or more activity.`)
  }
  if (inputs.goal === 'lose' && requested / tdee < -0.25) {
    warnings.push('That deficit is more than 25% of your maintenance calories. Most people lose muscle and stall at that pace.')
  }
  if (inputs.goal === 'gain' && inputs.rateKg > 0.5) {
    warnings.push('Gaining more than 0.5 kg (about 1 lb) a week usually adds more fat than muscle.')
  }
  if (inputs.age < 18) warnings.push('These formulas are designed for adults. Teens should talk to a doctor or dietitian.')

  const macros = splitMacros(calories, inputs, leanMassKg)
  const rounded: Macros = { protein: round(macros.protein), carbs: round(macros.carbs), fat: round(macros.fat) }
  const macroCalories: Macros = {
    protein: rounded.protein * KCAL.protein,
    carbs: rounded.carbs * KCAL.carbs,
    fat: rounded.fat * KCAL.fat,
  }

  const bmi = bmiOf(inputs.weightKg, inputs.heightCm)

  let weeksToTarget: number | undefined
  if (inputs.targetWeightKg && inputs.goal !== 'maintain' && inputs.rateKg > 0) {
    const diff = inputs.targetWeightKg - inputs.weightKg
    const rightDirection = inputs.goal === 'lose' ? diff < 0 : diff > 0
    if (rightDirection) {
      const effectiveRate = floored ? Math.abs((calories - tdee) * 7) / KCAL_PER_KG : inputs.rateKg
      weeksToTarget = effectiveRate > 0 ? Math.ceil(Math.abs(diff) / effectiveRate) : undefined
    } else {
      warnings.push(`Your target weight is ${inputs.goal === 'lose' ? 'above' : 'below'} your current weight, so it doesn't match your goal.`)
    }
  }

  const n = Math.min(6, Math.max(2, Math.round(inputs.meals)))
  const names = MEAL_NAMES[n]
  // Snacks get half the share of a main meal.
  const weights = names.map((name) => (name.toLowerCase().includes('snack') ? 0.5 : 1))
  const wsum = weights.reduce((a, b) => a + b, 0)
  const meals = names.map((name, i) => {
    const share = weights[i] / wsum
    return {
      name,
      calories: round(calories * share, 5),
      macros: { protein: round(rounded.protein * share), carbs: round(rounded.carbs * share), fat: round(rounded.fat * share) },
    }
  })

  return {
    bmr: round(bmr),
    bmrFormula: leanMassKg ? 'Katch-McArdle' : 'Mifflin-St Jeor',
    tdee: round(tdee),
    calories: round(calories, 5),
    dailyDelta: round(calories - tdee),
    floored,
    macros: rounded,
    macroCalories,
    fiber: round((calories / 1000) * 14),
    waterLiters: Math.round(inputs.weightKg * 0.035 * 10) / 10,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: bmiCategory(bmi),
    leanMassKg: leanMassKg ? Math.round(leanMassKg * 10) / 10 : undefined,
    weeksToTarget,
    meals,
    warnings,
  }
}

/** Weekly weight projection for the timeline chart (linear, capped at a year). */
export function projectWeights(startKg: number, plan: Plan, weeks: number): number[] {
  const perWeek = (plan.dailyDelta * 7) / KCAL_PER_KG
  return Array.from({ length: Math.min(weeks, 52) + 1 }, (_, w) => startKg + perWeek * w)
}
