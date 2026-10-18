import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { combine, formatDate, formatTime, nextSlot, toDateInput } from '../utils/time';

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

// Position of a reservation on the 08:00–20:00 timeline, in percent.
const toPercent = (value, day) => {
  const date = new Date(value);
  const minutes = (date - day) / 60000 - DAY_START_HOUR * 60;
  const total = (DAY_END_HOUR - DAY_START_HOUR) * 60;
  return Math.min(100, Math.max(0, (minutes / total) * 100));
};

export const RoomPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [initialSlot] = useState(() => nextSlot());
  const [date, setDate] = useState(initialSlot.date);
  const [form, setForm] = useState({ title: '', start: initialSlot.start, end: initialSlot.end });
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const room = useAsync(() => api.getRoom(id), [id]);
  const schedule = useAsync(() => api.getSchedule(id, date), [id, date]);

  const day = new Date(`${date}T00:00`);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await api.createReservation({
        roomId: id,
        title: form.title,
        start: combine(date, form.start).toISOString(),
        end: combine(date, form.end).toISOString(),
      });
      setMessage({ type: 'success', text: 'Room booked! You can find it under My reservations.' });
      setForm({ ...form, title: '' });
      schedule.reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (room.loading) return <Spinner />;
  if (room.error) return <Alert>{room.error}</Alert>;

  const { name, location, capacity, description, amenities } = room.data;

  return (
    <>
      <Link to="/rooms" className="back-link">&larr; All rooms</Link>
      <div className="page-header">
        <div>
          <h1>{name}</h1>
          <p className="muted">{location} &middot; up to {capacity} people</p>
        </div>
      </div>

      <div className="room-layout">
        <section className="card">
          <div className="section-header">
            <h2>Schedule for {formatDate(day)}</h2>
            <input type="date" aria-label="Schedule date" min={toDateInput(new Date())} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="timeline" aria-hidden="true">
            <div className="timeline__hours">
              {HOURS.map((hour) => <span key={hour}>{String(hour).padStart(2, '0')}</span>)}
            </div>
            <div className="timeline__track">
              {schedule.data?.map((r) => (
                <div
                  key={r._id}
                  className="timeline__slot"
                  style={{ left: `${toPercent(r.start, day)}%`, width: `${toPercent(r.end, day) - toPercent(r.start, day)}%` }}
                  title={`${r.title} ${formatTime(r.start)}–${formatTime(r.end)}`}
                />
              ))}
            </div>
          </div>

          {schedule.loading ? (
            <Spinner />
          ) : schedule.data?.length ? (
            <ul className="schedule">
              {schedule.data.map((r) => (
                <li key={r._id}>
                  <span className="schedule__time">{formatTime(r.start)} – {formatTime(r.end)}</span>
                  <span>{r.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No reservations on this day &ndash; the room is free.</p>
          )}

          {description && <p className="room-description">{description}</p>}
          {amenities?.length > 0 && (
            <ul className="tags">
              {amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}
            </ul>
          )}
        </section>

        <aside className="card">
          <h2>Book this room</h2>
          {user ? (
            <form className="form" onSubmit={handleSubmit}>
              <Alert type={message?.type}>{message?.text}</Alert>
              <label className="field">
                <span>Meeting title</span>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Sprint review" required />
              </label>
              <p className="muted">Date: {formatDate(day)}</p>
              <div className="field-row">
                <label className="field">
                  <span>From</span>
                  <input type="time" name="start" step="900" value={form.start} onChange={handleChange} required />
                </label>
                <label className="field">
                  <span>To</span>
                  <input type="time" name="end" step="900" value={form.end} onChange={handleChange} required />
                </label>
              </div>
              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? 'Booking…' : 'Book room'}
              </button>
            </form>
          ) : (
            <p className="muted">
              <Link to="/login" state={{ from: `/rooms/${id}` }}>Log in</Link> to book this room.
            </p>
          )}
        </aside>
      </div>
    </>
  );
};
