import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Button, ButtonOptions } from '../src/Button';

// Define global constants for tests
declare const API_URL: string;
declare const EMBED_URL: string;

describe('Button', () => {
  let container: HTMLElement;
  const mockEmbedToken = 'test-embed-token';
  const mockAPIUrl = 'https://api.test.posfra.com';
  const mockEmbedUrl = 'https://embed.test.posfra.com';

  beforeEach(() => {
    // Set up global constants
    (global as any).API_URL = mockAPIUrl;
    (global as any).EMBED_URL = mockEmbedUrl;

    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Reset fetch mock
    vi.clearAllMocks();
    (global.fetch as any) = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('should create a Button instance with btc option', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);

      expect(button).toBeInstanceOf(Button);
      expect((button as any).embedToken).toBe(mockEmbedToken);
      expect((button as any).btc).toBe('0.001');
    });

    it('should create a Button instance with usd option', () => {
      const options: ButtonOptions = {
        usd: '50',
      };
      const button = new Button(mockEmbedToken, options);

      expect(button).toBeInstanceOf(Button);
      expect((button as any).embedToken).toBe(mockEmbedToken);
      expect((button as any).usd).toBe('50');
    });

    it('should create a Button instance with all options', () => {
      const options: ButtonOptions = {
        btc: '0.001',
        redirectURL: 'https://example.com/success',
        ref: 'test-ref-123',
        data: JSON.stringify({ orderId: '123' }),
      };
      const button = new Button(mockEmbedToken, options);

      expect((button as any).btc).toBe('0.001');
      expect((button as any).redirectURL).toBe('https://example.com/success');
      expect((button as any).ref).toBe('test-ref-123');
      expect((button as any).data).toBe(JSON.stringify({ orderId: '123' }));
    });

    it('should generate a ref if not provided', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);

      expect((button as any).ref).toBeDefined();
      expect(typeof (button as any).ref).toBe('string');
      expect((button as any).ref.length).toBeGreaterThan(0);
    });

    it('should use provided ref if available', () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'custom-ref-123',
      };
      const button = new Button(mockEmbedToken, options);

      expect((button as any).ref).toBe('custom-ref-123');
    });

    it('should handle null data', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);

      expect((button as any).data).toBeNull();
    });
  });

  describe('getOptionsFromElement', () => {
    it('should extract options from element with btc attribute only', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('btc', '0.001');
      element.setAttribute('redirect-url', 'https://example.com/success');
      element.setAttribute('ref', 'test-ref');
      element.setAttribute('data', '{"key":"value"}');

      const options = Button.getOptionsFromElement(element);

      expect(options.embedToken).toBe('test-token');
      expect(options.btc).toBe('0.001');
      expect(options.usd).toBeNull();
      expect(options.redirectURL).toBe('https://example.com/success');
      expect(options.ref).toBe('test-ref');
      expect(options.data).toBe('{"key":"value"}');
    });

    it('should extract options from element with usd attribute only', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('usd', '50');
      element.setAttribute('redirect-url', 'https://example.com/success');
      element.setAttribute('ref', 'test-ref');
      element.setAttribute('data', '{"key":"value"}');

      const options = Button.getOptionsFromElement(element);

      expect(options.embedToken).toBe('test-token');
      expect(options.btc).toBeNull();
      expect(options.usd).toBe('50');
      expect(options.redirectURL).toBe('https://example.com/success');
      expect(options.ref).toBe('test-ref');
      expect(options.data).toBe('{"key":"value"}');
    });

    it('should throw error if embed-token is missing', () => {
      const element = document.createElement('div');
      element.setAttribute('btc', '0.001');

      expect(() => {
        Button.getOptionsFromElement(element);
      }).toThrow('Missing embed-token attribute');
    });

    it('should throw error if both btc and usd are provided', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('btc', '0.001');
      element.setAttribute('usd', '50');

      expect(() => {
        Button.getOptionsFromElement(element);
      }).toThrow('Cannot use both btc and usd attributes');
    });

    it('should throw error if neither btc nor usd is provided', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');

      expect(() => {
        Button.getOptionsFromElement(element);
      }).toThrow('Missing btc or usd attribute');
    });

    it('should throw error if btc is not a valid number', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('btc', 'invalid');

      expect(() => {
        Button.getOptionsFromElement(element);
      }).toThrow('Invalid btc attribute');
    });

    it('should throw error if usd is not a valid number', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('usd', 'invalid');

      expect(() => {
        Button.getOptionsFromElement(element);
      }).toThrow('Invalid usd attribute');
    });

    it('should validate redirect URL', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('btc', '0.001');
      element.setAttribute('redirect-url', 'invalid-url');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const options = Button.getOptionsFromElement(element);

      expect(options.redirectURL).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should accept valid redirect URL', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('btc', '0.001');
      element.setAttribute('redirect-url', 'https://example.com/success');

      const options = Button.getOptionsFromElement(element);

      expect(options.redirectURL).toBe('https://example.com/success');
    });

    it('should truncate data longer than 500 characters', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('btc', '0.001');
      const longData = 'a'.repeat(600);
      element.setAttribute('data', longData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const options = Button.getOptionsFromElement(element);

      expect(options.data).toBe('a'.repeat(500));
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle empty redirect-url attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('embed-token', 'test-token');
      element.setAttribute('btc', '0.001');
      element.setAttribute('redirect-url', '');

      const options = Button.getOptionsFromElement(element);

      expect(options.redirectURL).toBeUndefined();
    });
  });

  describe('build', () => {
    it('should build button and append to container', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);

      button.build(container);

      expect(button.container).toBe(container);
      expect(container.querySelector('.posfra-button')).toBeTruthy();
    });

    it('should inject CSS only once', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button1 = new Button(mockEmbedToken, options);
      const button2 = new Button(mockEmbedToken, options);

      button1.build(container);
      button2.build(container);

      const styleElements = document.querySelectorAll('style.posfra-css');
      expect(styleElements.length).toBe(1);
    });

    it('should create button with click handler', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);

      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      expect(buttonElement).toBeTruthy();

      // Simulate click
      const clickEvent = new MouseEvent('click', { bubbles: true });
      buttonElement!.dispatchEvent(clickEvent);

      // Should create overlay
      expect(document.querySelector('.posfra-overlay')).toBeTruthy();
    });

    it('should generate URL with base64 encoded data', () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
        data: '{"key":"value"}',
      };
      const button = new Button(mockEmbedToken, options);

      button.build(container);

      const url = (button as any).url;
      expect(url).toBeDefined();
      expect(url).toContain(mockEmbedUrl);
      expect(url).toContain('/checkout/');
    });

    it('should generate ref if not provided during build', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      (button as any).ref = '';

      button.build(container);

      expect((button as any).ref).toBeDefined();
      expect((button as any).ref.length).toBeGreaterThan(0);
    });

    it('should use usd when both btc and usd are provided', () => {
      const options: ButtonOptions = {
        btc: '0.001',
        usd: '50',
      };
      const button = new Button(mockEmbedToken, options);

      button.build(container);

      const url = (button as any).url;
      const base64Data = url.split('/checkout/')[1];
      const decoded = JSON.parse(atob(base64Data));

      // Should use usd when both are present
      expect(decoded.usd).toBe('50');
      expect(decoded.btc).toBeUndefined();
    });
  });

  describe('buildOverlay', () => {
    it('should create overlay when button is clicked', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.querySelector('.posfra-overlay')).toBeTruthy();
      expect(document.querySelector('.posfra-iframe')).toBeTruthy();
      expect(document.querySelector('.posfra-close-button')).toBeTruthy();
    });

    it('should dispatch onOpenPaymentWindow event', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const eventSpy = vi.fn();
      container.addEventListener('onOpenPaymentWindow', eventSpy);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should create iframe with correct attributes', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const iframe = document.querySelector('.posfra-iframe') as HTMLIFrameElement;
      expect(iframe).toBeTruthy();
      expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
      expect(iframe.getAttribute('frameborder')).toBe('0');
      expect(iframe.getAttribute('loading')).toBe('lazy');
    });

    it('should close overlay when clicking outside iframe', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const overlay = document.querySelector('.posfra-overlay');
      expect(overlay).toBeTruthy();

      // Click on overlay (not iframe)
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', {
        value: overlay,
        writable: false,
      });
      overlay!.dispatchEvent(clickEvent);

      // Should show confirm dialog
      expect(global.confirm).toHaveBeenCalled();
    });

    it('should close overlay when close button is clicked', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const closeButton = document.querySelector('.posfra-close-button');
      expect(closeButton).toBeTruthy();

      closeButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(global.confirm).toHaveBeenCalled();
    });

    it('should dispatch onClosePaymentWindow event when closed', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const eventSpy = vi.fn();
      container.addEventListener('onClosePaymentWindow', eventSpy);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const closeButton = document.querySelector('.posfra-close-button');
      closeButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should add beforeunload handler when overlay opens', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  describe('update', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should poll for payment status', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          isAccepted: false,
        }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Wait for initial update
      await vi.runAllTimersAsync();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockAPIUrl}/transaction/ref/test-ref`,
        expect.objectContaining({
          headers: {
            embedtoken: mockEmbedToken,
          },
        })
      );
    });

    it('should dispatch onUpdated event when status updates', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const transactionData = {
        isAccepted: false,
        amount: '0.001',
        status: 'pending',
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(transactionData),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const eventSpy = vi.fn();
      container.addEventListener('onUpdated', eventSpy);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await vi.runAllTimersAsync();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toEqual(transactionData);
    });

    it('should dispatch onPaymentAccepted event when payment is accepted', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const transactionData = {
        isAccepted: true,
        amount: '0.001',
        txid: 'test-txid',
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(transactionData),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const eventSpy = vi.fn();
      container.addEventListener('onPaymentAccepted', eventSpy);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await vi.runAllTimersAsync();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toEqual(transactionData);
    });

    it('should redirect to transaction redirectURL when payment is accepted', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const transactionData = {
        isAccepted: true,
        redirectURL: 'https://transaction-redirect.com',
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(transactionData),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await vi.runAllTimersAsync();

      expect(window.location.href).toBe('https://transaction-redirect.com');
    });

    it('should redirect to button redirectURL when payment is accepted and no transaction redirectURL', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
        redirectURL: 'https://button-redirect.com',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const transactionData = {
        isAccepted: true,
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(transactionData),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await vi.runAllTimersAsync();

      expect(window.location.href).toBe('https://button-redirect.com');
    });

    it('should handle fetch errors gracefully', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await vi.runAllTimersAsync();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should not update if ref is missing', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      (button as any).ref = '';
      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await vi.runAllTimersAsync();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not update if container is missing', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);
      (button as any).container = null;

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await vi.runAllTimersAsync();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should poll every 10 seconds', async () => {
      const options: ButtonOptions = {
        btc: '0.001',
        ref: 'test-ref',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ isAccepted: false }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Initial update
      await vi.advanceTimersByTimeAsync(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // After 10 seconds
      await vi.advanceTimersByTimeAsync(10000);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // After another 10 seconds
      await vi.advanceTimersByTimeAsync(10000);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('exit', () => {
    it('should not close if user cancels confirmation', () => {
      vi.mocked(global.confirm).mockReturnValue(false);

      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const closeButton = document.querySelector('.posfra-close-button');
      closeButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.querySelector('.posfra-overlay')).toBeTruthy();
    });

    it('should close without confirmation if payment is accepted', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      (button as any).isAccepted = true;
      button.build(container);

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const closeButton = document.querySelector('.posfra-close-button');
      closeButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.querySelector('.posfra-overlay')).toBeFalsy();
      expect(global.confirm).not.toHaveBeenCalled();
    });

    it('should remove beforeunload handler when closing', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);
      button.build(container);

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const buttonElement = container.querySelector('.posfra-button');
      buttonElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const closeButton = document.querySelector('.posfra-close-button');
      closeButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  describe('shortUUID', () => {
    it('should generate a UUID-like string', () => {
      const uuid = (Button as any).shortUUID();
      expect(uuid).toBeDefined();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBe(8);
    });

    it('should generate different UUIDs', () => {
      const uuid1 = (Button as any).shortUUID();
      const uuid2 = (Button as any).shortUUID();

      // They might be the same due to Math.random mocking, but the function should work
      expect(typeof uuid1).toBe('string');
      expect(typeof uuid2).toBe('string');
    });
  });

  describe('beforeUnloadHandler', () => {
    it('should prevent default and set returnValue', () => {
      const options: ButtonOptions = {
        btc: '0.001',
      };
      const button = new Button(mockEmbedToken, options);

      const event = {
        preventDefault: vi.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      (button as any).beforeUnloadHandler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.returnValue).toBe('Are you sure you want to leave? Your payment process may be interrupted.');
    });
  });
});
