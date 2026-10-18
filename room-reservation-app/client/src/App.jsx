import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomPage } from './pages/RoomPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<Navigate to="/rooms" replace />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="rooms" element={<RoomsPage />} />
      <Route path="rooms/:id" element={<RoomPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="reservations" element={<ReservationsPage />} />
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
