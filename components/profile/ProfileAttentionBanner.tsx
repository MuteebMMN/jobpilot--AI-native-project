type Props = {
  percentage: number;
  missingFields: string[];
};

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="relative flex-shrink-0 w-[100px] h-[100px]">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="8"
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-semibold text-text-primary">{percentage}%</span>
      </div>
    </div>
  );
}

export function ProfileAttentionBanner({ percentage, missingFields }: Props) {
  const isComplete = percentage === 100;

  if (isComplete) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="8" fill="var(--color-warning)" />
            <path
              d="M8 4.5v4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="10.75" r="0.85" fill="white" />
          </svg>
          <p className="text-sm font-semibold text-text-primary">
            Profile needs attention
          </p>
        </div>
        <p className="text-xs text-text-secondary mb-3 leading-relaxed">
          Complete the missing fields to improve your chance of getting tailored
          matches and generating quality resumes.
        </p>
        <div className="flex flex-wrap gap-2">
          {missingFields.map((field) => (
            <span
              key={field}
              className="px-2 py-0.5 bg-error-light text-error text-[10px] font-semibold rounded-full tracking-wider"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
      <ProgressRing percentage={percentage} />
    </div>
  );
}
