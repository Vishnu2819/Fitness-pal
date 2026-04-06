import clsx from 'clsx';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  isActive && 'bg-brand-500 text-white ring-4 ring-brand-100',
                  isDone && 'bg-brand-600 text-white',
                  !isActive && !isDone && 'bg-gray-200 text-gray-500'
                )}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className={clsx(
                  'text-xs mt-1 font-medium whitespace-nowrap',
                  isActive ? 'text-brand-600' : isDone ? 'text-brand-500' : 'text-gray-400'
                )}
              >
                {labels[i]}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-2 mb-5 transition-all',
                  isDone ? 'bg-brand-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
