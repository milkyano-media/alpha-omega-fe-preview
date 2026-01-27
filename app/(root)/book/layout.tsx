"use client";

import { BookingCartProvider } from "@/lib/booking-cart-context";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <BookingCartProvider>{children}</BookingCartProvider>;
}
