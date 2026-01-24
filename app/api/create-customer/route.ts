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
    const { given_name, family_name, email_address, phone_number } = body;

    if (!given_name || !family_name || !email_address || !phone_number) {
      return NextResponse.json(
        { success: false, message: "Missing required customer information" },
        { status: 400 }
      );
    }

    // First, try to find existing customer by email or phone
    try {
      const searchResponse = await square.customersApi.searchCustomers({
        query: {
          filter: {
            emailAddress: {
              exact: email_address,
            },
          },
        },
      });

      if (
        searchResponse.result.customers &&
        searchResponse.result.customers.length > 0
      ) {
        // Return existing customer
        const existingCustomer = searchResponse.result.customers[0];
        return NextResponse.json({
          success: true,
          customer: {
            id: existingCustomer.id,
            givenName: existingCustomer.givenName,
            familyName: existingCustomer.familyName,
            emailAddress: existingCustomer.emailAddress,
            phoneNumber: existingCustomer.phoneNumber,
          },
          isNewCustomer: false,
        });
      }
    } catch (searchError) {
      console.log("Customer search failed, will create new:", searchError);
    }

    // Create new customer
    const createResponse = await square.customersApi.createCustomer({
      idempotencyKey: randomUUID(),
      givenName: given_name,
      familyName: family_name,
      emailAddress: email_address,
      phoneNumber: phone_number,
    });

    if (!createResponse.result.customer) {
      throw new Error("Failed to create customer");
    }

    const customer = createResponse.result.customer;

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        givenName: customer.givenName,
        familyName: customer.familyName,
        emailAddress: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
      },
      isNewCustomer: true,
    });
  } catch (error: any) {
    console.error("Customer creation error:", error);

    let errorMessage = "Failed to create customer";
    if (error?.errors && Array.isArray(error.errors)) {
      errorMessage = error.errors[0]?.detail || errorMessage;
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
