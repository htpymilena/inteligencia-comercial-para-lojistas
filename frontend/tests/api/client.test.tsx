import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '@/lib/api/client';
import { HealthPage } from '@/features/health/HealthPage';
import { MemoryRouter } from 'react-router-dom';

describe('ApiClient & Health Connection', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends request with authorization header when token is present', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', service: 'nexo-api' }),
    });
    globalThis.fetch = mockFetch;

    const client = new ApiClient({
      baseUrl: 'http://localhost:8000',
      getToken: () => 'test-jwt-token',
    });

    const res = await client.verificarSaude();
    expect(res.status).toBe('ok');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/health',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );

    const callHeaders = mockFetch.mock.calls[0][1].headers as Headers;
    expect(callHeaders.get('Authorization')).toBe('Bearer test-jwt-token');
  });

  it('triggers onUnauthorized callback when API returns 401', async () => {
    const handleUnauthorized = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: 'UNAUTHORIZED', message: 'Token expirado' },
      }),
    });
    globalThis.fetch = mockFetch;

    const client = new ApiClient({
      onUnauthorized: handleUnauthorized,
    });

    await expect(client.obterPerfil()).rejects.toThrow();
    expect(handleUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('HealthPage renders operational state on successful health check', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', service: 'nexo-api' }),
    });

    render(<MemoryRouter><HealthPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('OPERACIONAL')).toBeInTheDocument();
      expect(screen.getByText(/Backend respondendo com sucesso/i)).toBeInTheDocument();
    });
  });

  it('HealthPage displays error feedback on failed health check', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    render(<MemoryRouter><HealthPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('DESCONECTADO')).toBeInTheDocument();
      expect(screen.getByText(/Falha na comunicação com a API/i)).toBeInTheDocument();
    });
  });

  it('rejects a health response outside the contract', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200,
      json: async () => ({ status: 'ok', timestamp: 'extra' }) });
    await expect(new ApiClient().verificarSaude()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('rejects an empty successful response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200,
      json: async () => { throw new SyntaxError('empty body'); } });
    await expect(new ApiClient().verificarSaude()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('times out a stalled request', async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    await expect(new ApiClient({ timeoutMs: 10 }).verificarSaude()).rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('shows loading, then recovers after a manual retry', async () => {
    let rejectFirst!: (reason?: unknown) => void;
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectFirst = reject; }))
      .mockResolvedValueOnce({ ok: true, status: 200,
        json: async () => ({ status: 'ok', service: 'nexo-api' }) });
    globalThis.fetch = fetchMock;
    render(<MemoryRouter><HealthPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /verificar conexão novamente/i })).toBeDisabled();
    rejectFirst(new Error('offline'));
    await waitFor(() => expect(screen.getByText('DESCONECTADO')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /verificar conexão novamente/i }));
    await waitFor(() => expect(screen.getByText('OPERACIONAL')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
