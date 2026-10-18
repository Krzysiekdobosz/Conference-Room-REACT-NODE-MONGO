import { formatRange } from '../utils/time';

export const ReservationTable = ({ reservations, onCancel, showUser = false }) => (
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>Meeting</th>
          <th>Room</th>
          <th>When</th>
          {showUser && <th>Booked by</th>}
          {onCancel && <th aria-label="Actions" />}
        </tr>
      </thead>
      <tbody>
        {reservations.map((r) => (
          <tr key={r._id}>
            <td data-label="Meeting">{r.title}</td>
            <td data-label="Room">{r.room ? `${r.room.name} (${r.room.location})` : '—'}</td>
            <td data-label="When">{formatRange(r)}</td>
            {showUser && <td data-label="Booked by">{r.user?.name ?? '—'}</td>}
            {onCancel && (
              <td className="table__actions">
                <button type="button" className="btn btn--danger btn--sm" onClick={() => onCancel(r)}>
                  Cancel
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
