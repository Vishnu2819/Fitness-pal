import { PersonalDetails, UnitSystem, Gender } from '../../types/fitness';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ftInToCm, lbsToKg, cmToFtIn, kgToLbs } from '../../utils/unitConversion';
import clsx from 'clsx';

interface Props {
  personal: PersonalDetails;
  onChange: (partial: Partial<PersonalDetails>) => void;
  onNext: () => void;
}

function validate(p: PersonalDetails): Record<string, string> {
  const errors: Record<string, string> = {};
  if (p.age === '' || Number(p.age) < 15 || Number(p.age) > 100)
    errors.age = 'Age must be between 15 and 100';
  if (p.unitSystem === 'metric') {
    if (p.heightCm === '' || Number(p.heightCm) < 100 || Number(p.heightCm) > 250)
      errors.heightCm = 'Enter a valid height (100–250 cm)';
    if (p.weightKg === '' || Number(p.weightKg) < 30 || Number(p.weightKg) > 300)
      errors.weightKg = 'Enter a valid weight (30–300 kg)';
  } else {
    if (p.heightFt === '' || p.heightIn === '' || Number(p.heightFt) < 3 || Number(p.heightFt) > 8)
      errors.heightFt = 'Enter a valid height';
    if (p.weightLbs === '' || Number(p.weightLbs) < 66 || Number(p.weightLbs) > 660)
      errors.weightLbs = 'Enter a valid weight (66–660 lbs)';
  }
  return errors;
}

export function StepPersonalDetails({ personal, onChange, onNext }: Props) {
  const errors = validate(personal);
  const canProceed = Object.keys(errors).length === 0;

  const switchUnit = (system: UnitSystem) => {
    if (system === personal.unitSystem) return;
    if (system === 'imperial') {
      const ft = personal.heightCm !== '' ? cmToFtIn(Number(personal.heightCm)) : { ft: '', inches: '' };
      const lbs = personal.weightKg !== '' ? kgToLbs(Number(personal.weightKg)) : '';
      onChange({ unitSystem: 'imperial', heightFt: ft.ft as number | '', heightIn: ft.inches as number | '', weightLbs: lbs as number | '' });
    } else {
      const cm = personal.heightFt !== '' && personal.heightIn !== ''
        ? ftInToCm(Number(personal.heightFt), Number(personal.heightIn))
        : '';
      const kg = personal.weightLbs !== '' ? lbsToKg(Number(personal.weightLbs)) : '';
      onChange({ unitSystem: 'metric', heightCm: cm as number | '', weightKg: kg as number | '' });
    }
  };

  const handleHeightFtIn = (field: 'heightFt' | 'heightIn', val: string) => {
    const num = val === '' ? '' : Number(val);
    const ft = field === 'heightFt' ? (num === '' ? '' : Number(num)) : (personal.heightFt === '' ? 0 : Number(personal.heightFt));
    const inches = field === 'heightIn' ? (num === '' ? 0 : Number(num)) : (personal.heightIn === '' ? 0 : Number(personal.heightIn));
    // auto-carry 12 inches
    const totalIn = Number(ft) * 12 + Number(inches);
    const newFt = Math.floor(totalIn / 12);
    const newIn = totalIn % 12;
    const cm = ftInToCm(newFt, newIn);
    onChange({ [field]: num, heightFt: newFt, heightIn: newIn, heightCm: cm });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
        <p className="text-sm text-gray-500 mt-1">Tell us about yourself so we can calculate your metabolic rate.</p>
      </div>

      <Input
        label="Name (optional)"
        placeholder="e.g. Alex"
        value={personal.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Age"
          type="number"
          placeholder="25"
          min={15}
          max={100}
          value={personal.age === '' ? '' : String(personal.age)}
          onChange={(e) => onChange({ age: e.target.value === '' ? '' : Number(e.target.value) })}
          error={personal.age !== '' ? errors.age : undefined}
        />

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Gender</span>
          <div className="flex gap-2 h-[42px]">
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ gender: g })}
                className={clsx(
                  'flex-1 rounded-lg border text-sm font-medium transition-all',
                  personal.gender === g
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'
                )}
              >
                {g === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Unit toggle */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Units</span>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden w-fit">
          {(['metric', 'imperial'] as UnitSystem[]).map((sys) => (
            <button
              key={sys}
              type="button"
              onClick={() => switchUnit(sys)}
              className={clsx(
                'px-4 py-2 text-sm font-medium transition-all',
                personal.unitSystem === sys
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {sys === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/ft)'}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      {personal.unitSystem === 'metric' ? (
        <Input
          label="Height"
          type="number"
          placeholder="175"
          suffix="cm"
          value={personal.heightCm === '' ? '' : String(personal.heightCm)}
          onChange={(e) => onChange({ heightCm: e.target.value === '' ? '' : Number(e.target.value) })}
          error={personal.heightCm !== '' ? errors.heightCm : undefined}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Height</span>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label=""
              type="number"
              placeholder="5"
              suffix="ft"
              value={personal.heightFt === '' ? '' : String(personal.heightFt)}
              onChange={(e) => handleHeightFtIn('heightFt', e.target.value)}
              error={errors.heightFt}
            />
            <Input
              label=""
              type="number"
              placeholder="9"
              suffix="in"
              min={0}
              max={11}
              value={personal.heightIn === '' ? '' : String(personal.heightIn)}
              onChange={(e) => handleHeightFtIn('heightIn', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Weight */}
      {personal.unitSystem === 'metric' ? (
        <Input
          label="Weight"
          type="number"
          placeholder="75"
          suffix="kg"
          value={personal.weightKg === '' ? '' : String(personal.weightKg)}
          onChange={(e) => onChange({ weightKg: e.target.value === '' ? '' : Number(e.target.value) })}
          error={personal.weightKg !== '' ? errors.weightKg : undefined}
        />
      ) : (
        <Input
          label="Weight"
          type="number"
          placeholder="165"
          suffix="lbs"
          value={personal.weightLbs === '' ? '' : String(personal.weightLbs)}
          onChange={(e) => {
            const lbs = e.target.value === '' ? '' : Number(e.target.value);
            const kg = lbs === '' ? '' : lbsToKg(lbs);
            onChange({ weightLbs: lbs as number | '', weightKg: kg as number | '' });
          }}
          error={personal.weightLbs !== '' ? errors.weightLbs : undefined}
        />
      )}

      <Button fullWidth disabled={!canProceed} onClick={onNext}>
        Continue →
      </Button>
    </div>
  );
}
