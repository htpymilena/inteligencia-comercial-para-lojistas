import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';

describe('AuthContext (In-Memory Session)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('keeps session token strictly in memory and does not write to localStorage', async () => {
    const mockLoginResponse = {
      access_token: 'memory-only-jwt-token-12345',
      token_type: 'bearer',
      user: {
        id: 'u-1',
        email: 'lojista@nexo2031.demo',
        full_name: 'Lojista Demonstração',
        role: 'LOJISTA' as const,
        created_at: '2026-11-14T00:00:00Z',
      },
    };

    vi.spyOn(api, 'login').mockResolvedValue(mockLoginResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();

    await act(async () => {
      await result.current.login({ email: 'lojista@nexo2031.demo', password: 'demo-password' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('memory-only-jwt-token-12345');
    expect(result.current.user?.email).toBe('lojista@nexo2031.demo');

    // VERIFY LOCALSTORAGE AND SESSIONSTORAGE HAVE NO TOKENS!
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('clears token and session state on logout', async () => {
    const mockLoginResponse = {
      access_token: 'token-abc',
      token_type: 'bearer',
      user: {
        id: 'u-2',
        email: 'admin@nexo2031.demo',
        full_name: 'Admin Demonstração',
        role: 'ADMIN' as const,
        created_at: '2026-11-14T00:00:00Z',
      },
    };

    vi.spyOn(api, 'login').mockResolvedValue(mockLoginResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'admin@nexo2031.demo', password: 'secret' });
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
