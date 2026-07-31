import React from 'react';

export const SkeletonRow: React.FC = () => {
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
      </div>

      <div className="flex items-center gap-4 overflow-hidden py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-44 sm:w-56 lg:w-64 bg-[#12141C] rounded-2xl overflow-hidden border border-white/5 p-3 space-y-3 animate-pulse"
          >
            <div className="aspect-[16/10] w-full bg-white/10 rounded-xl" />
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-3 w-12 bg-white/10 rounded" />
              <div className="h-3 w-8 bg-white/10 rounded" />
              <div className="h-3 w-8 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
