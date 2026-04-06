import { Goal } from '../../types/fitness';

interface TimeEstimateProps {
  goal: Goal;
  weeksToGoal: number | null;
  weeklyRateKg: number | null;
  targetWeightDisplay: string;
}

export function TimeEstimate({ goal, weeksToGoal, weeklyRateKg, targetWeightDisplay }: TimeEstimateProps) {
  if (goal === 'recomp') {
    return (
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="font-semibold text-purple-800 text-sm">Body Recomposition</p>
            <p className="text-xs text-purple-600 mt-1">
              Recomposition (building muscle while losing fat) typically takes 3–6 months of
              consistent training and nutrition. Focus on hitting your protein target and
              progressive overload in the gym.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (goal === 'maintain') return null;

  if (!weeksToGoal || !weeklyRateKg) return null;

  const months = (weeksToGoal / 4.3).toFixed(1);
  const isLosing = goal === 'lose';

  return (
    <div className={`${isLosing ? 'bg-orange-50 border-orange-100' : 'bg-teal-50 border-teal-100'} border rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{isLosing ? '📉' : '📈'}</span>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${isLosing ? 'text-orange-800' : 'text-teal-800'}`}>
            {isLosing ? 'Weight Loss' : 'Weight Gain'} Estimate
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className={`rounded-lg p-2 ${isLosing ? 'bg-orange-100' : 'bg-teal-100'}`}>
              <p className={`text-lg font-bold ${isLosing ? 'text-orange-700' : 'text-teal-700'}`}>
                {weeksToGoal}
              </p>
              <p className="text-xs text-gray-500">weeks</p>
            </div>
            <div className={`rounded-lg p-2 ${isLosing ? 'bg-orange-100' : 'bg-teal-100'}`}>
              <p className={`text-lg font-bold ${isLosing ? 'text-orange-700' : 'text-teal-700'}`}>
                {months}
              </p>
              <p className="text-xs text-gray-500">months</p>
            </div>
            <div className={`rounded-lg p-2 ${isLosing ? 'bg-orange-100' : 'bg-teal-100'}`}>
              <p className={`text-lg font-bold ${isLosing ? 'text-orange-700' : 'text-teal-700'}`}>
                {weeklyRateKg}
              </p>
              <p className="text-xs text-gray-500">kg/week</p>
            </div>
          </div>
          <p className={`text-xs mt-2 ${isLosing ? 'text-orange-600' : 'text-teal-600'}`}>
            Target: {targetWeightDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}
