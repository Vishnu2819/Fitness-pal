import { describe, expect, it } from 'vitest'
import { computePlan, Inputs, katchMcArdle, mifflinStJeor, projectWeights, splitMacros, lbToKg, kgToLb } from './calc'

const base: Inputs = {
  sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate', goal: 'maintain',
  rateKg: 0.5, diet: 'balanced', custom: { protein: 30, carbs: 40, fat: 30 }, meals: 3,
}

describe('BMR formulas', () => {
  it('matches published Mifflin-St Jeor values', () => {
    expect(mifflinStJeor('male', 80, 180, 30)).toBe(1780)
    expect(mifflinStJeor('female', 60, 165, 25)).toBeCloseTo(1345.25)
  })
  it('matches Katch-McArdle', () => {
    expect(katchMcArdle(64)).toBeCloseTo(1752.4)
  })
})

describe('computePlan', () => {
  it('maintenance equals TDEE', () => {
    const p = computePlan(base)
    expect(p.bmr).toBe(1780)
    expect(p.tdee).toBe(2759)
    expect(p.calories).toBe(2760)
    expect(p.dailyDelta).toBe(0)
  })

  it('applies a 500 kcal-ish deficit for 0.5 kg/week loss', () => {
    const p = computePlan({ ...base, goal: 'lose' })
    expect(p.tdee - p.calories).toBeGreaterThan(540)
    expect(p.tdee - p.calories).toBeLessThan(560)
  })

  it('never goes below the safety floor and says so', () => {
    const p = computePlan({ ...base, sex: 'female', weightKg: 50, heightCm: 155, activity: 'sedentary', goal: 'lose', rateKg: 1 })
    expect(p.calories).toBe(1200)
    expect(p.floored).toBe(true)
    expect(p.warnings.join(' ')).toMatch(/safe minimum/)
  })

  it('uses Katch-McArdle when body fat is given', () => {
    const p = computePlan({ ...base, bodyFatPct: 20 })
    expect(p.bmrFormula).toBe('Katch-McArdle')
    expect(p.leanMassKg).toBe(64)
    expect(p.bmr).toBe(1752)
  })

  it('macro calories add up to roughly the target', () => {
    for (const diet of ['balanced', 'highProtein', 'lowCarb', 'keto', 'custom'] as const) {
      const p = computePlan({ ...base, diet, goal: 'lose' })
      const sum = p.macroCalories.protein + p.macroCalories.carbs + p.macroCalories.fat
      expect(Math.abs(sum - p.calories)).toBeLessThan(25)
    }
  })

  it('keto keeps carbs near 25 g', () => {
    expect(computePlan({ ...base, diet: 'keto' }).macros.carbs).toBe(25)
  })

  it('estimates weeks to target and flags a mismatched target', () => {
    expect(computePlan({ ...base, goal: 'lose', targetWeightKg: 75 }).weeksToTarget).toBe(10)
    const bad = computePlan({ ...base, goal: 'lose', targetWeightKg: 90 })
    expect(bad.weeksToTarget).toBeUndefined()
    expect(bad.warnings.join(' ')).toMatch(/doesn't match/)
  })

  it('splits meals with snacks at half weight and sums to the daily target', () => {
    const p = computePlan({ ...base, meals: 4 })
    expect(p.meals.map((m) => m.name)).toEqual(['Breakfast', 'Lunch', 'Snack', 'Dinner'])
    expect(p.meals[2].calories).toBeLessThan(p.meals[0].calories)
    const total = p.meals.reduce((s, m) => s + m.calories, 0)
    expect(Math.abs(total - p.calories)).toBeLessThanOrEqual(10)
  })

  it('normalises a custom split that does not sum to 100', () => {
    const m = splitMacros(2000, { ...base, diet: 'custom', custom: { protein: 1, carbs: 1, fat: 2 } })
    expect(m.protein * 4).toBeCloseTo(500)
    expect(m.fat * 9).toBeCloseTo(1000)
  })
})

describe('helpers', () => {
  it('round-trips pounds', () => {
    expect(kgToLb(lbToKg(180))).toBeCloseTo(180)
  })
  it('projects weekly weights downward on a cut', () => {
    const p = computePlan({ ...base, goal: 'lose' })
    const w = projectWeights(80, p, 4)
    expect(w).toHaveLength(5)
    expect(w[4]).toBeLessThan(w[0])
  })
})
