import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { ReservationTable } from '../components/ReservationTable';

export const ReservationsPage = () => {
  const { data, error, loading, reload } = useAsync(() => api.listReservations(), []);
  const [actionError, setActionError] = useState('');

  const handleCancel = async (reservation) => {
    if (!window.confirm(`Cancel "${reservation.title}"?`)) return;
    setActionError('');
    try {
      await api.cancelReservation(reservation._id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const now = new Date();
  const upcoming = data?.filter((r) => new Date(r.end) >= now) ?? [];
  const past = data?.filter((r) => new Date(r.end) < now) ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My reservations</h1>
          <p className="muted">Upcoming and past bookings made with your account.</p>
        </div>
        <Link to="/rooms" className="btn btn--primary">Book a room</Link>
      </div>

      <Alert>{error || actionError}</Alert>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <section className="card">
            <h2>Upcoming</h2>
            {upcoming.length ? (
              <ReservationTable reservations={upcoming} onCancel={handleCancel} />
            ) : (
              <p className="empty">You have no upcoming reservations.</p>
            )}
          </section>
          {past.length > 0 && (
            <section className="card">
              <h2>Past</h2>
              <ReservationTable reservations={past} />
            </section>
          )}
        </>
      )}
    </>
  );
};
