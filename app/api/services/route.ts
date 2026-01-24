import { NextResponse } from "next/server";
import { Client, Environment } from "square";

const square = new Client({
  environment:
    process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN || "",
});

export async function GET() {
  try {
    // Get catalog items (services) from Square
    const response = await square.catalogApi.listCatalog(
      undefined,
      "ITEM"
    );

    const items = response.result.objects || [];

    // Filter to only include items that are services (have service variations)
    // and transform to expected format
    const services: any[] = [];
    let serviceId = 1;

    for (const item of items) {
      if (item.type === "ITEM" && item.itemData) {
        const itemData = item.itemData;

        // Check if this is a service (has item variations with service data)
        if (itemData.variations) {
          for (const variation of itemData.variations) {
            if (variation.itemVariationData) {
              const varData = variation.itemVariationData;

              // Get team member IDs for this service from booking profile
              // let teamMemberIds: string[] = [];
              // try {
              //   const bookingProfile =
              //     await square.bookingsApi.retrieveTeamMemberBookingProfile(
              //       variation.id || ""
              //     );
              //   // This might not work directly, we'll handle team members separately
              // } catch {
              //   // Ignore - we'll get team members from availability search
              // }

              services.push({
                id: serviceId++,
                name: itemData.name || "",
                description: itemData.description || "",
                price_amount: Number(varData.priceMoney?.amount || 0),
                price_currency: varData.priceMoney?.currency || "AUD",
                duration: varData.serviceDuration
                  ? Number(varData.serviceDuration) / 60000 // Convert ms to minutes
                  : 30,
                service_variation_id: variation.id || "",
                square_catalog_id: item.id || "",
                variation_name: varData.name || "",
                is_available: true,
                teamMembers: [], // Will be populated by matching with team member services
              });
            }
          }
        }
      }
    }

    // Now get team members and their assignable services
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";

    try {
      const teamResponse = await square.teamApi.searchTeamMembers({
        query: {
          filter: {
            locationIds: [locationId],
            status: "ACTIVE",
          },
        },
      });

      const teamMembers = teamResponse.result.teamMembers || [];

      // For each team member, get their booking profile to see which services they offer
      for (const member of teamMembers) {
        if (member.id) {
          try {
            // const profileResponse =
            //   await square.bookingsApi.retrieveTeamMemberBookingProfile(
            //     member.id
            //   );
            // const profile = profileResponse.result.teamMemberBookingProfile;

            // if (profile?.teamMemberServiceIds) {
            //   // Add this team member to the services they can perform
            //   for (const serviceVarId of profile.teamMemberServiceIds) {
            //     const service = services.find(
            //       (s) => s.service_variation_id === serviceVarId
            //     );
            //     if (service) {
            //       service.teamMembers.push({
            //         id: teamMembers.indexOf(member) + 1,
            //         square_up_id: member.id,
            //         first_name: member.givenName || "",
            //         last_name: member.familyName || "",
            //         status: member.status || "ACTIVE",
            //       });
            //     }
            //   }
            // }
          } catch (profileError) {
            // Team member might not have a booking profile, skip
            console.log(
              `No booking profile for team member ${member.id}:`,
              profileError
            );
          }
        }
      }
    } catch (teamError) {
      console.error("Error fetching team members for services:", teamError);
    }

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    console.error("Services fetch error:", error);

    let errorMessage = "Failed to fetch services";
    if (error?.errors && Array.isArray(error.errors)) {
      errorMessage = error.errors[0]?.detail || errorMessage;
    }

    return NextResponse.json(
      { success: false, message: errorMessage, data: [] },
      { status: 500 }
    );
  }
}
