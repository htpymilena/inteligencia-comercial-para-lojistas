import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill ResizeObserver for Recharts in JSDOM environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill URL.createObjectURL and URL.revokeObjectURL for CSV exports in JSDOM
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  window.URL.revokeObjectURL = vi.fn();
}


