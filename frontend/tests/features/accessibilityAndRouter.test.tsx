import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from '@/App';
import { Modal, Button, Input } from '@/components/ui';

describe('Quality Hardening, Accessibility & Router (M08)', () => {
  it('renders login page as root entrypoint when unauthenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar na plataforma/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument();
    });
  });

  it('modal dialog handles Escape key and provides proper dialog ARIA roles', () => {
    const handleClose = vi.fn();

    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Janela de Teste Acessível"
        description="Descrição detalhada para leitores de tela"
      >
        <p>Conteúdo interno interativo</p>
        <Button>Ação Interna</Button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(screen.getByText('Janela de Teste Acessível')).toBeInTheDocument();

    // Fire Escape key event
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Verify does not render when closed
    rerender(
      <Modal isOpen={false} onClose={handleClose} title="Janela de Teste Acessível">
        <p>Conteúdo interno</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('input component links aria-describedby with error and helper messages', () => {
    const { rerender } = render(
      <Input
        id="accessible-input"
        label="Campo com Ajuda"
        helperText="Instruções para preenchimento"
      />
    );

    const input = screen.getByLabelText(/campo com ajuda/i);
    expect(input).toHaveAttribute('aria-describedby', 'accessible-input-helper');
    expect(input).toHaveAttribute('aria-invalid', 'false');

    rerender(
      <Input
        id="accessible-input"
        label="Campo com Erro"
        error="Campo obrigatório não preenchido"
      />
    );

    const inputWithError = screen.getByLabelText(/campo com erro/i);
    expect(inputWithError).toHaveAttribute('aria-describedby', 'accessible-input-error');
    expect(inputWithError).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Campo obrigatório não preenchido')).toBeInTheDocument();
  });

  it('button reflects aria-busy when in loading state', () => {
    const { rerender } = render(<Button isLoading={true}>Salvando</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    rerender(<Button isLoading={false}>Salvar</Button>);
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(button).not.toBeDisabled();
  });
});
