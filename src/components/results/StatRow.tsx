interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  sublabel?: string;
}

export function StatRow({ label, value, unit = 'kcal/day', highlight, sublabel }: StatRowProps) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 ${highlight ? 'font-semibold' : ''}`}>
      <div>
        <span className={`text-sm ${highlight ? 'text-gray-800' : 'text-gray-600'}`}>{label}</span>
        {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      </div>
      <span className={`text-sm ${highlight ? 'text-brand-600 text-base font-bold' : 'text-gray-800'}`}>
        {value} <span className="text-xs text-gray-400">{unit}</span>
      </span>
    </div>
  );
}
