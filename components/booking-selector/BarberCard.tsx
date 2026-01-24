"use client";

import { TeamMember, Service } from "@/lib/booking-service";
import Image from "next/image";

interface BarberCardProps {
  barber: TeamMember;
  services: Service[];
  isExpanded: boolean;
  variant?: "mobile" | "desktop";
}

// Map barber names to their image paths
const barberImages: Record<string, string> = {
  CHRISTOS: "/assets/booking-list/christos.jpg",
};

function getBarberImage(firstName: string): string | null {
  const upperName = firstName.toUpperCase();
  for (const [key, value] of Object.entries(barberImages)) {
    if (upperName.includes(key)) {
      return value;
    }
  }
  return null;
}

function getBarberInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function extractPriceRange(services: Service[]): string {
  const prices = services
    .map((service) => service.price_amount / 100)
    .filter((price) => price > 0);

  if (prices.length === 0) return "";

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}-$${maxPrice}`;
}

export function BarberCard({
  barber,
  services,
  isExpanded,
  variant = "desktop",
}: BarberCardProps) {
  const imagePath = getBarberImage(barber.first_name);
  const initials = getBarberInitials(barber.first_name, barber.last_name);
  const priceRange = extractPriceRange(services);

  const cardContent = (
    <>
      {/* Image or Placeholder */}
      <div
        className={`${variant === "mobile" ? "aspect-[1/1]" : "aspect-[3/4]"} overflow-hidden relative`}
      >
        {imagePath ? (
          <Image
            src={imagePath}
            alt={`${barber.first_name} ${barber.last_name}`}
            fill
            className="object-cover"
            sizes={variant === "mobile" ? "85vw" : "380px"}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
            <span className="text-white text-6xl md:text-8xl font-bold opacity-50">
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Info section at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-800/90 px-5 py-4 rounded-b-[18px]">
        <h2 className="text-[32px] font-extrabold text-white uppercase mb-1.5">
          {barber.first_name}
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-white/90">
              {services.length} service{services.length !== 1 ? "s" : ""}
            </span>
            {priceRange && (
              <>
                <span className="text-white/50">•</span>
                <span className="text-[13px] text-white/70">{priceRange}</span>
              </>
            )}
          </div>
          <span className="text-xs text-white border border-white/70 px-2 py-1 rounded-full">
            Available
          </span>
        </div>
      </div>
    </>
  );

  if (variant === "mobile") {
    return (
      <div className="w-[85%] mx-auto relative">
        <div className="relative rounded-[20px] overflow-visible ring-1 ring-white/50">
          <div className="relative rounded-[20px] overflow-hidden bg-black">
            {cardContent}
          </div>
          {/* Curved bottom border with glow effect */}
          <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2">
            <Image
              src="/assets/svg/line-bottom-border.svg"
              alt=""
              width={192}
              height={20}
              className="w-48 h-auto"
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="w-[380px] relative">
      <div className="relative rounded-[20px] overflow-visible ring-1 ring-white/50">
        <div className="relative rounded-[20px] overflow-hidden bg-black">
          {cardContent}
        </div>
        {/* Curved bottom border with glow effect */}
        <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2">
          <Image
            src="/assets/svg/line-bottom-border.svg"
            alt=""
            width={192}
            height={20}
            className="w-48 h-auto"
          />
        </div>
      </div>
    </div>
  );
}
