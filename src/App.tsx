import { useEffect, useMemo, useState } from 'react'
import { ACTIVITY, ActivityLevel, DIETS, DietStyle, Goal, cmToIn, computePlan, inToCm, kgToLb, lbToKg, projectWeights } from './lib/calc'
import { FormState, RATES, loadState, saveState, shareUrl, toInputs } from './lib/state'
import { MacroDonut } from './components/MacroDonut'
import { Timeline } from './components/Timeline'

const fmt = (n: number, d = 0) => (Number.isFinite(n) ? n.toFixed(d) : '')

export default function App() {
  const [form, setForm] = useState<FormState>(loadState)
  const [copied, setCopied] = useState(false)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => saveState(form), [form])

  const parsed = useMemo(() => toInputs(form), [form])
  const plan = useMemo(() => (parsed.inputs ? computePlan(parsed.inputs) : null), [parsed])
  const imperial = form.units === 'imperial'
  const wUnit = imperial ? 'lb' : 'kg'
  const toDisplay = (kg: number) => (imperial ? kgToLb(kg) : kg)

  function switchUnits(units: FormState['units']) {
    if (units === form.units) return
    setForm((f) => {
      const w = parseFloat(f.weight), t = parseFloat(f.target)
      const rateIdx = RATES[f.units].indexOf(f.rate)
      if (units === 'metric') {
        const cm = inToCm((parseFloat(f.heightFt) || 0) * 12 + (parseFloat(f.heightIn) || 0))
        return { ...f, units, heightCm: fmt(cm), weight: fmt(lbToKg(w), 1), target: f.target && fmt(lbToKg(t), 1), rate: RATES.metric[Math.max(0, rateIdx)] }
      }
      const inches = Math.round(cmToIn(parseFloat(f.heightCm)))
      return { ...f, units, heightFt: fmt(Math.floor(inches / 12)), heightIn: fmt(inches % 12), weight: fmt(kgToLb(w)), target: f.target && fmt(kgToLb(t)), rate: RATES.imperial[Math.max(0, rateIdx)] }
    })
  }

  async function share() {
    const url = shareUrl(form)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const customTotal = form.custom.protein + form.custom.carbs + form.custom.fat
  const weeks = plan?.weeksToTarget ?? 12
  const projection = plan && parsed.inputs && form.goal !== 'maintain' ? projectWeights(parsed.inputs.weightKg, plan, weeks).map(toDisplay) : []

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" /><path d="M16 6a10 10 0 1 0 10 10H16z" /><path d="M18 4a10 10 0 0 1 10 10H18z" /></svg>
          <span>Fitness Pal</span>
        </div>
        <p className="tag">Calories and macros, worked out for you</p>
      </header>

      <main className="layout">
        <form className="card form" onSubmit={(e) => e.preventDefault()} aria-label="Your details">
          <div className="row between">
            <h2>About you</h2>
            <Segmented label="Units" value={form.units} onChange={switchUnits} options={[['imperial', 'lb / ft'], ['metric', 'kg / cm']]} />
          </div>

          <Segmented label="Sex" value={form.sex} onChange={(v) => set('sex', v)} options={[['male', 'Male'], ['female', 'Female']]} wide />

          <div className="grid2">
            <Field label="Age" error={parsed.errors.age}>
              <input inputMode="numeric" value={form.age} onChange={(e) => set('age', e.target.value)} />
              <span className="suffix">yrs</span>
            </Field>
            {imperial ? (
              <Field label="Height" error={parsed.errors.height}>
                <input inputMode="numeric" aria-label="Feet" value={form.heightFt} onChange={(e) => set('heightFt', e.target.value)} />
                <span className="suffix">ft</span>
                <input inputMode="numeric" aria-label="Inches" value={form.heightIn} onChange={(e) => set('heightIn', e.target.value)} />
                <span className="suffix">in</span>
              </Field>
            ) : (
              <Field label="Height" error={parsed.errors.height}>
                <input inputMode="decimal" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} />
                <span className="suffix">cm</span>
              </Field>
            )}
            <Field label="Weight" error={parsed.errors.weight}>
              <input inputMode="decimal" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
              <span className="suffix">{wUnit}</span>
            </Field>
            <Field label="Body fat (optional)" error={parsed.errors.bodyFat} hint="Improves accuracy if you know it">
              <input inputMode="decimal" placeholder="e.g. 18" value={form.bodyFat} onChange={(e) => set('bodyFat', e.target.value)} />
              <span className="suffix">%</span>
            </Field>
          </div>

          <label className="label" htmlFor="activity">Activity level</label>
          <select id="activity" value={form.activity} onChange={(e) => set('activity', e.target.value as ActivityLevel)}>
            {Object.entries(ACTIVITY).map(([k, a]) => (
              <option key={k} value={k}>{a.label} · {a.detail}</option>
            ))}
          </select>

          <h2 className="mt">Your goal</h2>
          <Segmented label="Goal" value={form.goal} onChange={(v: Goal) => set('goal', v)} options={[['lose', 'Lose fat'], ['maintain', 'Maintain'], ['gain', 'Build muscle']]} wide />

          {form.goal !== 'maintain' && (
            <div className="grid2">
              <div>
                <label className="label" htmlFor="rate">Pace per week</label>
                <select id="rate" value={form.rate} onChange={(e) => set('rate', parseFloat(e.target.value))}>
                  {RATES[form.units].map((r) => (
                    <option key={r} value={r}>{r} {wUnit}</option>
                  ))}
                </select>
                <span className="hint">{RATES[form.units][1]} {wUnit} is a sustainable pace</span>
              </div>
              <Field label="Target weight (optional)" error={parsed.errors.target}>
                <input inputMode="decimal" value={form.target} onChange={(e) => set('target', e.target.value)} />
                <span className="suffix">{wUnit}</span>
              </Field>
            </div>
          )}

          <h2 className="mt">How you like to eat</h2>
          <div className="chips" role="radiogroup" aria-label="Diet style">
            {Object.entries(DIETS).map(([k, d]) => (
              <button type="button" role="radio" aria-checked={form.diet === k} key={k} className={form.diet === k ? 'chip on' : 'chip'} onClick={() => set('diet', k as DietStyle)} title={d.detail}>
                {d.label}
              </button>
            ))}
          </div>
          <p className="hint">{DIETS[form.diet].detail}</p>

          {form.diet === 'custom' && (
            <div className="sliders">
              {(['protein', 'carbs', 'fat'] as const).map((k) => (
                <label key={k} className="slider">
                  <span className="cap">{k}</span>
                  <input type="range" min={5} max={70} step={5} value={form.custom[k]} onChange={(e) => set('custom', { ...form.custom, [k]: Number(e.target.value) })} />
                  <span className="val">{form.custom[k]}%</span>
                </label>
              ))}
              {customTotal !== 100 && <p className="hint warn">Adds up to {customTotal}%; it will be scaled to 100%.</p>}
            </div>
          )}

          <label className="label" htmlFor="meals">Meals per day: <strong>{form.meals}</strong></label>
          <input id="meals" type="range" min={2} max={6} value={form.meals} onChange={(e) => set('meals', Number(e.target.value))} />
        </form>

        <section className="results" aria-live="polite">
          {!plan ? (
            <div className="card empty">
              <p>Fill in the highlighted fields to see your plan.</p>
            </div>
          ) : (
            <>
              <div className="card hero">
                <div>
                  <p className="eyebrow">Daily target</p>
                  <p className="big">{plan.calories.toLocaleString()} <span>kcal</span></p>
                  <p className="muted">
                    {plan.dailyDelta === 0 ? 'Maintenance' : `${plan.dailyDelta > 0 ? '+' : '−'}${Math.abs(plan.dailyDelta)} kcal vs maintenance`}
                    {plan.weeksToTarget !== undefined && <> · reach your goal in about <strong>{plan.weeksToTarget} weeks</strong></>}
                  </p>
                </div>
                <dl className="stats">
                  <div><dt>BMR</dt><dd>{plan.bmr.toLocaleString()}</dd><small>{plan.bmrFormula}</small></div>
                  <div><dt>Maintenance</dt><dd>{plan.tdee.toLocaleString()}</dd><small>×{ACTIVITY[form.activity].factor} activity</small></div>
                  <div><dt>BMI</dt><dd>{plan.bmi}</dd><small>{plan.bmiCategory}</small></div>
                </dl>
              </div>

              {plan.warnings.length > 0 && (
                <div className="card warnings" role="note">
                  {plan.warnings.map((w) => <p key={w}>⚠ {w}</p>)}
                </div>
              )}

              <div className="card">
                <h2>Macros</h2>
                <MacroDonut grams={plan.macros} kcal={plan.macroCalories} calories={plan.calories} />
              </div>

              <div className="card">
                <div className="row between">
                  <h2>Meal plan</h2>
                  <span className="muted small">{form.meals} meals</span>
                </div>
                <table className="meals">
                  <thead>
                    <tr><th scope="col">Meal</th><th scope="col">kcal</th><th scope="col" className="p">Protein</th><th scope="col" className="c">Carbs</th><th scope="col" className="f">Fat</th></tr>
                  </thead>
                  <tbody>
                    {plan.meals.map((m, i) => (
                      <tr key={i}><th scope="row">{m.name}</th><td>{m.calories}</td><td>{m.macros.protein} g</td><td>{m.macros.carbs} g</td><td>{m.macros.fat} g</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {projection.length > 1 && (
                <div className="card">
                  <h2>Projected progress</h2>
                  <Timeline weights={projection} target={parsed.inputs?.targetWeightKg !== undefined ? toDisplay(parsed.inputs.targetWeightKg) : undefined} unit={wUnit} />
                  <p className="hint">A straight-line estimate. Real progress zig-zags with water weight, and slows as you get lighter, so recalculate every few weeks.</p>
                </div>
              )}

              <div className="card extras">
                <div><span className="eyebrow">Water</span><strong>{imperial ? `${Math.round(plan.waterLiters * 33.814)} fl oz` : `${plan.waterLiters} L`}</strong></div>
                <div><span className="eyebrow">Fiber</span><strong>{plan.fiber} g</strong></div>
                {plan.leanMassKg !== undefined && <div><span className="eyebrow">Lean mass</span><strong>{fmt(toDisplay(plan.leanMassKg), 1)} {wUnit}</strong></div>}
                <button type="button" className="btn" onClick={share}>{copied ? 'Link copied ✓' : 'Share this plan'}</button>
              </div>

              <p className="disclaimer">These are estimates from standard formulas, not medical advice. Check with a doctor or registered dietitian before making big changes.</p>
            </>
          )}
        </section>
      </main>

      <footer className="foot">
        Built by <a href="https://vishnuvulli.netlify.app" target="_blank" rel="noopener">Vishnu Vulli</a> · <a href="https://github.com/Vishnu2819/Fitness-pal" target="_blank" rel="noopener">Source</a>
      </footer>
    </div>
  )
}

function Segmented<T extends string>({ label, value, onChange, options, wide }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][]; wide?: boolean }) {
  return (
    <div className={wide ? 'seg wide' : 'seg'} role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button type="button" role="radio" aria-checked={value === v} key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={error ? 'field invalid' : 'field'}>
      <span className="label">{label}</span>
      <div className="input">{children}</div>
      {error ? <span className="err">{error}</span> : hint && <span className="hint">{hint}</span>}
    </div>
  )
}
