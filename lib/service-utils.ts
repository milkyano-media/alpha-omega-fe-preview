// lib/service-utils.ts
import { Service, TeamMember } from './booking-service';

/**
 * Extended TeamMember interface with junction table data
 */
export interface TeamMemberWithJunction extends TeamMember {
  ServiceTeamMember?: {
    price_amount: number | null;
    is_available: boolean;
  };
}

/**
 * Service with barber-specific pricing from junction table
 */
export interface ServiceWithBarberPrice extends Service {
  barber_price_amount?: number | null; // Override price for this barber
}

/**
 * Barber with their available services
 */
export interface BarberWithServices {
  barber: TeamMember;
  services: ServiceWithBarberPrice[];
}

/**
 * Transform flat services list (services[].teamMembers[]) into
 * barber-grouped structure (barbers[].services[])
 *
 * This enables UI where user selects barber first, then sees only
 * that barber's services with barber-specific pricing.
 */
export function groupServicesByBarber(services: Service[]): BarberWithServices[] {
  // Map to collect services per barber
  const barberMap = new Map<number, BarberWithServices>();

  for (const service of services) {
    const teamMembers = (service.teamMembers || []) as TeamMemberWithJunction[];

    for (const teamMember of teamMembers) {
      // Skip owners (they shouldn't be selectable as barbers)
      if (teamMember.is_owner) continue;

      // Check if barber offers this service (junction table is_available)
      const junctionData = teamMember.ServiceTeamMember;
      if (junctionData && junctionData.is_available === false) continue;

      // Get or create barber entry
      if (!barberMap.has(teamMember.id)) {
        // Create clean TeamMember without junction data for the barber object
        const cleanBarber: TeamMember = {
          id: teamMember.id,
          square_up_id: teamMember.square_up_id,
          first_name: teamMember.first_name,
          last_name: teamMember.last_name,
          status: teamMember.status,
          email_address: teamMember.email_address,
          is_owner: teamMember.is_owner,
        };

        barberMap.set(teamMember.id, {
          barber: cleanBarber,
          services: [],
        });
      }

      // Add service with barber-specific price
      const barberEntry = barberMap.get(teamMember.id)!;
      const serviceWithPrice: ServiceWithBarberPrice = {
        ...service,
        // Use junction table price if available, otherwise use service default price
        barber_price_amount: junctionData?.price_amount ?? null,
        // Remove teamMembers from the service to avoid circular references
        teamMembers: undefined,
      };

      barberEntry.services.push(serviceWithPrice);
    }
  }

  // Convert map to array and sort by barber name
  return Array.from(barberMap.values())
    .filter(entry => entry.services.length > 0) // Only barbers with services
    .sort((a, b) => {
      const nameA = `${a.barber.first_name} ${a.barber.last_name}`.toLowerCase();
      const nameB = `${b.barber.first_name} ${b.barber.last_name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
}

/**
 * Get the effective price for a service (barber-specific or default)
 */
export function getServicePrice(service: ServiceWithBarberPrice): number {
  return service.barber_price_amount ?? service.price_amount;
}

/**
 * Format price for display (cents to dollars)
 */
export function formatPrice(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

/**
 * Format duration for display
 * Handles both milliseconds (>10000) and minutes formats
 */
export function formatDuration(duration: number): string {
  const minutes = duration > 10000 ? Math.round(duration / 60000) : duration;
  return `${minutes} min`;
}

/**
 * Calculate total price for selected services
 */
export function calculateTotalPrice(services: ServiceWithBarberPrice[]): number {
  return services.reduce((total, service) => total + getServicePrice(service), 0);
}

/**
 * Calculate total duration for selected services (in minutes)
 */
export function calculateTotalDuration(services: ServiceWithBarberPrice[]): number {
  return services.reduce((total, service) => {
    const duration = service.duration > 10000
      ? Math.round(service.duration / 60000)
      : service.duration;
    return total + duration;
  }, 0);
}

/**
 * Service category for grouping
 */
export type ServiceCategory = 'Hair' | 'Beard' | 'Eyebrow' | 'Other';

/**
 * Grouped services by category
 */
export interface GroupedServices {
  category: ServiceCategory;
  services: Service[];
}

/**
 * Determine the category of a service based on its name
 * Priority: Hair > Beard > Eyebrow > Other
 * "Haircut & Beard" goes to Hair because it contains "Haircut"
 */
export function getServiceCategory(serviceName: string): ServiceCategory {
  const name = serviceName.toLowerCase();

  // Hair category: contains "hair", "haircut", or specific hair services
  const hairKeywords = ['hair', 'haircut', 'scissor cut', 'restyling', 'buzz cut'];
  if (hairKeywords.some(keyword => name.includes(keyword))) {
    return 'Hair';
  }

  // Beard category: contains "beard" or specific beard services
  const beardKeywords = ['beard', 'clean shave'];
  if (beardKeywords.some(keyword => name.includes(keyword))) {
    return 'Beard';
  }

  // Eyebrow category: contains "eyebrow" or "brow"
  if (name.includes('eyebrow') || name.includes('brow')) {
    return 'Eyebrow';
  }

  return 'Other';
}

/**
 * Group services by category (Hair, Beard, Eyebrow, Other)
 * Returns array in display order: Hair → Beard → Eyebrow → Other
 */
export function categorizeServices<T extends { name: string }>(services: T[]): { category: ServiceCategory; services: T[] }[] {
  const categoryOrder: ServiceCategory[] = ['Hair', 'Beard', 'Eyebrow', 'Other'];

  // Group services by category
  const grouped = new Map<ServiceCategory, T[]>();
  for (const category of categoryOrder) {
    grouped.set(category, []);
  }

  for (const service of services) {
    const category = getServiceCategory(service.name);
    grouped.get(category)!.push(service);
  }

  // Return only non-empty categories in order
  return categoryOrder
    .filter(category => grouped.get(category)!.length > 0)
    .map(category => ({
      category,
      services: grouped.get(category)!,
    }));
}
