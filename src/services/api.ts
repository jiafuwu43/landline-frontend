import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Route, Trip, Seat, SeatsByLevel, Booking, AuthResponse, BookingData, BookingUpdates } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage = error.response.data.error || 'An error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Unable to connect to server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const getRoutes = async (): Promise<Route[]> => {
  const response = await api.get<Route[]>('/routes');
  return response.data;
};

export const searchSchedules = async (
  origin: string,
  destination: string,
  date: string
): Promise<Trip[]> => {
  const response = await api.get<Trip[]>('/schedules/search', {
    params: { origin, destination, date },
  });
  return response.data;
};

export const getAvailability = async (inventoryId: number): Promise<{ available_seats: number }> => {
  const response = await api.get<{ available_seats: number }>(`/schedules/${inventoryId}/availability`);
  return response.data;
};

export const getSeatsByLevel = async (inventoryId: number): Promise<SeatsByLevel> => {
  const response = await api.get<SeatsByLevel>(`/schedules/${inventoryId}/seats`);
  return response.data;
};

export const createBooking = async (bookingData: BookingData): Promise<Booking> => {
  const response = await api.post<Booking>('/bookings', bookingData);
  return response.data;
};

export const updateBooking = async (bookingId: number, updates: BookingUpdates): Promise<Booking> => {
  const response = await api.patch<Booking>(`/bookings/${bookingId}`, updates);
  return response.data;
};

export const cancelBooking = async (bookingId: number): Promise<void> => {
  await api.delete(`/bookings/${bookingId}`);
};

export const signup = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', { email, password });
  return response.data;
};

export const signin = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signin', { email, password });
  return response.data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>('/bookings/my');
  return response.data;
};

export default api;