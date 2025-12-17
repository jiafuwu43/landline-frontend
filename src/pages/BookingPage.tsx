import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking, getSeatsByLevel } from '../services/api';
import { Trip, Seat, SeatsByLevel, BookingState } from '../types';
import '../App.css';

function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, origin, destination, date } = (location.state as BookingState) || {};

  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_email: '',
    seat_number: null as number | null,
    seat_level: null as number | null,
  });
  const [seatsByLevel, setSeatsByLevel] = useState<SeatsByLevel>({ 1: [], 2: [], 3: [] });
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trip) {
      navigate('/');
      return;
    }
    loadSeats();
  }, [trip, navigate]);

  const loadSeats = async () => {
    if (!trip) return;
    
    try {
      setLoadingSeats(true);
      setError(null);
      const seats = await getSeatsByLevel(trip.inventory_id);
      
      const allSeats: SeatsByLevel = { 1: [], 2: [], 3: [] };
      
      if (seats && typeof seats === 'object') {
        ([1, 2, 3] as const).forEach(level => {
          if (seats[level] && Array.isArray(seats[level])) {
            allSeats[level] = seats[level].sort((a, b) => a.seat_number - b.seat_number);
          }
        });
      }
      
      ([1, 2, 3] as const).forEach(level => {
        if (allSeats[level].length === 0) {
          const startSeat = level === 1 ? 1 : level === 2 ? 6 : 11;
          const endSeat = level === 1 ? 5 : level === 2 ? 10 : 14;
          for (let i = startSeat; i <= endSeat; i++) {
            allSeats[level].push({
              seat_number: i,
              level: level,
              available: true,
            });
          }
        }
      });
      
      setSeatsByLevel(allSeats);
    } catch (err) {
      setError('Failed to load seat availability. Please try again.');
      const defaultSeats: SeatsByLevel = {
        1: Array.from({ length: 5 }, (_, i) => ({ seat_number: i + 1, level: 1, available: true })),
        2: Array.from({ length: 5 }, (_, i) => ({ seat_number: i + 6, level: 2, available: true })),
        3: Array.from({ length: 4 }, (_, i) => ({ seat_number: i + 11, level: 3, available: true })),
      };
      setSeatsByLevel(defaultSeats);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSeatSelect = (seatNumber: number, level: number) => {
    setFormData((prev) => ({
      ...prev,
      seat_number: seatNumber,
      seat_level: level,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    
    setError(null);

    if (!formData.passenger_name || !formData.passenger_email) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.passenger_email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const booking = await createBooking({
        inventory_id: trip.inventory_id,
        passenger_name: formData.passenger_name,
        passenger_email: formData.passenger_email,
        seat_number: formData.seat_number,
        seat_level: formData.seat_level,
      });

      navigate('/confirmation', {
        state: {
          booking,
          trip,
          origin,
          destination,
          date,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/results', {
      state: {
        origin,
        destination,
        date,
      },
    });
  };

  if (!trip) {
    return null;
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderSeatGrid = (level: 1 | 2 | 3, seats: Seat[]) => {
    if (!seats || seats.length === 0) {
      return null;
    }

    return (
      <div key={level} style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Level {level} Seats</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '10px',
          maxWidth: '500px'
        }}>
          {seats.map((seat) => {
            const isSelected = formData.seat_number === seat.seat_number;
            const isUnavailable = !seat.available;
            
            return (
              <button
                key={seat.seat_number}
                type="button"
                onClick={() => !isUnavailable && handleSeatSelect(seat.seat_number, seat.level)}
                disabled={isUnavailable || loading}
                style={{
                  padding: '12px 8px',
                  border: isSelected 
                    ? '3px solid #4CAF50' 
                    : isUnavailable
                      ? '2px solid #dc3545'
                      : '2px solid #ddd',
                  backgroundColor: isUnavailable 
                    ? '#ffebee' 
                    : isSelected 
                      ? '#e8f5e9' 
                      : '#f8f9fa',
                  color: isUnavailable ? '#dc3545' : isSelected ? '#2e7d32' : '#333',
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isSelected ? 'bold' : isUnavailable ? 'normal' : 'normal',
                  opacity: isUnavailable ? 0.6 : 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                  minHeight: '50px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isUnavailable && !loading) {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                    e.currentTarget.style.borderColor = '#2196F3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUnavailable && !loading) {
                    e.currentTarget.style.backgroundColor = isSelected ? '#e8f5e9' : '#f8f9fa';
                    e.currentTarget.style.borderColor = isSelected ? '#4CAF50' : '#ddd';
                  }
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{seat.seat_number}</div>
                {isUnavailable && (
                  <div style={{ 
                    fontSize: '10px', 
                    marginTop: '2px',
                    color: '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    UNAVAILABLE
                  </div>
                )}
                {isSelected && !isUnavailable && (
                  <div style={{ 
                    fontSize: '10px', 
                    marginTop: '2px',
                    color: '#2e7d32',
                    fontWeight: 'bold'
                  }}>
                    SELECTED
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <span style={{ display: 'inline-block', marginRight: '15px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#f8f9fa', 
              border: '2px solid #ddd',
              borderRadius: '4px',
              marginRight: '5px',
              verticalAlign: 'middle'
            }}></span>
            Available
          </span>
          <span style={{ display: 'inline-block', marginRight: '15px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#ffebee', 
              border: '2px solid #dc3545',
              borderRadius: '4px',
              marginRight: '5px',
              verticalAlign: 'middle'
            }}></span>
            Unavailable
          </span>
          <span style={{ display: 'inline-block' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#e8f5e9', 
              border: '3px solid #4CAF50',
              borderRadius: '4px',
              marginRight: '5px',
              verticalAlign: 'middle'
            }}></span>
            Selected
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Complete Your Booking</h2>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div><strong>Route:</strong> {origin} → {destination}</div>
        <div><strong>Date:</strong> {new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
        <div><strong>Departure:</strong> {formatTime(trip.departure_time)}</div>
        <div><strong>Arrival:</strong> {formatTime(trip.arrival_time)}</div>
        <div><strong>Price:</strong> ${trip.price.toFixed(2)}</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="passenger_name">
            Passenger Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="passenger_name"
            name="passenger_name"
            value={formData.passenger_name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="passenger_email">
            Email Address <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="email"
            id="passenger_email"
            name="passenger_email"
            value={formData.passenger_email}
            onChange={handleChange}
            required
            placeholder="your.email@example.com"
          />
        </div>

        <div className="form-group">
          <label>Select Your Seat</label>
          {loadingSeats ? (
            <div className="loading">Loading seats...</div>
          ) : (
            <div>
              {([1, 2, 3] as const).map(level => renderSeatGrid(level, seatsByLevel[level] || []))}
              {formData.seat_number && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '10px', 
                  backgroundColor: '#e8f5e9', 
                  borderRadius: '4px',
                  color: '#2e7d32'
                }}>
                  Selected: Seat #{formData.seat_number} (Level {formData.seat_level})
                </div>
              )}
              <small style={{ color: '#666', display: 'block', marginTop: '10px' }}>
                Click on an available seat to select it. Unavailable seats are grayed out.
              </small>
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="button button-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingPage;