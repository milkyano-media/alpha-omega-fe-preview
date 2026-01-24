"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CompletedBooking {
  bookingId?: string;
  service?: {
    name: string;
    price_amount: number;
  };
  startAt?: string;
  customerName?: string;
}

export default function ThankYou() {
  const router = useRouter();
  const [booking, setBooking] = useState<CompletedBooking | null>(null);

  useEffect(() => {
    // Get the booking details from localStorage
    const completedBookingStr = localStorage.getItem("completedBooking");
    if (completedBookingStr) {
      try {
        const completedBooking = JSON.parse(
          completedBookingStr
        ) as CompletedBooking;
        setBooking(completedBooking);
      } catch (err) {
        console.error("Error parsing booking details:", err);
      }
    }

    // Clear the booking details after loading
    return () => {
      localStorage.removeItem("completedBooking");
      localStorage.removeItem("selectedServices");
      localStorage.removeItem("selectedService");
      localStorage.removeItem("selectedBarberId");
    };
  }, []);

  const formatPrice = (amount: number) => `$${(amount / 100).toFixed(2)}`;

  return (
    <section className="relative bg-[#010401] min-h-screen text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black px-6 py-4 flex justify-center md:justify-start border-b border-[#1CFF21] md:border-b-0">
        <Link href="/">
          <Image
            src="/logo/main.png"
            alt="Alpha Omega"
            width={192}
            height={48}
            className="w-48 md:w-[12rem] h-auto opacity-90"
          />
        </Link>
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <div className="w-full max-w-md bg-[#0a0a0a] rounded-xl border border-[#1CFF21]/30 p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-[#036901]/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#1CFF21]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#1CFF21]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-center">
            Booking Confirmed!
          </h1>

          <p className="text-lg mb-6 text-center text-gray-300">
            Thank you for choosing Alpha Omega
            {booking?.customerName ? `, ${booking.customerName.split(" ")[0]}` : ""}
            . Your appointment has been booked!
          </p>

          {booking && (
            <div className="mb-6 bg-black/50 p-4 rounded-lg border border-[#1CFF21]/20">
              <h2 className="font-bold text-xl mb-4 text-center text-[#1CFF21]">
                Booking Details
              </h2>

              <div className="space-y-3 text-sm">
                {booking.service && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service:</span>
                    <span className="font-medium">{booking.service.name}</span>
                  </div>
                )}

                {booking.startAt && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="font-medium">
                        {dayjs(booking.startAt)
                          .tz("Australia/Melbourne")
                          .format("dddd, MMMM D, YYYY")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="font-medium">
                        {dayjs(booking.startAt)
                          .tz("Australia/Melbourne")
                          .format("h:mm A")}
                      </span>
                    </div>
                  </>
                )}

                {booking.service && (
                  <div className="flex justify-between pt-2 border-t border-[#1CFF21]/20">
                    <span className="text-gray-400">Amount Due:</span>
                    <span className="font-medium text-[#1CFF21]">
                      {formatPrice(booking.service.price_amount)} AUD
                    </span>
                  </div>
                )}

                {booking.bookingId && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Booking ID:</span>
                    <span className="text-gray-500 font-mono">
                      {booking.bookingId.substring(0, 12)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 text-center">
              Our Location
            </h3>
            <div className="rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="200"
                frameBorder={0}
                scrolling="no"
                src="https://maps.google.com/maps?width=100%25&amp;height=200&amp;hl=en&amp;q=104%20Greville%20street,%20Prahran,%20+(Alpha%20Omega%20Mens%20Grooming)&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
              />
            </div>
            <p className="text-sm text-center mt-2 text-gray-400">
              104 Greville St, Prahran VIC 3181
            </p>
          </div>

          <p className="mb-8 text-gray-400 text-sm text-center">
            You will receive a confirmation email shortly. Please arrive 10
            minutes before your scheduled time.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/book")}
              variant="outline"
              className="w-full border-[#1CFF21] text-[#1CFF21] hover:bg-[#1CFF21]/10"
            >
              Book Another Appointment
            </Button>

            <Button
              onClick={() => router.push("/")}
              className="w-full bg-[#036901] hover:bg-[#048801] text-white"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
}
