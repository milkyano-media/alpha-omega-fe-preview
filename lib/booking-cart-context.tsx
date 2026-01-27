"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Service, TeamMember } from "./booking-service";

export interface CartItem {
  service: Service;
  barber: TeamMember;
}

interface BookingCartContextType {
  items: CartItem[];
  selectedBarber: TeamMember | null;
  addItem: (service: Service, barber: TeamMember) => boolean;
  removeItem: (serviceId: number) => void;
  clearCart: () => void;
  isServiceSelected: (serviceId: number) => boolean;
  getTotalPrice: () => number;
  getTotalDuration: () => number;
}

const BookingCartContext = createContext<BookingCartContextType | null>(null);

const CART_STORAGE_KEY = "booking_cart";

export function BookingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<TeamMember | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.items && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setSelectedBarber(parsed.selectedBarber || null);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, selectedBarber })
      );
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [items, selectedBarber, isHydrated]);

  const addItem = useCallback(
    (service: Service, barber: TeamMember): boolean => {
      // If cart has items and barber is different, return false
      if (selectedBarber && selectedBarber.square_up_id !== barber.square_up_id) {
        return false;
      }

      // Check if service already in cart
      const exists = items.some((item) => item.service.id === service.id);
      if (exists) {
        return true; // Already added, consider it a success
      }

      setItems((prev) => [...prev, { service, barber }]);
      setSelectedBarber(barber);
      return true;
    },
    [items, selectedBarber]
  );

  const removeItem = useCallback((serviceId: number) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.service.id !== serviceId);
      // If cart is now empty, reset barber
      if (newItems.length === 0) {
        setSelectedBarber(null);
      }
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedBarber(null);
  }, []);

  const isServiceSelected = useCallback(
    (serviceId: number): boolean => {
      return items.some((item) => item.service.id === serviceId);
    },
    [items]
  );

  const getTotalPrice = useCallback((): number => {
    return items.reduce((total, item) => total + item.service.price_amount, 0);
  }, [items]);

  const getTotalDuration = useCallback((): number => {
    return items.reduce((total, item) => {
      // Duration might be in milliseconds (>10000) or minutes
      const duration = item.service.duration;
      const minutes = duration > 10000 ? Math.round(duration / 60000) : duration;
      return total + minutes;
    }, 0);
  }, [items]);

  return (
    <BookingCartContext.Provider
      value={{
        items,
        selectedBarber,
        addItem,
        removeItem,
        clearCart,
        isServiceSelected,
        getTotalPrice,
        getTotalDuration,
      }}
    >
      {children}
    </BookingCartContext.Provider>
  );
}

export function useBookingCart(): BookingCartContextType {
  const context = useContext(BookingCartContext);
  if (!context) {
    throw new Error("useBookingCart must be used within a BookingCartProvider");
  }
  return context;
}
