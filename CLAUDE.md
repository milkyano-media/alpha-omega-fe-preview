# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alpha Omega is a barbershop booking web application built with Next.js 15 (App Router with Turbopack). It integrates with Square for payments and appointment management, and communicates with a separate Express.js backend API.

## Commands

```bash
# Development (uses Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Architecture

### Route Structure (App Router)

The app uses Next.js App Router with route groups:
- `app/(root)/` - Main application layout with Navbar, Footer, and VerificationRequired wrapper
- `app/(root)/(navigate)/` - Public pages (about, barbers, gallery, services, contacts, etc.)
- `app/(root)/book/` - Booking flow pages (services → barbers → appointment → thank-you)
- `app/(root)/admin/` - Admin page
- `app/api/` - API routes for Square integration (process-payment, create-square-booking)

### Key Services (`lib/`)

- **`api-client.ts`**: Axios wrapper with JWT auth interceptors, auto-redirect on 401, uses `NEXT_PUBLIC_API_URL` for backend
- **`booking-service.ts`**: Booking management - Square-first strategy where bookings are created directly in Square then synced to backend
- **`auth-service.ts`**: Authentication with email/password, Google OAuth, Apple OAuth
- **`auth-context.tsx`**: React context for auth state with automatic token validation every 5 minutes
- **`form-submission-service.ts`**: Flexible form submissions to Google Sheets with email notifications
- **`token-utils.ts`**: JWT decode and expiration checking

### Authentication Flow

1. JWT tokens stored in localStorage/sessionStorage AND cookies (for middleware access)
2. Middleware (`middleware.ts`) protects routes and checks verification status
3. Protected routes: `/my-bookings`, `/admin`, `/book/*`
4. Booking routes additionally require verified users (phone OTP verification)

### Booking & Payment Flow (Square-First Strategy)

1. User selects service → barber → date/time
2. Payment processed via Square Web Payments SDK (50% deposit)
3. Booking created directly in Square via `/api/create-square-booking`
4. Booking synced to backend (non-blocking - UI succeeds even if sync fails)
5. Uses idempotency keys to prevent duplicate bookings

### UI Components

- `components/ui/` - shadcn/ui components (Button, Card, Dialog, Form, etc.)
- `components/pages/appointment/` - Booking flow components (DateTimeSelector, BookingSummary, PaymentForm)
- `components/oauth/` - OAuth buttons for Google and Apple sign-in
- Uses Tailwind CSS v4 with tailwind-merge and class-variance-authority

### Environment Variables

Key variables needed (see `.env.example`):
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SQUARE_APPLICATION_ID` - Square app ID
- `NEXT_PUBLIC_SQUARE_LOCATION_ID` - Square location ID
- `SQUARE_SANDBOX_TOKEN` / `SQUARE_PRODUCTION_TOKEN` - Square access tokens
- `SQUARE_ENVIRONMENT` - "sandbox" or "production"
- `NEXT_PUBLIC_FORM_SPREADSHEET_URL` - Google Sheets for form submissions
- `NEXT_PUBLIC_FORM_EMAIL_RECEIVER` - Email for form notifications

### Type Declarations

Custom type declarations in `types/`:
- `google.d.ts` - Google OAuth types
- `square.d.ts` - Square SDK types

## Important Patterns

### API Communication
- Use `API` from `@/lib/api-client` for backend calls (auto-handles auth)
- Use native `fetch` for Square-related operations (payment processing, direct booking creation)

### Form Handling
- react-hook-form with zod validation
- Form submissions go through `FormSubmissionService` which handles Google Sheets integration

### Error Handling
- Backend API always returns 200 OK with errors in response body (per `BOOKING_FLOW.md`)
- Frontend should check `response.success` or `response.data` rather than HTTP status
