import { Check } from 'lucide-react';

interface WizardNavProps {
  steps: { label: string }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function WizardNav({ steps, currentStep, onStepClick }: WizardNavProps) {
  return (
    <div className="flex items-center justify-center w-full py-6">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={index} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-primary-600 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                } ${isClickable ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-white text-primary-600'
                      : isCompleted
                      ? 'bg-white text-green-500'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                </span>
                {step.label}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
