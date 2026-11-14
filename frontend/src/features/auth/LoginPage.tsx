import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input } from '@/components/ui';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { ApiClientError } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function validate() {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Informe um endereço de e-mail válido.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('A senha é obrigatória.');
      isValid = false;
    }

    return isValid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login({ email: email.trim(), password });
      navigate('/app/lojas');
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setFormError('Credenciais inválidas. Verifique seu e-mail e senha.');
        } else {
          setFormError(err.message || 'Erro ao realizar login.');
        }
      } else {
        setFormError('Falha na comunicação de rede. Verifique sua conexão e tente novamente.');
      }
    }
  }

  function fillDemo(role: 'lojista' | 'admin') {
    if (role === 'lojista') {
      setEmail('lojista@nexo2031.demo');
      setPassword('demo1234');
    } else {
      setEmail('admin@nexo2031.demo');
      setPassword('admin1234');
    }
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-xl shadow-md">
            N
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">NEXO 2031</h1>
          <p className="text-sm text-slate-500">Painel de Inteligência Comercial para Lojistas</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Entrar na plataforma</CardTitle>
            <CardDescription>Acesse com suas credenciais autorizadas.</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <Input
                label="E-mail"
                type="email"
                id="login-email"
                placeholder="seu.email@shopping.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError || undefined}
                autoComplete="email"
                required
              />

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError || undefined}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha em texto claro'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Demo Quick-Fill Shortcuts */}
              <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-900 space-y-2">
                <span className="font-semibold block">Acesso Rápido de Demonstração (MVP):</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('lojista')}
                    className="rounded bg-amber-100 hover:bg-amber-200 px-2 py-1 font-medium text-amber-900 transition-colors"
                  >
                    Usar Lojista Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('admin')}
                    className="rounded bg-amber-100 hover:bg-amber-200 px-2 py-1 font-medium text-amber-900 transition-colors"
                  >
                    Usar Admin Demo
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" isLoading={isLoading} className="w-full">
                Entrar
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
