import { NextRequest, NextResponse } from "next/server";
import { Client, Environment } from "square";

const square = new Client({
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN || "",
});

// Square API has a maximum of 32 days per availability search
const MAX_DAYS_PER_REQUEST = 31;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service_variation_id, start_at, end_at } = body;

    if (!service_variation_id || !start_at || !end_at) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);

    // Calculate total days requested
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Group availabilities by date (will be populated from all batches)
    const availabilitiesByDate: Record<string, any[]> = {};

    // Split into batches of MAX_DAYS_PER_REQUEST days if needed
    if (totalDays > MAX_DAYS_PER_REQUEST) {
      let currentStart = new Date(startDate);

      while (currentStart < endDate) {
        const currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + MAX_DAYS_PER_REQUEST);

        // Don't go past the original end date
        const batchEnd = currentEnd > endDate ? endDate : currentEnd;

        // Fetch this batch
        const batchResult = await fetchAvailabilityBatch(
          service_variation_id,
          currentStart.toISOString(),
          batchEnd.toISOString(),
          locationId
        );

        // Merge results
        Object.entries(batchResult).forEach(([dateKey, slots]) => {
          if (!availabilitiesByDate[dateKey]) {
            availabilitiesByDate[dateKey] = [];
          }
          availabilitiesByDate[dateKey].push(...slots);
        });

        // Move to next batch
        currentStart = new Date(batchEnd);
      }
    } else {
      // Single request (within 32 day limit)
      const result = await fetchAvailabilityBatch(
        service_variation_id,
        start_at,
        end_at,
        locationId
      );
      Object.assign(availabilitiesByDate, result);
    }

    return NextResponse.json({
      success: true,
      data: {
        availabilities_by_date: availabilitiesByDate,
      },
    });
  } catch (error: any) {
    console.error("Availability search error:", error);

    let errorMessage = "Failed to search availability";
    if (error?.errors && Array.isArray(error.errors)) {
      errorMessage = error.errors[0]?.detail || errorMessage;
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Fetch availability for a single batch (max 32 days)
 */
async function fetchAvailabilityBatch(
  serviceVariationId: string,
  startAt: string,
  endAt: string,
  locationId: string
): Promise<Record<string, any[]>> {
  const response = await square.bookingsApi.searchAvailability({
    query: {
      filter: {
        startAtRange: {
          startAt: startAt,
          endAt: endAt,
        },
        locationId,
        segmentFilters: [
          {
            serviceVariationId: serviceVariationId,
          },
        ],
      },
    },
  });

  const availabilitiesByDate: Record<string, any[]> = {};

  if (response.result.availabilities) {
    response.result.availabilities.forEach((availability) => {
      if (availability.startAt) {
        const dateKey = availability.startAt.split("T")[0];
        if (!availabilitiesByDate[dateKey]) {
          availabilitiesByDate[dateKey] = [];
        }
        availabilitiesByDate[dateKey].push({
          start_at: availability.startAt,
          location_id: availability.locationId,
          appointment_segments: availability.appointmentSegments?.map(
            (segment) => ({
              duration_minutes: segment.durationMinutes,
              team_member_id: segment.teamMemberId,
              service_variation_id: segment.serviceVariationId,
              service_variation_version: segment.serviceVariationVersion?.toString(),
            })
          ),
        });
      }
    });
  }

  return availabilitiesByDate;
}
