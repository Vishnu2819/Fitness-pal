import { PersonalDetails, GoalDetails, CalculationResults } from '../../types/fitness';
import { MacroCard } from '../results/MacroCard';
import { StatRow } from '../results/StatRow';
import { TimeEstimate } from '../results/TimeEstimate';
import { ExportPanel } from '../results/ExportPanel';

interface Props {
  personal: PersonalDetails;
  goals: GoalDetails;
  results: CalculationResults;
  onReset: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  lose: 'Weight Loss',
  gain: 'Weight Gain',
  recomp: 'Body Recomposition',
  maintain: 'Maintenance',
};

const GOAL_DELTA_LABEL: Record<string, string> = {
  lose: 'Deficit',
  gain: 'Surplus',
  recomp: 'Balanced',
  maintain: 'Balanced',
};

export function StepResults({ personal, goals, results, onReset }: Props) {
  const deltaKcal = results.targetCalories - results.tdee;
  const deltaLabel = GOAL_DELTA_LABEL[goals.goal];
  const deltaDisplay = deltaKcal === 0 ? 'Balanced' : `${Math.abs(deltaKcal)} kcal ${deltaKcal < 0 ? 'deficit' : 'surplus'}`;

  const totalMacroKcal = results.proteinG * 4 + results.fatG * 9 + results.carbsG * 4;
  const pctProtein = Math.round((results.proteinG * 4 / totalMacroKcal) * 100);
  const pctFat = Math.round((results.fatG * 9 / totalMacroKcal) * 100);
  const pctCarbs = 100 - pctProtein - pctFat;

  const targetWeightDisplay =
    personal.unitSystem === 'metric'
      ? `${goals.targetWeightKg} kg`
      : `${goals.targetWeightLbs} lbs`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Your Results</h2>
        <p className="text-sm text-gray-500 mt-1">
          {personal.name ? `Here's your plan, ${personal.name}!` : "Here's your personalized nutrition plan!"}
        </p>
      </div>

      {/* Caloric minimum warning */}
      {results.calsBelowMinimum && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-xs text-yellow-800">
            Your calculated deficit would fall below the safe minimum of{' '}
            <strong>{results.minimumCalories} kcal/day</strong>. We've adjusted your target to keep
            you healthy. Consider a smaller weekly deficit or consult a nutritionist.
          </p>
        </div>
      )}

      {/* Hero: Target Calories */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white text-center">
        <p className="text-sm font-medium opacity-80 mb-1">{GOAL_LABELS[goals.goal]} — Daily Target</p>
        <p className="text-5xl font-bold">{results.targetCalories}</p>
        <p className="text-sm opacity-80 mt-1">kcal / day</p>
        <div className="mt-3 inline-block bg-white/20 rounded-full px-4 py-1 text-sm">
          {deltaDisplay}
        </div>
      </div>

      {/* BMR / TDEE stats */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Metabolic Stats</p>
        <StatRow
          label="BMR"
          sublabel="Basal Metabolic Rate — calories at rest"
          value={results.bmr}
        />
        <StatRow
          label="TDEE"
          sublabel="Total Daily Energy Expenditure"
          value={results.tdee}
          highlight
        />
        <StatRow
          label={deltaLabel}
          value={Math.abs(deltaKcal)}
          unit="kcal/day"
        />
      </div>

      {/* Macros */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Daily Macros</p>
        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            label="Protein"
            grams={results.proteinG}
            calories={results.proteinG * 4}
            percentage={pctProtein}
            colorScheme="blue"
          />
          <MacroCard
            label="Fat"
            grams={results.fatG}
            calories={results.fatG * 9}
            percentage={pctFat}
            colorScheme="amber"
          />
          <MacroCard
            label="Carbs"
            grams={results.carbsG}
            calories={results.carbsG * 4}
            percentage={pctCarbs}
            colorScheme="green"
          />
        </div>
      </div>

      {/* Time estimate */}
      <TimeEstimate
        goal={goals.goal}
        weeksToGoal={results.weeksToGoal}
        weeklyRateKg={results.weeklyRateKg}
        targetWeightDisplay={targetWeightDisplay}
      />

      {/* Export */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Save Your Results</p>
        <ExportPanel personal={personal} goals={goals} results={results} onReset={onReset} />
      </div>
    </div>
  );
}
