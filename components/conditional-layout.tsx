"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { VerificationRequired } from "@/components/verification-required";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Hide navbar/footer for booking pages - they have their own header
  const isBookingPage = pathname.startsWith("/book");

  if (isBookingPage) {
    return <VerificationRequired>{children}</VerificationRequired>;
  }

  return (
    <>
      <Navbar />
      <div className="pt-8">
        <VerificationRequired>{children}</VerificationRequired>
      </div>
      <Footer />
    </>
  );
}
