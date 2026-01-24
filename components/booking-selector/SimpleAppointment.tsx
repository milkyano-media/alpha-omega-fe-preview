"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Link from "next/link";
import Image from "next/image";
import { isValidPhoneNumber } from "react-phone-number-input";

import { Service, TimeSlot } from "@/lib/booking-service";
import { Button } from "@/components/ui/button";
import { BookingCalendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

dayjs.extend(utc);
dayjs.extend(timezone);

const formSchema = z.object({
  given_name: z.string().min(1, { message: "First name is required" }),
  family_name: z.string().min(1, { message: "Last name is required" }),
  email_address: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  phone_number: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  appointment_note: z.string().optional(),
});

interface TimeOfDay {
  title: string;
  appointments: { start_at: string; readable_time: string }[];
}

export function SimpleAppointment() {
  const router = useRouter();

  // Service data from localStorage
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  // const [barberId, setBarberId] = useState<string | null>(null);

  // Calendar states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [allAvailabilities, setAllAvailabilities] = useState<TimeSlot[]>([]);

  // Selected time
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);

  // Form & booking states
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"loading" | "succeeded" | "failed">(
    "loading"
  );
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      given_name: "",
      family_name: "",
      email_address: "",
      phone_number: "",
      appointment_note: "",
    },
  });

  // Load service data from localStorage
  useEffect(() => {
    const servicesData = localStorage.getItem("selectedServices");
    // const barberIdData = localStorage.getItem("selectedBarberId");

    if (!servicesData) {
      router.push("/book");
      return;
    }

    try {
      const services = JSON.parse(servicesData);
      setSelectedService(services[0] || null);
      // setBarberId(barberIdData);
    } catch {
      router.push("/book");
    }
  }, [router]);

  // Fetch availability via API route (no auth required)
  useEffect(() => {
    if (!selectedService) return;

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);

      try {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 60);

        const response = await fetch("/api/search-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_variation_id: selectedService.service_variation_id,
            start_at: today.toISOString(),
            end_at: endDate.toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch availability");
        }

        const data = await response.json();
        const availabilitiesByDate = data.data?.availabilities_by_date || {};

        // Flatten all availabilities
        const availabilities: TimeSlot[] = [];
        Object.values(availabilitiesByDate).forEach((slots: any) => {
          availabilities.push(...slots);
        });

        setAllAvailabilities(availabilities);

        // Extract available dates as strings (YYYY-MM-DD)
        const available: string[] = Object.keys(availabilitiesByDate).filter(
          (dateKey) => availabilitiesByDate[dateKey]?.length > 0
        );
        setAvailableDates(available);

        // Find and select first available date
        if (availabilities.length > 0) {
          const firstAvailable = new Date(availabilities[0].start_at);
          setSelectedDate(firstAvailable);
          updateTimesForDate(firstAvailable, availabilities);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to load available times. Please try again.");
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedService]);

  const updateTimesForDate = (date: Date, availabilities: TimeSlot[]) => {
    const dateKey = dayjs(date).tz("Australia/Melbourne").format("YYYY-MM-DD");
    const filtered = availabilities.filter((slot) => {
      const slotDate = dayjs(slot.start_at)
        .tz("Australia/Melbourne")
        .format("YYYY-MM-DD");
      return slotDate === dateKey;
    });
    setAvailableTimes(filtered);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedTime(null);
    updateTimesForDate(date, allAvailabilities);
  };

  const groupTimesByPeriod = (): TimeOfDay[] => {
    const periods: TimeOfDay[] = [
      { title: "Morning", appointments: [] },
      { title: "Afternoon", appointments: [] },
      { title: "Evening", appointments: [] },
    ];

    availableTimes.forEach((slot) => {
      const time = dayjs(slot.start_at).tz("Australia/Melbourne");
      const hour = time.hour();
      const readableTime = time.format("h:mm A");

      let periodIndex = 0;
      if (hour >= 12 && hour < 17) periodIndex = 1;
      else if (hour >= 17) periodIndex = 2;

      periods[periodIndex].appointments.push({
        start_at: slot.start_at,
        readable_time: readableTime,
      });
    });

    return periods;
  };

  const handleTimeSelect = (slot: { start_at: string }) => {
    const fullSlot = availableTimes.find((t) => t.start_at === slot.start_at);
    if (fullSlot) {
      setSelectedTime(fullSlot);
    }
  };

  const handleBooking = async (values: z.infer<typeof formSchema>) => {
    if (!selectedService || !selectedTime) {
      setError("Please select a service and time");
      return;
    }

    setIsLoading(true);
    setStatus("loading");
    setError(null);

    try {
      // Step 1: Create or find customer
      const customerResponse = await fetch("/api/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          given_name: values.given_name,
          family_name: values.family_name,
          email_address: values.email_address,
          phone_number: values.phone_number,
        }),
      });

      if (!customerResponse.ok) {
        throw new Error("Failed to create customer");
      }

      const customerData = await customerResponse.json();
      const customerId = customerData.customer?.id;

      if (!customerId) {
        throw new Error("Customer ID not returned");
      }

      // Step 2: Create booking
      const bookingResponse = await fetch("/api/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          startAt: selectedTime.start_at,
          locationId: selectedTime.location_id,
          appointmentSegments: selectedTime.appointment_segments,
          customerNote: values.appointment_note || "",
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const bookingData = await bookingResponse.json();

      // Store booking info for thank you page
      localStorage.setItem(
        "completedBooking",
        JSON.stringify({
          bookingId: bookingData.booking?.id,
          service: selectedService,
          startAt: selectedTime.start_at,
          customerName: `${values.given_name} ${values.family_name}`,
        })
      );

      setStatus("succeeded");

      setTimeout(() => {
        setIsLoading(false);
        router.push("/book/thank-you");
      }, 1500);
    } catch (err: any) {
      console.error("Booking error:", err);
      setStatus("failed");
      setError(err.message || "Failed to create booking");
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  const formatPrice = (amount: number) => `$${(amount / 100).toFixed(2)}`;

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-[#010401] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const timePeriods = groupTimesByPeriod();

  return (
    <section className="relative bg-[#010401] min-h-screen text-white">
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

      {/* Loading Dialog */}
      <Dialog open={isLoading} onOpenChange={setIsLoading}>
        <DialogContent className="bg-[#010401] border border-white/50">
          <DialogHeader>
            <DialogTitle className="text-center text-white">
              {status === "loading"
                ? "Creating Booking..."
                : status === "succeeded"
                  ? "Booking Confirmed!"
                  : "Booking Failed"}
            </DialogTitle>
            <DialogDescription className="flex justify-center py-8">
              {status === "loading" ? (
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : status === "succeeded" ? (
                <div className="p-2 rounded-full border-2 border-white">
                  <Check className="h-16 w-16 text-white" />
                </div>
              ) : (
                <div className="p-2 rounded-full border-2 border-red-500">
                  <X className="h-16 w-16 text-red-500" />
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto px-4 pt-32 pb-8 md:pt-40 md:pb-12">
        {isLoadingAvailability ? (
          <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
            <h3 className="text-xl font-bold">Loading availability...</h3>
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Calendar & Times */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold">Select Date & Time</h2>

              {/* Calendar */}
              <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/30">
                <BookingCalendar
                  selectedDate={selectedDate}
                  onChange={handleDateSelect}
                  availableDates={availableDates}
                />
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {dayjs(selectedDate).format("dddd, MMMM D")}
                  </h3>

                  {availableTimes.length === 0 ? (
                    <p className="text-gray-400">
                      No times available for this date
                    </p>
                  ) : (
                    timePeriods.map((period) =>
                      period.appointments.length > 0 ? (
                        <div key={period.title} className="space-y-3">
                          <h4 className="text-sm text-gray-400">
                            {period.title}
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {period.appointments.map((apt) => (
                              <Button
                                key={apt.start_at}
                                onClick={() => handleTimeSelect(apt)}
                                className={`w-fit text-xs h-fit py-2 px-4 rounded font-bold transition-all ${
                                  selectedTime?.start_at === apt.start_at
                                    ? "bg-white text-black ring-2 ring-white ring-offset-2 ring-offset-[#010401]"
                                    : "bg-white/80 text-black hover:bg-white"
                                }`}
                              >
                                {apt.readable_time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )
                  )}
                </div>
              )}
            </div>

            {/* Right: Summary & Contact Form */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/30">
                <h3 className="font-semibold mb-4">Appointment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{selectedService.name}</span>
                    <span>{formatPrice(selectedService.price_amount)}</span>
                  </div>
                  {selectedTime && (
                    <div className="pt-2 border-t border-white/20">
                      <p className="text-white">
                        {dayjs(selectedTime.start_at)
                          .tz("Australia/Melbourne")
                          .format("dddd, MMM D")}
                      </p>
                      <p className="text-white">
                        {dayjs(selectedTime.start_at)
                          .tz("Australia/Melbourne")
                          .format("h:mm A")}
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/20 flex justify-between font-semibold">
                    <span>Due at appointment</span>
                    <span>{formatPrice(selectedService.price_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              {selectedTime && (
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/30">
                  <h3 className="font-semibold mb-4">Contact Information</h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleBooking)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="given_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="First name"
                                  className="bg-transparent border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="family_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Last name"
                                  className="bg-transparent border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Email address"
                                type="email"
                                className="bg-transparent border-gray-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <PhoneInput
                                defaultCountry="AU"
                                placeholder="Phone number"
                                className="bg-transparent"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="appointment_note"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Notes (optional)"
                                className="bg-transparent border-gray-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Policy checkbox */}
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="policy"
                          checked={agreedToPolicy}
                          onCheckedChange={(checked) =>
                            setAgreedToPolicy(checked as boolean)
                          }
                          className="mt-1 border-gray-600 data-[state=checked]:bg-white data-[state=checked]:border-white"
                        />
                        <label htmlFor="policy" className="text-xs text-gray-400">
                          I agree to the cancellation policy. Please cancel or
                          reschedule at least 24 hours before your appointment.
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={!agreedToPolicy || isLoading}
                        className="w-full bg-white hover:bg-gray-100 text-black py-6"
                      >
                        Book Appointment
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
