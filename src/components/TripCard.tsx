import React from 'react';
import '../App.css';
import { TripCardProps } from '../types';

const TripCard: React.FC<TripCardProps> = ({ trip, isSelected = false, onSelect }) => {
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className={`trip-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <div className="trip-header">
        <div className="trip-time">
          {formatTime(trip.departure_time)} → {formatTime(trip.arrival_time)}
        </div>
        <div className="trip-price">${trip.price.toFixed(2)}</div>
      </div>
      <div className="trip-details">
        <span>Duration: ~{trip.duration || '4h 30m'}</span>
        <span className="trip-availability">
          {trip.available_seats} of {trip.total_seats || 14} seats available
        </span>
      </div>
    </div>
  );
};

export default TripCard;