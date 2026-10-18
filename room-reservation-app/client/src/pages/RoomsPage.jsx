import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { combine, toDateInput } from '../utils/time';

const emptyFilters = { minCapacity: '', date: toDateInput(new Date()), from: '', to: '' };

export const RoomsPage = () => {
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);

  const range =
    filters.from && filters.to
      ? { from: combine(filters.date, filters.from).toISOString(), to: combine(filters.date, filters.to).toISOString() }
      : {};

  const { data: rooms, error, loading } = useAsync(
    () => api.listRooms({ minCapacity: filters.minCapacity, ...range }),
    [filters]
  );

  const handleChange = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilters(draft);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
  };

  const checkingAvailability = Boolean(range.from);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Conference rooms</h1>
          <p className="muted">Find a room that fits your team and check when it is free.</p>
        </div>
      </div>

      <form className="filters card" onSubmit={handleSubmit}>
        <label className="field">
          <span>People</span>
          <input type="number" name="minCapacity" min="1" placeholder="Any" value={draft.minCapacity} onChange={handleChange} />
        </label>
        <label className="field">
          <span>Date</span>
          <input type="date" name="date" min={toDateInput(new Date())} value={draft.date} onChange={handleChange} />
        </label>
        <label className="field">
          <span>From</span>
          <input type="time" name="from" step="900" value={draft.from} onChange={handleChange} />
        </label>
        <label className="field">
          <span>To</span>
          <input type="time" name="to" step="900" value={draft.to} onChange={handleChange} />
        </label>
        <div className="filters__actions">
          <button type="submit" className="btn btn--primary">Search</button>
          <button type="button" className="btn btn--ghost" onClick={handleReset}>Clear</button>
        </div>
      </form>

      <Alert>{error}</Alert>
      {loading ? (
        <Spinner />
      ) : rooms?.length ? (
        <div className="grid">
          {rooms.map((room) => (
            <article key={room._id} className="room-card card">
              <div className="room-card__header">
                <h2>{room.name}</h2>
                {checkingAvailability && (
                  <span className={`badge ${room.available ? 'badge--success' : 'badge--danger'}`}>
                    {room.available ? 'Available' : 'Booked'}
                  </span>
                )}
              </div>
              <p className="room-card__meta">
                {room.location} &middot; up to {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
              </p>
              {room.description && <p className="room-card__description">{room.description}</p>}
              {room.amenities?.length > 0 && (
                <ul className="tags">
                  {room.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}
                </ul>
              )}
              <Link to={`/rooms/${room._id}`} className="btn btn--primary btn--block room-card__cta">
                View schedule &amp; book
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty">No rooms match your search.</p>
      )}
    </>
  );
};
