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
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";

    // Get team members from Square
    const response = await square.teamApi.searchTeamMembers({
      query: {
        filter: {
          locationIds: [locationId],
          status: "ACTIVE",
        },
      },
    });

    const teamMembers = response.result.teamMembers || [];

    // Transform to match expected format
    const formattedMembers = teamMembers.map((member, index) => ({
      id: index + 1,
      square_up_id: member.id || "",
      first_name: member.givenName || "",
      last_name: member.familyName || "",
      status: member.status || "ACTIVE",
      email_address: member.emailAddress || "",
      is_owner: member.isOwner || false,
    }));

    return NextResponse.json({
      success: true,
      data: formattedMembers,
    });
  } catch (error: any) {
    console.error("Team members fetch error:", error);

    let errorMessage = "Failed to fetch team members";
    if (error?.errors && Array.isArray(error.errors)) {
      errorMessage = error.errors[0]?.detail || errorMessage;
    }

    return NextResponse.json(
      { success: false, message: errorMessage, data: [] },
      { status: 500 }
    );
  }
}
