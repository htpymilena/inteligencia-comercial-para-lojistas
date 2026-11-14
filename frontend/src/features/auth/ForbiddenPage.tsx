import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-md w-full border-rose-200 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-2">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl text-rose-900">403 — Acesso Negado</CardTitle>
          <CardDescription>
            Você não possui autorização para visualizar ou modificar os dados desta loja ou recurso.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center text-xs text-slate-500">
          Como política de segurança e privacidade do NEXO 2031, usuários com perfil Lojista só podem acessar lojas
          explicitamente vinculadas à sua credencial.
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/app/lojas')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Seleção de Lojas
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
