import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes } from '../services/api';
import { Route } from '../types';
import '../App.css';

function SearchPage() {
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const routesData = await getRoutes();
      setRoutes(routesData);

      const uniqueOrigins = [...new Set(routesData.map((r) => r.origin))].sort();
      const uniqueDestinations = [...new Set(routesData.map((r) => r.destination))].sort();

      setOrigins(uniqueOrigins);
      setDestinations(uniqueDestinations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };
      
      if (newFormData.origin && newFormData.destination && newFormData.origin === newFormData.destination) {
        setError('Origin and destination cannot be the same');
      } else {
        setError(null);
      }
      
      return newFormData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.origin || !formData.destination || !formData.date) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.origin === formData.destination) {
      setError('Origin and destination cannot be the same');
      return;
    }

    const selectedDate = new Date(formData.date + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    console.log('Date validation:', { 
      selectedDate: formData.date, 
      selectedDateObj: selectedDate.toISOString(),
      today: today.toISOString(),
      isValid: selectedDate >= today 
    });

    if (selectedDate < today) {
      setError('Please select today or a future date');
      return;
    }

    navigate('/results', {
      state: {
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
      },
    });
  };

  const isSearchDisabled = formData.origin === formData.destination && formData.origin !== '' && formData.destination !== '';

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading routes...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Search for Shuttle Trips</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="origin">Origin</label>
          <select
            id="origin"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
          >
            <option value="">Select origin</option>
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <select
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          >
            <option value="">Select destination</option>
            {destinations.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Travel Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date || new Date().toISOString().split('T')[0]}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {!isSearchDisabled && (
          <button type="submit" className="button">
            Search Trips
          </button>
        )}
      </form>
    </div>
  );
}

export default SearchPage;