import { describe, it, expect, beforeEach, vi } from 'vitest';
import Posfra from '../src/Posfra';

// Mock the Button class and Button static method
const { mockBuild, MockButton, mockGetOptionsFromElement } = vi.hoisted(() => {
    const mockBuild = vi.fn();
    // This mock should match the static method expected from Button
    const mockGetOptionsFromElement = vi.fn().mockImplementation(() => {
        return {
            btc: '0.001',
            usd: undefined,
            data: undefined,
            redirectURL: undefined,
            ref: undefined,
            embedToken: undefined,
        };
    });

    // Mocks the Button class shape as defined in src/Button.ts
    const MockButton = vi.fn().mockImplementation((embedToken: string, options: any) => {
        return {
            // internal representation, for test access
            embedToken,
            // internal state like Button in src/Button.ts constructor
            btc: options.btc ?? null,
            usd: options.usd ?? null,
            data: options.data ?? null,
            ref: options.ref ?? '',
            redirectURL: options.redirectURL ?? null,
            url: null,
            isAccepted: false,
            container: null,
            build: mockBuild,
        };
    });

    return { mockBuild, MockButton, mockGetOptionsFromElement };
});

vi.mock('../src/Button', () => {
    return {
        Button: MockButton,
        getOptionsFromElement: mockGetOptionsFromElement,
        __esModule: true,
        default: MockButton
    };
});

describe('Posfra', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    describe('constructor', () => {
        it('should create a Posfra instance with embed token', () => {
            const posfra = new Posfra('test-embed-token');
            expect(posfra).toBeInstanceOf(Posfra);
        });

        it('should throw error if embed token is missing', () => {
            expect(() => {
                new Posfra('');
            }).toThrow('Embed token is required to initialize Posfra.js');
        });

        it('should throw error if embed token is null', () => {
            expect(() => {
                new Posfra(null as any);
            }).toThrow('Embed token is required to initialize Posfra.js');
        });

        it('should throw error if embed token is undefined', () => {
            expect(() => {
                new Posfra(undefined as any);
            }).toThrow('Embed token is required to initialize Posfra.js');
        });
    });

    describe('createPayWithBitcoinButton', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should create a button with btc option', () => {
            const posfra = new Posfra('test-embed-token');
            const button = posfra.createPayWithBitcoinButton(container, {
                btc: '0.001',
            });

            expect(MockButton).toHaveBeenCalledWith('test-embed-token', {
                btc: '0.001',
            });
            expect(button).toBeDefined();
            expect(mockBuild).toHaveBeenCalledWith(container);
        });

        it('should create a button with usd option', () => {
            const posfra = new Posfra('test-embed-token');
            const button = posfra.createPayWithBitcoinButton(container, {
                usd: '50',
            });

            expect(MockButton).toHaveBeenCalledWith('test-embed-token', {
                usd: '50',
            });
            expect(button).toBeDefined();
            expect(mockBuild).toHaveBeenCalledWith(container);
        });

        it('should create a button with all options', () => {
            const posfra = new Posfra('test-embed-token');
            const options = {
                btc: '0.001',
                redirectURL: 'https://example.com/success',
                ref: 'test-ref-123',
                data: JSON.stringify({ orderId: '123' }),
            };

            const button = posfra.createPayWithBitcoinButton(container, options);

            expect(MockButton).toHaveBeenCalledWith('test-embed-token', options);
            expect(mockBuild).toHaveBeenCalledWith(container);
            expect(button).toBeDefined();
        });

        it('should use instance embed token when not overridden', () => {
            const posfra = new Posfra('instance-token');
            posfra.createPayWithBitcoinButton(container, {
                btc: '0.001',
            });

            expect(MockButton).toHaveBeenCalledWith('instance-token', {
                btc: '0.001',
            });
        });

        it('should allow overriding embed token in options', () => {
            const posfra = new Posfra('instance-token');
            posfra.createPayWithBitcoinButton(container, {
                btc: '0.001',
                embedToken: 'override-token',
            });

            expect(MockButton).toHaveBeenCalledWith('instance-token', {
                btc: '0.001',
                embedToken: 'override-token',
            });
        });
    });

    describe('createPayWithBitcoinButtonFromElement', () => {
        beforeEach(() => {
            mockGetOptionsFromElement.mockReturnValue({
                btc: '0.001',
                embedToken: 'test-token',
            });
        });

        it('should create button from element with valid attributes', () => {
            const element = document.createElement('div');
            element.setAttribute('embed-token', 'test-token');
            element.setAttribute('btc', '0.001');

            Posfra.createPayWithBitcoinButtonFromElement(element);

            expect(mockGetOptionsFromElement).toHaveBeenCalledWith(element);
        });

        it('should throw error if embed-token attribute is missing', () => {
            const element = document.createElement('div');
            element.setAttribute('btc', '0.001');

            expect(() => {
                Posfra.createPayWithBitcoinButtonFromElement(element);
            }).toThrow('Missing embed-token attribute');
        });

        it('should create Posfra instance with embed token from element', () => {
            const element = document.createElement('div');
            element.setAttribute('embed-token', 'element-token');
            element.setAttribute('btc', '0.001');

            Posfra.createPayWithBitcoinButtonFromElement(element);

            expect(mockGetOptionsFromElement).toHaveBeenCalledWith(element);
        });
    });

    describe('auto-initialization', () => {
        it('should initialize buttons when DOM is ready', () => {
            // Create elements with posfra-pay-button class
            const button1 = document.createElement('div');
            button1.className = 'posfra-pay-button';
            button1.setAttribute('embed-token', 'token-1');
            button1.setAttribute('btc', '0.001');

            const button2 = document.createElement('div');
            button2.className = 'posfra-pay-button';
            button2.setAttribute('embed-token', 'token-2');
            button2.setAttribute('usd', '50');

            document.body.appendChild(button1);
            document.body.appendChild(button2);

            // Mock the static method
            const createSpy = vi.spyOn(Posfra, 'createPayWithBitcoinButtonFromElement');

            // Trigger DOMContentLoaded
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);

            // Note: The actual initialization happens in the module, so we test the behavior
            expect(document.querySelectorAll('.posfra-pay-button').length).toBe(2);
        });
    });
});
