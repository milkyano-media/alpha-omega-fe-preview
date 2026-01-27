"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useBookingCart } from "@/lib/booking-cart-context";

function formatPrice(priceAmount: number): string {
  const dollars = priceAmount / 100;
  return `$${dollars.toFixed(2)}`;
}

export function FloatingBookButton() {
  const router = useRouter();
  const { items, selectedBarber, getTotalPrice, getTotalDuration, clearCart } =
    useBookingCart();

  const handleProceed = () => {
    if (items.length === 0 || !selectedBarber) return;

    // Clear any existing booking data
    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedService");
    localStorage.removeItem("selectedBarberId");
    localStorage.removeItem("selectedTimeSlot");
    localStorage.removeItem("autoSelectedTime");

    // Transfer cart data to format expected by SimpleAppointment
    const services = items.map((item) => item.service);
    localStorage.setItem("selectedServices", JSON.stringify(services));
    localStorage.setItem("selectedService", JSON.stringify(services[0])); // backward compat
    localStorage.setItem("selectedBarberId", selectedBarber.id.toString());
    localStorage.setItem("autoSelectedTime", "false"); // Manual selection, show time picker

    // Clear cart after transfer
    clearCart();

    // Navigate to appointment page
    router.push("/book/appointment");
  };

  const totalPrice = getTotalPrice();
  const totalDuration = getTotalDuration();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pb-safe"
        >
          <button
            onClick={handleProceed}
            className="w-full max-w-md mx-auto flex items-center justify-between gap-4 px-6 py-4 bg-white text-black rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {items.length} {items.length === 1 ? "service" : "services"}
                </p>
                <p className="text-xs text-gray-600">{totalDuration} min</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
              <span className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg">
                CONTINUE
              </span>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
