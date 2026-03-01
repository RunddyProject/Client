import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// IntersectionObserver is not implemented in jsdom
// Must use function (not arrow) to satisfy vitest constructor mock requirement
global.IntersectionObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
  };
});
