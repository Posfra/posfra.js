import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock global constants that are defined at build time
declare const API_URL: string;
declare const EMBED_URL: string;

(globalThis as any).API_URL = 'https://api.test.posfra.com';
(globalThis as any).EMBED_URL = 'https://embed.test.posfra.com';

// Mock window.confirm
(globalThis as any).confirm = vi.fn(() => true);

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        href: 'http://localhost:3000',
    },
    writable: true,
});

// Mock fetch globally
(globalThis as any).fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    document.head.innerHTML = '';
});
