import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-sm animate-pulse flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-16 bg-surface-container-highest rounded" />
          <div className="h-3 w-24 bg-surface-container-high rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => (
  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm animate-pulse">
    <div className="border-b border-outline-variant/30 px-6 py-3.5 flex gap-4 bg-surface-container-low">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-surface-container-highest rounded flex-1" />
      ))}
    </div>
    <div className="divide-y divide-outline-variant/20">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-surface-container-high rounded flex-1 ${j === 0 ? 'w-1/3' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm animate-pulse h-72 flex flex-col justify-between p-6">
    <div className="flex justify-between items-center mb-4">
      <div className="h-5 w-36 bg-surface-container-highest rounded" />
      <div className="h-4 w-20 bg-surface-container-high rounded" />
    </div>
    <div className="flex items-end gap-4 h-48 pt-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-surface-container-high rounded-t"
          style={{ height: `${Math.max(25, (i * 17) % 100)}%` }}
        />
      ))}
    </div>
  </div>
);
