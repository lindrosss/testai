import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootRedirect } from './components/RootRedirect.jsx';
import { GuestLayout } from './components/Layout/GuestLayout';
import { PublicLayout } from './components/Layout/PublicLayout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { VerifyEmail } from './pages/Auth/VerifyEmail';
import { AutoCalculator } from './pages/Demo/AutoCalculator';
import { StockCars } from './pages/Demo/StockCars';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <PublicLayout />,
    children: [
      { path: '/demo', element: <Navigate to="/demo/auto" replace /> },
      { path: '/demo/auto', element: <AutoCalculator /> },
      { path: '/demo/stock', element: <StockCars /> },
    ],
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    element: <GuestLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
    ],
  },
]);
