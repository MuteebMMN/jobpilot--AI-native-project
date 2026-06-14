type Props = {
  label: string;
  value: string;
  trend?: string;
  subtitle?: string;
};

export function StatCard({ label, value, trend, subtitle }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-medium text-text-secondary mb-3">{label}</p>
      <p className="text-[30px] font-semibold text-text-primary leading-9 mb-3">{value}</p>
      {trend && (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-success-lightest text-success-darker text-xs font-medium rounded-sm">
            {trend}
          </span>
          <span className="text-xs text-text-muted">vs last week</span>
        </div>
      )}
      {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
    </div>
  );
}
