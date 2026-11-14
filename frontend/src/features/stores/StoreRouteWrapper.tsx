import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { api, ApiClientError } from '@/lib/api';
import { Skeleton } from '@/components/ui';

export function StoreRouteWrapper() {
  const { storeId } = useParams<{ storeId: string }>();
  const { selectedStore, setSelectedStore } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId || storeId === 'demo-store') {
      setRedirectPath('/app/lojas');
      return;
    }

    // If store is already selected and matches URL param, we're good
    if (selectedStore?.id === storeId) {
      return;
    }

    // Otherwise, validate store access with backend
    let isMounted = true;
    setIsValidating(true);

    api
      .obterLoja(storeId)
      .then((store) => {
        if (isMounted) {
          setSelectedStore(store);
          setIsValidating(false);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setIsValidating(false);
        if (err instanceof ApiClientError && err.status === 403) {
          setRedirectPath('/403');
        } else {
          setRedirectPath('/app/lojas');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [storeId, selectedStore?.id, setSelectedStore]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (isValidating && !selectedStore) {
    return (
      <div className="space-y-4 p-6" data-testid="store-route-loading">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
