import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Modal, Skeleton } from '@/components/ui';

describe('Core UI Primitives', () => {
  it('renders Button with variants and handles click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Salvar</Button>);

    const button = screen.getByRole('button', { name: /salvar/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled Button when isLoading is true', () => {
    render(<Button isLoading>Processando</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders Card with header, title and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título do Card</CardTitle>
        </CardHeader>
        <CardContent>Conteúdo do Card</CardContent>
      </Card>
    );

    expect(screen.getByText('Título do Card')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do Card')).toBeInTheDocument();
  });

  it('renders Input with label, error and helperText', () => {
    render(
      <Input
        label="E-mail"
        error="E-mail inválido"
        helperText="Digite seu e-mail corporativo"
        defaultValue="invalido"
      />
    );

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders Badge with DEMO variant', () => {
    render(<Badge variant="demo">DEMO</Badge>);
    const badge = screen.getByText('DEMO');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-demo-badge');
  });

  it('renders Modal and responds to close button and Escape key', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose} title="Modal de Teste">
        <p>Conteúdo da Modal</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal de Teste')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/fechar modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);

    rerender(
      <Modal isOpen={false} onClose={handleClose} title="Modal de Teste">
        <p>Conteúdo da Modal</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Skeleton loading element', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});
