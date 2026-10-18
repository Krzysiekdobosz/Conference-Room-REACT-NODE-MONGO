import { useState } from 'react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { ReservationTable } from '../components/ReservationTable';

const emptyRoom = { name: '', location: '', capacity: '', description: '', amenities: '' };

const toForm = (room) => ({ ...room, capacity: String(room.capacity), amenities: room.amenities.join(', ') });
const fromForm = (form) => ({
  ...form,
  capacity: Number(form.capacity),
  amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
});

export const AdminPage = () => {
  const rooms = useAsync(() => api.listRooms(), []);
  const reservations = useAsync(() => api.listReservations({ all: true }), []);
  const [form, setForm] = useState(emptyRoom);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyRoom);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingId) {
        await api.updateRoom(editingId, fromForm(form));
        setMessage({ type: 'success', text: 'Room updated.' });
      } else {
        await api.createRoom(fromForm(form));
        setMessage({ type: 'success', text: 'Room added.' });
      }
      resetForm();
      rooms.reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete ${room.name}? Its reservations will be removed too.`)) return;
    try {
      await api.deleteRoom(room._id);
      rooms.reload();
      reservations.reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm(`Cancel "${reservation.title}"?`)) return;
    try {
      await api.cancelReservation(reservation._id);
      reservations.reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Admin panel</h1>
          <p className="muted">Manage rooms and every reservation in the system.</p>
        </div>
      </div>

      <div className="room-layout">
        <section className="card">
          <h2>Rooms</h2>
          {rooms.loading ? (
            <Spinner />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {rooms.data?.map((room) => (
                    <tr key={room._id}>
                      <td data-label="Name">{room.name}</td>
                      <td data-label="Location">{room.location}</td>
                      <td data-label="Capacity">{room.capacity}</td>
                      <td className="table__actions">
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setEditingId(room._id); setForm(toForm(room)); }}>
                          Edit
                        </button>
                        <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(room)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="card">
          <h2>{editingId ? 'Edit room' : 'Add a room'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <Alert type={message?.type}>{message?.text}</Alert>
            <label className="field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Location</span>
                <input name="location" value={form.location} onChange={handleChange} required />
              </label>
              <label className="field">
                <span>Capacity</span>
                <input type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} required />
              </label>
            </div>
            <label className="field">
              <span>Description</span>
              <textarea name="description" rows="3" value={form.description} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Amenities (comma separated)</span>
              <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Projector, Whiteboard" />
            </label>
            <button type="submit" className="btn btn--primary btn--block">
              {editingId ? 'Save changes' : 'Add room'}
            </button>
            {editingId && (
              <button type="button" className="btn btn--ghost btn--block" onClick={resetForm}>
                Cancel editing
              </button>
            )}
          </form>
        </aside>
      </div>

      <section className="card">
        <h2>All reservations</h2>
        <Alert>{reservations.error}</Alert>
        {reservations.loading ? (
          <Spinner />
        ) : reservations.data?.length ? (
          <ReservationTable reservations={reservations.data} onCancel={handleCancel} showUser />
        ) : (
          <p className="empty">There are no reservations yet.</p>
        )}
      </section>
    </>
  );
};
