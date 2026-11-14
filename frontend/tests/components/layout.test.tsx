import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Header, Sidebar, AppLayout } from '@/components/layout';

describe('Layout Shell', () => {
  it('renders Header with store information and DEMONSTRAÇÃO badge', () => {
    render(
      <Header
        storeName="Moda & Cia"
        storeSegment="Vestuário Feminino"
        isBackendHealthy={true}
      />
    );

    expect(screen.getByText('Moda & Cia')).toBeInTheDocument();
    expect(screen.getByText('Vestuário Feminino')).toBeInTheDocument();
    expect(screen.getByText('DEMONSTRAÇÃO')).toBeInTheDocument();
    expect(screen.getByText('API Online')).toBeInTheDocument();
  });

  it('renders Sidebar with all main navigation items', () => {
    render(
      <MemoryRouter initialEntries={['/app/lojas/store-1/painel']}>
        <Sidebar isOpen={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Painel Principal')).toBeInTheDocument();
    expect(screen.getByText('Monitoramento')).toBeInTheDocument();
    expect(screen.getByText('Mapa de Calor')).toBeInTheDocument();
    expect(screen.getByText('Recomendações')).toBeInTheDocument();
    expect(screen.getByText('Experimentos')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByText('Circuitos 3 Lojas')).toBeInTheDocument();
  });

  it('toggles mobile sidebar drawer via Header hamburger button', () => {
    const handleToggle = vi.fn();
    render(
      <Header
        storeName="Loja Teste"
        onToggleSidebar={handleToggle}
      />
    );

    const toggleBtn = screen.getByLabelText(/abrir menu de navegação/i);
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
