import { useFormState } from './hooks/useFormState';
import { ProgressBar } from './components/ui/ProgressBar';
import { StepPersonalDetails } from './components/steps/StepPersonalDetails';
import { StepGoals } from './components/steps/StepGoals';
import { StepResults } from './components/steps/StepResults';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  calculateWeeksToGoal,
} from './utils/calculations';
import { ACTIVITY_LEVELS } from './constants/activityLevels';
import { CalculationResults } from './types/fitness';

const STEP_LABELS = ['Details', 'Goal', 'Results'];

export default function App() {
  const { state, updatePersonal, updateGoals, setResults, goToStep, reset } = useFormState();

  const handleCalculate = () => {
    const p = state.personal;
    const g = state.goals;

    const weightKg = Number(p.weightKg);
    const heightCm = Number(p.heightCm);
    const age = Number(p.age);

    const activity = ACTIVITY_LEVELS.find((a) => a.value === g.activityLevel)!;
    const bmr = calculateBMR(weightKg, heightCm, age, p.gender);
    const tdee = calculateTDEE(bmr, activity.multiplier);
    const { targetCalories, calsBelowMinimum, minimumCalories } = calculateTargetCalories(
      tdee,
      g.goal,
      p.gender,
      g.surplus
    );
    const { proteinG, fatG, carbsG } = calculateMacros(targetCalories, weightKg);

    let weeksToGoal: number | null = null;
    let weeklyRateKg: number | null = null;

    const targetKg = Number(g.targetWeightKg);
    if ((g.goal === 'lose' || g.goal === 'gain') && targetKg && targetKg !== weightKg) {
      const dailyDelta = targetCalories - tdee;
      const result = calculateWeeksToGoal(weightKg, targetKg, dailyDelta);
      if (result) {
        weeksToGoal = result.weeks;
        weeklyRateKg = result.weeklyRateKg;
      }
    }

    const results: CalculationResults = {
      bmr,
      tdee,
      targetCalories,
      proteinG,
      fatG,
      carbsG,
      weeksToGoal,
      weeklyRateKg,
      calsBelowMinimum,
      minimumCalories,
    };

    setResults(results);
    goToStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-start justify-center p-4 md:p-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-brand-600">Fitness</span> Pal
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your personalized nutrition calculator</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <ProgressBar currentStep={state.step} totalSteps={3} labels={STEP_LABELS} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          {state.step === 1 && (
            <StepPersonalDetails
              personal={state.personal}
              onChange={updatePersonal}
              onNext={() => goToStep(2)}
            />
          )}
          {state.step === 2 && (
            <StepGoals
              personal={state.personal}
              goals={state.goals}
              onChange={updateGoals}
              onNext={handleCalculate}
              onBack={() => goToStep(1)}
            />
          )}
          {state.step === 3 && state.results && (
            <StepResults
              personal={state.personal}
              goals={state.goals}
              results={state.results}
              onReset={reset}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Based on the Mifflin-St Jeor equation. Consult a healthcare professional before making significant dietary changes.
        </p>
      </div>
    </div>
  );
}
