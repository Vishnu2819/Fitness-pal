interface Props {
  weights: number[]
  target?: number
  unit: string
}

/** Small SVG line chart of projected weekly weight. */
export function Timeline({ weights, target, unit }: Props) {
  if (weights.length < 2) return null
  const W = 560, H = 200, P = { l: 44, r: 16, t: 16, b: 28 }
  const all = target !== undefined ? [...weights, target] : weights
  let lo = Math.min(...all), hi = Math.max(...all)
  const pad = Math.max(1, (hi - lo) * 0.15)
  lo -= pad; hi += pad
  const x = (i: number) => P.l + (i / (weights.length - 1)) * (W - P.l - P.r)
  const y = (v: number) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b)
  const d = weights.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const ticks = [lo + pad, (lo + hi) / 2, hi - pad]
  const weekTicks = [0, Math.round((weights.length - 1) / 2), weights.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="timeline" role="img" aria-label={`Projected weight from ${weights[0].toFixed(1)} to ${weights[weights.length - 1].toFixed(1)} ${unit} over ${weights.length - 1} weeks`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="grid" />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="axis">{t.toFixed(0)}</text>
        </g>
      ))}
      {weekTicks.map((w) => (
        <text key={w} x={x(w)} y={H - 8} textAnchor="middle" className="axis">wk {w}</text>
      ))}
      {target !== undefined && (
        <>
          <line x1={P.l} x2={W - P.r} y1={y(target)} y2={y(target)} className="target" />
          <text x={P.l + 6} y={y(target) + (target < weights[0] ? 16 : -6)} className="axis accent">goal {target.toFixed(0)} {unit}</text>
        </>
      )}
      <path d={`${d} L${x(weights.length - 1)} ${H - P.b} L${x(0)} ${H - P.b} Z`} className="area" />
      <path d={d} className="line" />
      <circle cx={x(weights.length - 1)} cy={y(weights[weights.length - 1])} r="4.5" className="dot" />
    </svg>
  )
}
