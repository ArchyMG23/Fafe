import React, { useState } from 'react';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';

interface CMSSectionCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CMSSectionCard({
  id,
  title,
  description,
  icon: Icon,
  badge,
  children,
  defaultExpanded = true
}: CMSSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div 
      id={id} 
      className="bg-white rounded-2xl border border-stone-200/80 shadow-sm transition-all duration-200 overflow-hidden hover:border-stone-300"
    >
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-stone-50/50 hover:bg-stone-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-[#E67E22]/10 text-[#E67E22] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#6B3E1E] truncate">
                {title}
              </h3>
              {badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E67E22]/10 text-[#E67E22]">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-stone-500 truncate mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-stone-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
