"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  BookingService,
  TeamMember,
  Service,
} from "@/lib/booking-service";
import { BarberCard } from "./BarberCard";
import { ServiceItem } from "./ServiceItem";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface BarberWithServices {
  barber: TeamMember;
  services: Service[];
}

export function BookingSelector() {
  const router = useRouter();
  const [barberServices, setBarberServices] = useState<BarberWithServices[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBarber, setExpandedBarber] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch barbers and services in parallel
        const [barbers, services] = await Promise.all([
          BookingService.getTeamMembers(),
          BookingService.getAllServices(),
        ]);

        // Filter out owners and inactive barbers
        const activeBarbers = barbers.filter(
          (barber) => !barber.is_owner && barber.status === "ACTIVE",
        );

        // Join barbers with their services
        const barberServicesData: BarberWithServices[] = [];

        for (const barber of activeBarbers) {
          // Get services for this barber
          const barberServiceList = services.filter((service) =>
            service.teamMembers?.some(
              (tm) => tm.square_up_id === barber.square_up_id,
            ),
          );

          // Only include barbers that have services
          if (barberServiceList.length > 0) {
            barberServicesData.push({
              barber,
              services: barberServiceList,
            });
          }
        }

        // Sort alphabetically by first name
        barberServicesData.sort((a, b) =>
          a.barber.first_name.localeCompare(b.barber.first_name),
        );

        setBarberServices(barberServicesData);

        // Auto-expand if there's only one barber
        if (
          barberServicesData.length === 1 &&
          barberServicesData[0].barber.square_up_id
        ) {
          setExpandedBarber(barberServicesData[0].barber.square_up_id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load barbers and services. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBookNow = (service: Service, barber: TeamMember) => {
    // Clear any existing booking data
    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedService");
    localStorage.removeItem("selectedBarberId");
    localStorage.removeItem("selectedTimeSlot");
    localStorage.removeItem("autoSelectedTime");

    // Store the selected service and barber (use internal id for consistency with existing barbers page)
    localStorage.setItem("selectedServices", JSON.stringify([service]));
    localStorage.setItem("selectedService", JSON.stringify(service)); // For backward compatibility
    localStorage.setItem("selectedBarberId", barber.id.toString());
    localStorage.setItem("autoSelectedTime", "false"); // Manual selection, show time picker

    // Navigate to appointment page
    router.push("/book/appointment");
  };

  const toggleBarberServices = (barberId: string) => {
    setExpandedBarber(expandedBarber === barberId ? null : barberId);
  };

  const extractPriceRange = (services: Service[]): string => {
    const prices = services
      .map((service) => service.price_amount / 100)
      .filter((price) => price > 0);

    if (prices.length === 0) return "";

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}-$${maxPrice}`;
  };

  return (
    <section className="relative bg-[#010401] min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black px-4 py-2 md:px-6 md:py-3 flex justify-center md:justify-start border-b border-white/30 md:border-b-0">
        <Link href="/">
          <Image
            src="/logo/main.png"
            alt="Alpha Omega"
            width={120}
            height={30}
            className="w-24 md:w-32 h-auto opacity-90"
          />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-32 pb-8 md:pt-40 md:pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-6 min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-8rem)] md:pt-16">
            <h3 className="text-xl font-bold text-white">Loading barbers...</h3>
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-6 min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-8rem)] md:pt-16">
            <h3 className="text-xl font-bold text-red-400">{error}</h3>
            <Button
              onClick={() => window.location.reload()}
              className="bg-white text-black hover:bg-gray-100"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {barberServices.map((item) => (
              <div key={item.barber.square_up_id} className="relative">
                <div className="flex flex-col md:grid md:grid-cols-[380px_1fr] gap-6 md:gap-12">
                  {/* Barber Image Section */}
                  <div className="relative">
                    {/* Mobile Card */}
                    <div className="md:hidden">
                      <BarberCard
                        barber={item.barber}
                        services={item.services}
                        isExpanded={
                          expandedBarber === item.barber.square_up_id
                        }
                        variant="mobile"
                      />
                    </div>

                    {/* Desktop Card */}
                    <div className="hidden md:block">
                      <BarberCard
                        barber={item.barber}
                        services={item.services}
                        isExpanded={
                          expandedBarber === item.barber.square_up_id
                        }
                        variant="desktop"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col">
                    {/* Services Section */}
                    <div className="w-full">
                      {/* Desktop: Dropdown Button */}
                      <Button
                        onClick={() =>
                          toggleBarberServices(item.barber.square_up_id)
                        }
                        className="hidden md:flex w-full bg-black hover:bg-zinc-900 text-white justify-between h-14 md:h-16 py-4 md:py-5 border border-white/50 rounded-lg"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-lg md:text-xl font-semibold">
                            View Services
                          </span>
                          <span className="text-sm md:text-base text-gray-400">
                            {extractPriceRange(item.services)} AUD
                          </span>
                        </span>
                        {expandedBarber === item.barber.square_up_id ? (
                          <ChevronUp className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                        ) : (
                          <ChevronDown className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                        )}
                      </Button>

                      {/* Mobile: 2-Column Grid - Always Visible */}
                      <div className="md:hidden w-[85%] mx-auto grid grid-cols-2 gap-3 mt-4">
                        {item.services.map((service) => (
                          <ServiceItem
                            key={service.id}
                            service={service}
                            onBook={(s) => handleBookNow(s, item.barber)}
                            variant="mobile"
                          />
                        ))}
                      </div>

                      {/* Desktop: Expandable Service List */}
                      {expandedBarber === item.barber.square_up_id && (
                        <div className="hidden md:block">
                          {item.services.map((service) => (
                            <ServiceItem
                              key={service.id}
                              service={service}
                              onBook={(s) => handleBookNow(s, item.barber)}
                              variant="desktop"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {barberServices.length === 0 && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center gap-4 min-h-[calc(100vh-12rem)]">
                <h3 className="text-xl font-bold text-white">
                  No barbers available
                </h3>
                <p className="text-gray-400">
                  Please check back later or contact us for assistance.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
