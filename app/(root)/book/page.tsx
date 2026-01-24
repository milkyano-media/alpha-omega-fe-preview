"use client";

import { BookingSelector } from "@/components/booking-selector";
import { FreshaRedirectWrapper } from "@/components/fresha-redirect";

export default function BookPage() {
  return (
    <FreshaRedirectWrapper>
      <BookingSelector />
    </FreshaRedirectWrapper>
  );
}
