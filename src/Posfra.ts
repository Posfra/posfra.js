'use strict';

import Button, { type ButtonOptions } from './Button';

// Extend Window interface for global Posfra access
declare global {
    interface Window {
        Posfra: typeof Posfra;
    }
}

/**
 * Posfra.js.
 * 
 * This SDK provides functionality to embedded payment buttons into any website.
 * 
 * @example
 * ```typescript
 * // Programmatic usage
 * const posfra = new Posfra('your-embed-token');
 * const button = posfra.createPayWithBitcoinButton(
 *   document.getElementById('payment-container'),
 *   {
 *     btc: '0.001',
 *     redirectURL: 'https://example.com/success',
 *     ref: 'unique-reference-id'
 *   }
 * );
 * 
 * // Listen to payment events
 * button.container?.addEventListener('onPaymentAccepted', (e) => {
 *   console.log('Payment accepted!', e.detail);
 * });
 * ```
 * 
 * @example
 * ```html
 * <!-- HTML declarative usage -->
 * <div 
 *   class="posfra-button"
 *   embed-token="your-embed-token"
 *   btc="0.002"
 *   redirect-url="https://example.com/success"
 *   ref="unique-reference-id"
 * ></div>
 * ```
 */
class Posfra {

    private embedToken: string = '';

    /**
     * Creates a new Posfra instance.
     * 
     * @param embedToken - Your unique embed token for authenticating payment requests.
     *                     This token is provided by Posfra when you create an account.
     * 
     * @example
     * ```typescript
     * const posfra = new Posfra('your-embed-token-here');
     * ```
     */
    constructor(embedToken: string) {
        if (!embedToken) throw new Error('Embed token is required to initialize Posfra.js');
        this.embedToken = embedToken;
    }

    /**
     * Creates and renders a "Pay with Bitcoin" button in the specified DOM element.
     * 
     * This method creates a new Button instance, configures it with the provided options,
     * and renders it into the target element. The button will open a payment overlay when clicked.
     * 
     * @param element - The DOM element where the button will be rendered. This element will
     *                  receive the button as a child and can listen to payment events.
     * @param options - Configuration options for the payment button.
     * @param options.btc - The Bitcoin amount to charge (e.g., '0.001' for 0.001 BTC).
     * @param options.usd - The USD amount to charge (e.g., '50' for $50).
     * @param options.embedToken - Optional. Override the embed token (defaults to the instance token).
     * @param options.data - Optional. Additional data to pass with the payment (max 500 characters).
     * @param options.redirectURL - Optional. URL to redirect to after successful payment.
     * @param options.ref - Optional. Custom reference ID for tracking this payment. 
     *                     If not provided, a short UUID will be generated automatically.
     * 
     * @returns The created Button instance, which can be used to listen to payment events.
     * 
     * @example
     * ```typescript
     * const posfra = new Posfra('your-embed-token');
     * const container = document.getElementById('payment-container');
     * 
     * const button = posfra.createPayWithBitcoinButton(container, {
     *   btc: '0.001',
     *   redirectURL: 'https://example.com/success',
     *   ref: 'order-12345',
     *   data: JSON.stringify({ orderId: '12345', userId: 'user-789' })
     * });
     * ```
     * 
     * @throws {Error} If the embed token is invalid or missing.
     * @throws {Error} If the `btc` or `usd` attribute is missing.
     */
    public createPayWithBitcoinButton(element: Element, options: ButtonOptions): Button {
        const button = new Button(this.embedToken, options);
        button.build(element);
        return button;
    }

    /**
     * Automatically creates a payment button from an HTML element with data attributes.
     * 
     * This static method is used internally for automatic initialization of buttons
     * marked with the `posfra-button` class. It reads configuration from the element's
     * attributes and creates the button automatically.
     * 
     * **Required attributes:**
     * - `embed-token`: Your Posfra embed token
     * 
     * **Optional attributes:**
     * - `redirect-url`: URL to redirect after successful payment
     * - `usd`: The USD amount to charge
     * - `btc`: The Bitcoin amount to charge
     * - `ref`: Custom reference ID for tracking
     * - `data`: Additional data (max 500 characters)
     * 
     * @param element - The HTML element containing the payment button configuration.
     *                  Must have `embed-token` and `btc` or `usd` attributes.
     * 
     * @throws {Error} If the `embed-token` attribute is missing.
     * @throws {Error} If the `btc` or `usd` attribute is missing.
     * 
     * @example
     * ```html
     * <div 
     *   class="posfra-button"
     *   embed-token="your-embed-token"
     *   btc="0.001"
     *   redirect-url="https://example.com/success"
     *   ref="order-12345"
     *   data='{"orderId": "12345"}'
     * ></div>
     * ```
     * 
     * @example
     * ```typescript
     * // Manual initialization
     * const element = document.querySelector('.posfra-button');
     * if (element) {
     *   Posfra.createPayWithBitcoinButtonFromElement(element);
     * }
     * ```
     */
    static createPayWithBitcoinButtonFromElement(element: Element): void {
        const embedToken = element.getAttribute('embed-token');
        if (!embedToken) throw new Error('Missing embed-token attribute');
        const posfra = new Posfra(embedToken);
        posfra.createPayWithBitcoinButton(element, Button.getOptionsFromElement(element));
    }
}

function __posfraInit() {
    window.Posfra = Posfra;
    document.querySelectorAll('.posfra-button').forEach((element) => Posfra.createPayWithBitcoinButtonFromElement(element));
};

if (document) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        __posfraInit();
    } else {
        document.addEventListener('DOMContentLoaded', __posfraInit);
    }
}

export default Posfra;