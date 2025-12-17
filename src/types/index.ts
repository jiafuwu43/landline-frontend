export interface Route {
  id: number;
  origin: string;
  destination: string;
  distance_miles: number;
  base_price: number;
}

export interface Schedule {
  id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
}

export interface Trip {
  inventory_id: number;
  schedule_id: number;
  route_id: number;
  date: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  origin?: string;
  destination?: string;
  duration?: string;
  total_seats?: number;
}

export interface Seat {
  seat_number: number;
  level: number;
  available: boolean;
}

export interface SeatsByLevel {
  1: Seat[];
  2: Seat[];
  3: Seat[];
}

export interface Booking {
  id: number;
  inventory_id: number;
  passenger_name: string;
  passenger_email: string;
  seat_number: number | null;
  seat_level: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id?: number;
  schedule?: Schedule;
  route?: Route;
}

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BookingData {
  inventory_id: number;
  passenger_name: string;
  passenger_email: string;
  seat_number: number | null;
  seat_level: number | null;
}

export interface BookingUpdates {
  passenger_name?: string;
  passenger_email?: string;
  seat_number?: number;
  seat_level?: number;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface TripCardProps {
  trip: Trip;
  isSelected?: boolean;
  onSelect: () => void;
}

export interface SearchState {
  origin: string;
  destination: string;
  date: string;
}

export interface BookingState extends SearchState {
  trip: Trip;
}

export interface ConfirmationState extends BookingState {
  booking: Booking;
}