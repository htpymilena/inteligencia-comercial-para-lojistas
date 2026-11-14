import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { api, ApiClientError } from '@/lib/api';

describe('LoginPage (TELA001)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function renderLoginPage() {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app/lojas" element={<div>Tela de Escolha de Loja</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  it('validates required email and password fields on submit', async () => {
    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: /^entrar$/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('O e-mail é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('A senha é obrigatória.')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/^senha/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText(/exibir senha em texto claro/i);
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    const hideBtn = screen.getByLabelText(/ocultar senha/i);
    fireEvent.click(hideBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('populates demo credentials on quick-fill button click', () => {
    renderLoginPage();

    const fillLojistaBtn = screen.getByRole('button', { name: /usar lojista demo/i });
    fireEvent.click(fillLojistaBtn);

    const emailInput = screen.getByLabelText(/^e-mail/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^senha/i) as HTMLInputElement;

    expect(emailInput.value).toBe('lojista@nexo2031.demo');
    expect(passwordInput.value).toBe('demo1234');
  });

  it('successfully logs in and navigates to /app/lojas', async () => {
    vi.spyOn(api, 'login').mockResolvedValue({
      access_token: 'valid-token',
      token_type: 'bearer',
      user: {
        id: 'u-1',
        email: 'lojista@nexo2031.demo',
        full_name: 'Lojista Demo',
        role: 'LOJISTA',
        created_at: '2026-11-14T00:00:00Z',
      },
    });

    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /usar lojista demo/i }));
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(screen.getByText('Tela de Escolha de Loja')).toBeInTheDocument();
    });
  });

  it('displays authentication error message on 401 response', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(
      new ApiClientError(401, {
        error: { code: 'UNAUTHORIZED', message: 'Credenciais inválidas' },
      })
    );

    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /usar lojista demo/i }));
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credenciais inválidas\. Verifique seu e-mail e senha\./i)).toBeInTheDocument();
    });
  });
});
