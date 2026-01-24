import { NextRequest, NextResponse } from "next/server";
import { Client, Environment } from "square";
import { randomUUID } from "crypto";

const square = new Client({
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      startAt,
      locationId,
      appointmentSegments,
      customerNote,
    } = body;

    if (!customerId || !startAt || !locationId || !appointmentSegments) {
      return NextResponse.json(
        { success: false, message: "Missing required booking information" },
        { status: 400 }
      );
    }

    // Use location from env if not provided
    const finalLocationId =
      locationId || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    // Prepare appointment segments - convert duration to proper format
    const segments = appointmentSegments.map((segment: any) => ({
      serviceVariationId: segment.service_variation_id,
      teamMemberId: segment.team_member_id,
      durationMinutes: segment.duration_minutes || 30,
      serviceVariationVersion: segment.service_variation_version
        ? BigInt(segment.service_variation_version)
        : undefined,
    }));

    const bookingRequest = {
      idempotencyKey: randomUUID(),
      booking: {
        startAt,
        locationId: finalLocationId,
        customerId,
        customerNote: customerNote || "",
        appointmentSegments: segments,
      },
    };

    console.log(
      "Creating booking:",
      JSON.stringify(bookingRequest, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    const response = await square.bookingsApi.createBooking(bookingRequest);

    if (!response.result.booking) {
      throw new Error("Booking creation returned no booking");
    }

    const booking = response.result.booking;

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        startAt: booking.startAt,
        locationId: booking.locationId,
        customerId: booking.customerId,
        createdAt: booking.createdAt,
        appointmentSegments: booking.appointmentSegments,
      },
    });
  } catch (error: any) {
    console.error("Booking creation error:", error);

    let errorMessage = "Failed to create booking";
    if (error?.errors && Array.isArray(error.errors)) {
      errorMessage = error.errors[0]?.detail || errorMessage;
      error.errors.forEach((err: any, index: number) => {
        console.error(`Square error ${index + 1}:`, err);
      });
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
