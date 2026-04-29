import { Outlet } from 'react-router-dom';

export function GuestLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-100">
        <Outlet />
      </div>
    </div>
  );
}
