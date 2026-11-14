# Frontend NEXO 2031

Na pasta `frontend/`, execute `npm ci`, `npm run lint`, `npm test` e
`npm run build`. O build executa a tipagem TypeScript antes de gerar `dist/`.

Para desenvolvimento local, execute `npm run dev`. A aplicação usa URLs
relativas: operações de negócio em `/api/v1` e diagnóstico público em
`/health`. O Vite encaminha `/api` e `/health` ao endereço definido em
`VITE_PROXY_TARGET`; o padrão local é `http://localhost:8000`. Exemplo
PowerShell, quando a API estiver em outro endereço:

```powershell
$env:VITE_PROXY_TARGET = 'http://127.0.0.1:8001'
npm run dev
```

A página técnica pública fica em `/status`; a raiz continua no fluxo de login.
No contêiner, o Nginx serve o build e encaminha as mesmas rotas à API. Nenhuma
variável `VITE_` deve conter senhas, chaves ou URLs de banco com credenciais.

Com o Compose de demonstração ativo, `npm run smoke:status` abre o Chrome em
modo headless, comprova sucesso, falha e recuperação de `/health` e salva uma
captura em `../evidencias/g00-status.png`. Use `CHROME_PATH` se o executável
do Chrome estiver em outro local.
