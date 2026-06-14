export type ActivityEntry = {
  type: "job_found" | "company_researched";
  text: string;
  timestamp: string;
};

type Props = {
  entries: ActivityEntry[] | null; // null = loading
};

function ActivityDot({ type }: { type: ActivityEntry["type"] }) {
  const isJobFound = type === "job_found";
  return (
    <div
      className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
      style={{ backgroundColor: isJobFound ? "#D0FAE5" : "#DBEAFE" }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: isJobFound ? "#00BC7D" : "#61A8FF" }}
      />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 animate-pulse">
      <div className="shrink-0 w-4 h-4 rounded-full bg-border mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-border rounded w-3/4" />
        <div className="h-3 bg-border rounded w-1/4" />
      </div>
    </div>
  );
}

export function RecentActivity({ entries }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
      <h2 className="text-base font-semibold text-text-primary mb-5">Recent Activity</h2>

      {entries === null && (
        <div className="flex flex-col gap-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {entries !== null && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-sm text-text-muted text-center">
            No activity yet. Start by finding jobs or researching a company.
          </p>
        </div>
      )}

      {entries !== null && entries.length > 0 && (
        <div className="flex flex-col gap-4">
          {entries.map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <ActivityDot type={activity.type} />
              <div>
                <p className="text-sm font-medium text-text-primary leading-5">
                  {activity.text}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
