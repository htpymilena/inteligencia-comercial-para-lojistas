import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const origin = process.env.NEXO_FRONTEND_ORIGIN || 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const evidencePath = resolve(dirname(fileURLToPath(import.meta.url)), '../../evidencias/g00-status.png');
const browser = await chromium.launch({ executablePath: chrome, headless: true });

try {
  const page = await browser.newPage();
  const healthRequests = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.includes('health')) healthRequests.push(request.url());
  });

  await page.goto(`${origin}/status`);
  await page.getByText('OPERACIONAL').waitFor();
  assert.equal(await page.getByText('Serviço: nexo-api').count(), 1);

  await page.route('**/health', (route) => route.abort());
  await page.getByRole('button', { name: /verificar conexão novamente/i }).click();
  await page.getByText('DESCONECTADO').waitFor();
  await page.unroute('**/health');
  await page.getByRole('button', { name: /verificar conexão novamente/i }).click();
  await page.getByText('OPERACIONAL').waitFor();

  assert(healthRequests.length >= 3);
  assert(healthRequests.every((url) => new URL(url).origin === origin));
  assert(healthRequests.every((url) => new URL(url).pathname === '/health'));
  await mkdir(dirname(evidencePath), { recursive: true });
  await page.screenshot({ path: evidencePath, fullPage: true });
  console.log(`Status público, falha/recuperação e proxy reais: OK; captura: ${evidencePath}`);
} finally {
  await browser.close();
}
