import { ActivityLevel, DietStyle, Goal, Inputs, Sex, Units, inToCm, lbToKg } from './calc'

/** What the form holds, in the units the user picked. */
export interface FormState {
  units: Units
  sex: Sex
  age: string
  heightCm: string
  heightFt: string
  heightIn: string
  weight: string
  bodyFat: string
  activity: ActivityLevel
  goal: Goal
  rate: number
  target: string
  diet: DietStyle
  custom: { protein: number; carbs: number; fat: number }
  meals: number
}

export const DEFAULT_STATE: FormState = {
  units: 'imperial',
  sex: 'male',
  age: '28',
  heightCm: '178',
  heightFt: '5',
  heightIn: '10',
  weight: '175',
  bodyFat: '',
  activity: 'moderate',
  goal: 'lose',
  rate: 1,
  target: '165',
  diet: 'balanced',
  custom: { protein: 30, carbs: 40, fat: 30 },
  meals: 4,
}

export const RATES: Record<Units, number[]> = {
  metric: [0.25, 0.5, 0.75, 1],
  imperial: [0.5, 1, 1.5, 2],
}

const num = (s: string) => {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : NaN
}

export interface Parsed {
  inputs?: Inputs
  errors: Partial<Record<'age' | 'height' | 'weight' | 'bodyFat' | 'target', string>>
}

export function toInputs(f: FormState): Parsed {
  const errors: Parsed['errors'] = {}
  const age = num(f.age)
  if (!(age >= 15 && age <= 90)) errors.age = 'Enter an age from 15 to 90'

  const heightCm = f.units === 'metric' ? num(f.heightCm) : inToCm(num(f.heightFt) * 12 + (num(f.heightIn) || 0))
  if (!(heightCm >= 120 && heightCm <= 230)) errors.height = 'Enter a realistic height'

  const w = num(f.weight)
  const weightKg = f.units === 'metric' ? w : lbToKg(w)
  if (!(weightKg >= 35 && weightKg <= 300)) errors.weight = 'Enter a realistic weight'

  let bodyFatPct: number | undefined
  if (f.bodyFat.trim()) {
    bodyFatPct = num(f.bodyFat)
    if (!(bodyFatPct >= 3 && bodyFatPct <= 60)) errors.bodyFat = 'Body fat should be 3–60%'
  }

  let targetWeightKg: number | undefined
  if (f.target.trim() && f.goal !== 'maintain') {
    const t = num(f.target)
    targetWeightKg = f.units === 'metric' ? t : lbToKg(t)
    if (!(targetWeightKg >= 35 && targetWeightKg <= 300)) errors.target = 'Enter a realistic target'
  }

  if (Object.keys(errors).length) return { errors }
  return {
    errors,
    inputs: {
      sex: f.sex,
      age,
      heightCm,
      weightKg,
      bodyFatPct,
      activity: f.activity,
      goal: f.goal,
      rateKg: f.units === 'metric' ? f.rate : lbToKg(f.rate),
      targetWeightKg,
      diet: f.diet,
      custom: f.custom,
      meals: f.meals,
    },
  }
}

const KEY = 'fitness-pal:v1'

export function loadState(): FormState {
  try {
    const fromHash = location.hash.startsWith('#s=') ? JSON.parse(decodeURIComponent(atob(location.hash.slice(3)))) : null
    const saved = fromHash ?? JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved && typeof saved === 'object') return { ...DEFAULT_STATE, ...saved, custom: { ...DEFAULT_STATE.custom, ...saved.custom } }
  } catch {
    // Corrupt or blocked storage: fall back to defaults.
  }
  return DEFAULT_STATE
}

export function saveState(f: FormState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(f))
  } catch {
    // Private mode or storage disabled; the app still works without persistence.
  }
}

export function shareUrl(f: FormState): string {
  const url = new URL(location.href)
  url.hash = 's=' + btoa(encodeURIComponent(JSON.stringify(f)))
  return url.toString()
}
