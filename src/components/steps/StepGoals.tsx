import { GoalDetails, Goal, PersonalDetails, SurplusAmount } from '../../types/fitness';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ACTIVITY_LEVELS } from '../../constants/activityLevels';
import { lbsToKg, kgToLbs } from '../../utils/unitConversion';
import clsx from 'clsx';

interface Props {
  personal: PersonalDetails;
  goals: GoalDetails;
  onChange: (partial: Partial<GoalDetails>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GOAL_OPTIONS: { value: Goal; label: string; description: string; icon: string }[] = [
  { value: 'lose',     label: 'Lose Weight',   description: 'Caloric deficit to reach target weight',       icon: '📉' },
  { value: 'gain',     label: 'Gain Weight',   description: 'Caloric surplus to build muscle & mass',       icon: '📈' },
  { value: 'recomp',   label: 'Body Recomp',   description: 'Build muscle & lose fat simultaneously',       icon: '🔄' },
  { value: 'maintain', label: 'Maintain',      description: 'Stay at current weight with optimal nutrition', icon: '⚖️' },
];

function validate(goals: GoalDetails, personal: PersonalDetails): Record<string, string> {
  const errors: Record<string, string> = {};
  const currentKg = Number(personal.weightKg);

  if (goals.goal === 'lose' || goals.goal === 'gain') {
    const useImperial = personal.unitSystem === 'imperial';
    const targetKg = useImperial
      ? (goals.targetWeightLbs !== '' ? lbsToKg(Number(goals.targetWeightLbs)) : '')
      : goals.targetWeightKg;

    if (targetKg === '' || isNaN(Number(targetKg))) {
      errors.targetWeight = 'Please enter your target weight';
    } else if (goals.goal === 'lose' && Number(targetKg) >= currentKg) {
      errors.targetWeight = 'Target must be less than current weight for a loss goal';
    } else if (goals.goal === 'gain' && Number(targetKg) <= currentKg) {
      errors.targetWeight = 'Target must be greater than current weight for a gain goal';
    } else if (Number(targetKg) < 30 || Number(targetKg) > 300) {
      errors.targetWeight = 'Enter a realistic target weight';
    }
  }
  return errors;
}

export function StepGoals({ personal, goals, onChange, onNext, onBack }: Props) {
  const errors = validate(goals, personal);
  const needsTarget = goals.goal === 'lose' || goals.goal === 'gain';
  const canProceed = Object.keys(errors).length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Your Goal</h2>
        <p className="text-sm text-gray-500 mt-1">Tell us your fitness goal and activity level.</p>
      </div>

      <Select
        label="Activity Level"
        options={ACTIVITY_LEVELS.map((a) => ({ value: a.value, label: a.label, description: a.description }))}
        value={goals.activityLevel}
        onChange={(e) => onChange({ activityLevel: e.target.value as GoalDetails['activityLevel'] })}
      />

      {/* Goal cards */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Goal</span>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ goal: opt.value })}
              className={clsx(
                'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
                goals.goal === opt.value
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-400'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className={clsx('text-sm font-semibold', goals.goal === opt.value ? 'text-brand-700' : 'text-gray-800')}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-500 leading-tight">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target weight */}
      {needsTarget && (
        personal.unitSystem === 'metric' ? (
          <Input
            label={`Target Weight`}
            type="number"
            suffix="kg"
            placeholder={goals.goal === 'lose' ? 'e.g. 70' : 'e.g. 85'}
            value={goals.targetWeightKg === '' ? '' : String(goals.targetWeightKg)}
            onChange={(e) => {
              const kg = e.target.value === '' ? '' : Number(e.target.value);
              onChange({ targetWeightKg: kg as number | '', targetWeightLbs: kg === '' ? '' : kgToLbs(Number(kg)) as number | '' });
            }}
            error={goals.targetWeightKg !== '' ? errors.targetWeight : undefined}
            hint={`Current: ${personal.weightKg} kg`}
          />
        ) : (
          <Input
            label={`Target Weight`}
            type="number"
            suffix="lbs"
            placeholder={goals.goal === 'lose' ? 'e.g. 154' : 'e.g. 187'}
            value={goals.targetWeightLbs === '' ? '' : String(goals.targetWeightLbs)}
            onChange={(e) => {
              const lbs = e.target.value === '' ? '' : Number(e.target.value);
              const kg = lbs === '' ? '' : lbsToKg(Number(lbs));
              onChange({ targetWeightLbs: lbs as number | '', targetWeightKg: kg as number | '' });
            }}
            error={goals.targetWeightLbs !== '' ? errors.targetWeight : undefined}
            hint={`Current: ${personal.weightLbs} lbs`}
          />
        )
      )}

      {/* Surplus option for gain */}
      {goals.goal === 'gain' && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Daily Caloric Surplus</span>
          <div className="flex gap-2">
            {([250, 500] as SurplusAmount[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ surplus: s })}
                className={clsx(
                  'flex-1 rounded-lg border py-2 text-sm font-medium transition-all',
                  goals.surplus === s
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'
                )}
              >
                +{s} kcal
                <span className="block text-xs font-normal opacity-75">
                  {s === 250 ? 'Lean bulk' : 'Aggressive bulk'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="w-24">
          ← Back
        </Button>
        <Button fullWidth disabled={!canProceed} onClick={onNext}>
          Calculate →
        </Button>
      </div>
    </div>
  );
}
