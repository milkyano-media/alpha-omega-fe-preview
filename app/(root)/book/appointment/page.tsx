"use client";

import { SimpleAppointment } from "@/components/booking-selector";
import { FreshaRedirectWrapper } from "@/components/fresha-redirect";

export default function AppointmentPage() {
  return (
    <FreshaRedirectWrapper>
      <SimpleAppointment />
    </FreshaRedirectWrapper>
  );
}
