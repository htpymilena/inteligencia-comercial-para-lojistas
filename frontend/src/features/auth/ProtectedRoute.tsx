import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ForbiddenPage } from './ForbiddenPage';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'ADMIN' | 'LOJISTA';
  allowedStoreIds?: string[];
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedStoreIds,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, selectedStore } = useAuth();
  const { storeId } = useParams<{ storeId?: string }>();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check if specific role required
  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return <ForbiddenPage />;
  }

  // Store access check: Admins can access all stores.
  // For lojistas, if allowedStoreIds is provided and storeId is not in it, or if selectedStore mismatch
  if (storeId && user.role !== 'ADMIN') {
    if (allowedStoreIds && !allowedStoreIds.includes(storeId)) {
      return <ForbiddenPage />;
    }

    if (selectedStore && selectedStore.id !== storeId) {
      return <ForbiddenPage />;
    }
  }

  return children;
}
