import clsx from 'clsx';

interface MacroCardProps {
  label: string;
  grams: number;
  calories: number;
  percentage: number;
  colorScheme: 'blue' | 'amber' | 'green';
}

const colors = {
  blue:  { bg: 'bg-blue-50',  border: 'border-blue-100',  text: 'text-blue-700',  bar: 'bg-blue-400'  },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', bar: 'bg-amber-400' },
  green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', bar: 'bg-green-400' },
};

export function MacroCard({ label, grams, calories, percentage, colorScheme }: MacroCardProps) {
  const c = colors[colorScheme];
  return (
    <div className={clsx('rounded-xl border p-4 text-center', c.bg, c.border)}>
      <p className={clsx('text-xs font-semibold uppercase tracking-wide mb-1', c.text)}>{label}</p>
      <p className="text-2xl font-bold text-gray-800">{grams}g</p>
      <p className="text-xs text-gray-500 mt-0.5">{calories} kcal</p>
      <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', c.bar)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className={clsx('text-xs mt-1 font-medium', c.text)}>{percentage}% of total</p>
    </div>
  );
}
