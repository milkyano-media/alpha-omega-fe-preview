"use client";

import { Check } from "lucide-react";
import { Service } from "@/lib/booking-service";
import { NeonBookButton } from "./NeonBookButton";

interface ServiceItemProps {
  service: Service;
  onBook: (service: Service) => void;
  variant?: "mobile" | "desktop";
  isSelected?: boolean;
}

function formatPrice(priceAmount: number): string {
  const dollars = priceAmount / 100;
  return `$${dollars.toFixed(2)}`;
}

function formatDuration(duration: number): string {
  // Duration might be in milliseconds (>10000) or minutes
  const minutes = duration > 10000 ? Math.round(duration / 60000) : duration;
  return `${minutes} min`;
}

export function ServiceItem({
  service,
  onBook,
  variant = "desktop",
  isSelected = false,
}: ServiceItemProps) {
  if (variant === "mobile") {
    return (
      <div className="bg-zinc-900/30 p-3 flex flex-col gap-2 border border-white/40 rounded-lg">
        <div className="flex-1">
          <h3 className="text-white text-xs font-bold text-center">
            {service.name}
          </h3>
          <p className="text-zinc-400 text-xs mt-1 text-center">
            {formatPrice(service.price_amount)}
          </p>
          <p className="text-zinc-500 text-[10px] mt-0.5 text-center">
            {formatDuration(service.duration)}
          </p>
        </div>
        <NeonBookButton
          onClick={() => onBook(service)}
          className="w-full h-10 text-xs !px-2 !py-2"
          isSelected={isSelected}
        >
          {isSelected ? <Check className="w-4 h-4" /> : "BOOK"}
        </NeonBookButton>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="bg-black border-b border-white/30">
      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:py-6 md:pl-6 md:pr-0">
        <div className="flex-1 md:min-w-0">
          <h3 className="text-white text-base md:text-lg font-medium text-center md:text-left">
            {service.name}
          </h3>
          <div className="flex justify-center md:justify-start gap-3 mt-1">
            <p className="text-zinc-400 text-sm">{formatPrice(service.price_amount)}</p>
            <span className="text-zinc-600">•</span>
            <p className="text-zinc-500 text-sm">{formatDuration(service.duration)}</p>
          </div>
        </div>
        <NeonBookButton
          onClick={() => onBook(service)}
          className="w-full md:w-52 md:h-14 md:flex-shrink-0 whitespace-nowrap"
          isSelected={isSelected}
        >
          {isSelected ? <Check className="w-6 h-6" /> : "BOOK"}
        </NeonBookButton>
      </div>
    </div>
  );
}
