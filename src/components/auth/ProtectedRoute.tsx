import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Role } from '../../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/hub/connexion" state={{ from: location }} replace />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/hub/dashboard" replace />;
  }

  return <Outlet />;
}
