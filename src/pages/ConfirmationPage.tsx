import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelBooking } from '../services/api';
import { ConfirmationState, Trip } from '../types';
import '../App.css';

function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, trip, origin, destination, date } = (location.state as ConfirmationState) || {};

  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  const handleCancel = async () => {
    if (!booking || !window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancelling(true);
      setError(null);
      await cancelBooking(booking.id);
      setCancelled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (!booking || !trip) {
    return null;
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (cancelled) {
    return (
      <div className="page-container">
        <div className="error-message" style={{ backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>Booking Cancelled</h2>
          <p style={{ margin: 0 }}>Your booking has been successfully cancelled. The seat has been released.</p>
        </div>
        <div style={{ marginTop: '30px' }}>
          <button
            className="button"
            onClick={() => navigate('/')}
          >
            Book Another Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="success-message">
        <h2 style={{ margin: '0 0 10px 0' }}>Booking Confirmed!</h2>
        <p style={{ margin: 0 }}>Your reservation has been successfully created.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="confirmation-details">
        <h3>Booking Details</h3>
        <p><strong>Confirmation Number:</strong> #{booking.id}</p>
        <p><strong>Passenger Name:</strong> {booking.passenger_name}</p>
        <p><strong>Email:</strong> {booking.passenger_email}</p>
        {booking.seat_number && (
          <p><strong>Seat Number:</strong> {booking.seat_number}</p>
        )}
        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
        <p><strong>Route:</strong> {origin} → {destination}</p>
        <p><strong>Date:</strong> {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>Departure Time:</strong> {formatTime(trip.departure_time)}</p>
        <p><strong>Arrival Time:</strong> {formatTime(trip.arrival_time)}</p>
        <p><strong>Total Price:</strong> ${trip.price.toFixed(2)}</p>
        <p><strong>Status:</strong> {booking.status}</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          A confirmation email has been sent to {booking.passenger_email}
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="button"
            onClick={() => navigate('/')}
          >
            Book Another Trip
          </button>
          {booking.status !== 'cancelled' && (
            <button
              className="button button-secondary"
              onClick={handleCancel}
              disabled={cancelling}
              style={{ backgroundColor: '#dc3545' }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;