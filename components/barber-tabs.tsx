"use client";

import { cn } from "@/lib/utils";
import { BarberWithServices } from "@/lib/service-utils";

interface BarberTabsProps {
  barbers: BarberWithServices[];
  selectedBarberId: number | null;
  onBarberSelect: (barberId: number) => void;
  className?: string;
}

export function BarberTabs({
  barbers,
  selectedBarberId,
  onBarberSelect,
  className,
}: BarberTabsProps) {
  if (barbers.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex overflow-x-auto gap-2 pb-2 scrollbar-hide",
        className
      )}
    >
      {barbers.map((entry) => {
        const isSelected = selectedBarberId === entry.barber.id;
        const displayName = `${entry.barber.first_name}`;

        return (
          <button
            key={entry.barber.id}
            onClick={() => onBarberSelect(entry.barber.id)}
            className={cn(
              "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              "border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
              isSelected
                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            )}
          >
            {displayName}
          </button>
        );
      })}
    </div>
  );
}
