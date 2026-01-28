"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  BookingService,
  TeamMember,
  Service,
} from "@/lib/booking-service";
import { categorizeServices } from "@/lib/service-utils";
import { useBookingCart } from "@/lib/booking-cart-context";
import { BarberCard } from "./BarberCard";
import { ServiceItem } from "./ServiceItem";
import { FloatingBookButton } from "./FloatingBookButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";

interface BarberWithServices {
  barber: TeamMember;
  services: Service[];
}

export function BookingSelector() {
  const { addItem, removeItem, isServiceSelected, selectedBarber, clearCart, items } =
    useBookingCart();
  const [barberServices, setBarberServices] = useState<BarberWithServices[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBarber, setExpandedBarber] = useState<string | null>(null);

  // Dialog state for barber switch warning
  const [switchBarberDialog, setSwitchBarberDialog] = useState<{
    open: boolean;
    pendingService: Service | null;
    pendingBarber: TeamMember | null;
  }>({
    open: false,
    pendingService: null,
    pendingBarber: null,
  });

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

  const handleServiceClick = (service: Service, barber: TeamMember) => {
    // If service is already selected, remove it (toggle behavior)
    if (isServiceSelected(service.id)) {
      removeItem(service.id);
      return;
    }

    // Try to add item to cart
    const success = addItem(service, barber);

    // If failed (different barber), show confirmation dialog
    if (!success) {
      setSwitchBarberDialog({
        open: true,
        pendingService: service,
        pendingBarber: barber,
      });
    }
  };

  const handleConfirmSwitchBarber = () => {
    const { pendingService, pendingBarber } = switchBarberDialog;
    if (pendingService && pendingBarber) {
      clearCart();
      addItem(pendingService, pendingBarber);
    }
    setSwitchBarberDialog({
      open: false,
      pendingService: null,
      pendingBarber: null,
    });
  };

  const handleCancelSwitchBarber = () => {
    setSwitchBarberDialog({
      open: false,
      pendingService: null,
      pendingBarber: null,
    });
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

      <div className={`max-w-5xl mx-auto px-4 pt-32 md:pt-40 md:pb-12 ${items.length > 0 ? 'pb-32' : 'pb-8'}`}>
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

                      {/* Mobile: Grouped Services with Separators */}
                      <div className="md:hidden w-[85%] mx-auto mt-4 space-y-4">
                        {categorizeServices(item.services).map((group, groupIndex) => (
                          <div key={group.category}>
                            {/* Category Header with Lines */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-1 h-px bg-white/30" />
                              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                                {group.category}
                              </span>
                              <div className="flex-1 h-px bg-white/30" />
                            </div>

                            {/* Services Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {group.services.map((service) => (
                                <ServiceItem
                                  key={service.id}
                                  service={service}
                                  onBook={(s) => handleServiceClick(s, item.barber)}
                                  variant="mobile"
                                  isSelected={isServiceSelected(service.id)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop: Expandable Service List */}
                      {expandedBarber === item.barber.square_up_id && (
                        <div className="hidden md:block">
                          {item.services.map((service) => (
                            <ServiceItem
                              key={service.id}
                              service={service}
                              onBook={(s) => handleServiceClick(s, item.barber)}
                              variant="desktop"
                              isSelected={isServiceSelected(service.id)}
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

      {/* Floating Book Button */}
      <FloatingBookButton />

      {/* Switch Barber Confirmation Dialog */}
      <Dialog
        open={switchBarberDialog.open}
        onOpenChange={(open) => {
          if (!open) handleCancelSwitchBarber();
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle>Switch Barber?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You already have services selected from{" "}
              <span className="text-white font-medium">
                {selectedBarber?.first_name}
              </span>
              . Selecting a service from{" "}
              <span className="text-white font-medium">
                {switchBarberDialog.pendingBarber?.first_name}
              </span>{" "}
              will clear your current selection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelSwitchBarber}
              className="bg-transparent border-zinc-600 text-white hover:bg-zinc-800"
            >
              Keep Current
            </Button>
            <Button
              onClick={handleConfirmSwitchBarber}
              className="bg-white text-black hover:bg-gray-200"
            >
              Switch Barber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
