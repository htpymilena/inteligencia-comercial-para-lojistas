// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer as createHttpServer, get } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createServer as createViteServer, type ViteDevServer } from 'vite';

const seenPaths: string[] = [];
const backend = createHttpServer((request, response) => {
  seenPaths.push(request.url ?? '');
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({ path: request.url }));
});
let vite: ViteDevServer;
let vitePort: number;
const previousTarget = process.env.VITE_PROXY_TARGET;

function request(path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    get(`http://127.0.0.1:${vitePort}${path}`, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode ?? 0, body }));
    }).on('error', reject);
  });
}

beforeAll(async () => {
  await new Promise<void>((resolve) => backend.listen(0, '127.0.0.1', resolve));
  const backendPort = (backend.address() as AddressInfo).port;
  process.env.VITE_PROXY_TARGET = `http://127.0.0.1:${backendPort}`;
  vite = await createViteServer({ server: { port: 0, host: '127.0.0.1' } });
  await vite.listen();
  vitePort = (vite.httpServer?.address() as AddressInfo).port;
});

afterAll(async () => {
  await vite?.close();
  await new Promise<void>((resolve) => backend.close(() => resolve()));
  if (previousTarget === undefined) delete process.env.VITE_PROXY_TARGET;
  else process.env.VITE_PROXY_TARGET = previousTarget;
});

describe('proxy Vite', () => {
  it('encaminha /health sem prefixo de API', async () => {
    const result = await request('/health');
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ path: '/health' });
    expect(seenPaths).toContain('/health');
  });

  it('preserva /api/v1 no backend', async () => {
    const result = await request('/api/v1/ping');
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ path: '/api/v1/ping' });
    expect(seenPaths).toContain('/api/v1/ping');
  });
});
