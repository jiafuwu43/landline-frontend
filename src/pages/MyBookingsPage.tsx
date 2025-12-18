import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/api';
import { Booking } from '../types';
import '../App.css';

function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    loadBookings();
  }, [navigate]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const bookingsData = await getMyBookings();
      setBookings(bookingsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings';
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const formatTime = (time: string | undefined): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">My Bookings</h2>

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="no-results">
          <p>You don't have any bookings yet.</p>
          <button className="button" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            Book a Trip
          </button>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => {
            const origin = (booking as any).origin || booking.route?.origin || 'N/A';
            const destination = (booking as any).destination || booking.route?.destination || 'N/A';
            const bookingDate = (booking as any).booking_date || booking.created_at;
            const departureTime = (booking as any).departure_time || booking.schedule?.departure_time || '';
            const arrivalTime = (booking as any).arrival_time || booking.schedule?.arrival_time || '';

            return (
              <div key={booking.id} className="trip-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>Booking #{booking.id}</h3>
                    <p><strong>Route:</strong> {origin} → {destination}</p>
                    <p><strong>Date:</strong> {bookingDate ? new Date(bookingDate + 'T12:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}</p>
                    {departureTime && <p><strong>Departure:</strong> {formatTime(departureTime)}</p>}
                    {arrivalTime && <p><strong>Arrival:</strong> {formatTime(arrivalTime)}</p>}
                    <p><strong>Passenger:</strong> {booking.passenger_name}</p>
                    {booking.seat_number && (
                      <p><strong>Seat:</strong> #{booking.seat_number} {booking.seat_level && `(Level ${booking.seat_level})`}</p>
                    )}
                    <p><strong>Status:</strong> <span style={{ 
                      color: booking.status === 'confirmed' ? '#4CAF50' : 
                             booking.status === 'cancelled' ? '#dc3545' : '#666'
                    }}>{booking.status.toUpperCase()}</span></p>
                  </div>
                  {booking.status !== 'cancelled' && (
                    <button
                      className="button button-secondary"
                      onClick={() => handleCancel(booking.id)}
                      style={{ backgroundColor: '#dc3545' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;