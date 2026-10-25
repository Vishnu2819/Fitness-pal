import { Macros } from '../lib/calc'

const COLORS = { protein: 'var(--protein)', carbs: 'var(--carbs)', fat: 'var(--fat)' }
const LABELS = { protein: 'Protein', carbs: 'Carbs', fat: 'Fat' }

export function MacroDonut({ grams, kcal, calories }: { grams: Macros; kcal: Macros; calories: number }) {
  const total = kcal.protein + kcal.carbs + kcal.fat || 1
  const r = 52
  const c = 2 * Math.PI * r
  let offset = 0
  const keys = ['protein', 'carbs', 'fat'] as const

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" className="donut" role="img" aria-label={`Macro split: ${keys.map((k) => `${LABELS[k]} ${Math.round((kcal[k] / total) * 100)}%`).join(', ')}`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--track)" strokeWidth="16" />
        {keys.map((k) => {
          const len = (kcal[k] / total) * c
          const seg = (
            <circle
              key={k}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={COLORS[k]}
              strokeWidth="16"
              strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          )
          offset += len
          return seg
        })}
        <text x="70" y="66" textAnchor="middle" className="donut-num">{calories.toLocaleString()}</text>
        <text x="70" y="84" textAnchor="middle" className="donut-unit">kcal / day</text>
      </svg>
      <ul className="macro-list">
        {keys.map((k) => (
          <li key={k}>
            <span className="swatch" style={{ background: COLORS[k] }} />
            <span className="macro-name">{LABELS[k]}</span>
            <strong>{grams[k]} g</strong>
            <span className="muted">{Math.round((kcal[k] / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
