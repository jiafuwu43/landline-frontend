import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchSchedules } from '../services/api';
import TripCard from '../components/TripCard';
import { Trip, SearchState } from '../types';
import '../App.css';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { origin, destination, date } = (location.state as SearchState) || {};

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!origin || !destination || !date) {
      navigate('/');
      return;
    }

    loadTrips();
  }, [origin, destination, date, navigate]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const tripsData = await searchSchedules(origin, destination, date);
      setTrips(tripsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleContinue = () => {
    if (!selectedTrip) {
      setError('Please select a trip');
      return;
    }

    navigate('/booking', {
      state: {
        trip: selectedTrip,
        origin,
        destination,
        date,
      },
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Searching for trips...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Available Trips</h2>

      <div style={{ marginBottom: '20px', color: '#666' }}>
        <strong>{origin}</strong> → <strong>{destination}</strong> on{' '}
        <strong>{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</strong>
      </div>

      {error && <div className="error-message">{error}</div>}

      {trips.length === 0 && !loading ? (
        <div className="no-results">
          <p>No trips available for this route and date.</p>
          <button className="button button-secondary" onClick={handleBack} style={{ marginTop: '20px' }}>
            Search Again
          </button>
        </div>
      ) : (
        <>
          {trips.map((trip) => (
            <TripCard
              key={trip.inventory_id}
              trip={trip}
              isSelected={selectedTrip?.inventory_id === trip.inventory_id}
              onSelect={() => handleTripSelect(trip)}
            />
          ))}

          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button className="button button-secondary" onClick={handleBack}>
              Back
            </button>
            <button
              className="button"
              onClick={handleContinue}
              disabled={!selectedTrip}
            >
              Continue to Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ResultsPage;