export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
              <div className="h-5 bg-slate-200 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Default export - general purpose loading skeleton
export default function LoadingSkeleton({ type = 'cards', ...props }) {
  if (type === 'table') {
    return <TableSkeleton {...props} />;
  }
  return <CardSkeleton {...props} />;
}
