"use client";

export type StepStatus = "pending" | "active" | "done" | "error";

export interface Step {
  label: string;
  detail?: string;
  status: StepStatus;
}

interface ProgressStepsProps {
  steps: Step[];
}

export default function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {step.status === "done" ? (
                <svg className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : step.status === "active" ? (
                <svg className="animate-spin h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : step.status === "error" ? (
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-stone-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.status === "active"
                    ? "text-teal-600"
                    : step.status === "done"
                    ? "text-stone-900"
                    : step.status === "error"
                    ? "text-red-600"
                    : "text-stone-400"
                }`}
              >
                {step.label}
              </p>
              {step.detail && (step.status === "done" || step.status === "active") && (
                <p className="text-xs text-stone-500 mt-0.5 truncate">{step.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
