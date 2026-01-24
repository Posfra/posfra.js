
![Posfra.js Payment Widget](./assets/github-cover-image.jpg)


# Posfra.js

The Posfra.js SDK makes it quick and easy to integrate seamless Bitcoin payment experiences into your web applications. We provide ready-to-use, customizable UI components that securely handle the payment process. For full flexibility, you can also use our low-level JavaScript SDK to build fully custom payment flows tailored to your needs.

### Documentation: [docs.posfra.com](https://docs.posfra.com)

```html
<script src="https://cdn.posfra.com/posfra.js"></script>

<div 
  class="posfra-button"
  embed-token="f419128f528d75174399b3662a2e0ceaed29b98a59cbc9d33601fa2f903c1b6f"
  usd="50"
  redirect-url="https://yoursite.com/paid"
  ref="order-12345"
  data='{"customerId":"abc123"}'
></div>
```

## Advanced: JavaScript Initalization

Beyond simple integration with the HTML UI components, Posfra.js empowers developers to create tailor-made Bitcoin payment experiences using its low-level JavaScript SDK. This SDK exposes all core payment operations, so you can craft fully customized user flows, interact with the payment backend directly, and adapt the widget's logic as needed for your application.


```js
document.addEventListener('DOMContentLoaded', () => {
    const element = document.querySelector('#my-element');
    const embedToken = 'f419128f528d75174399b3662a2e0ceaed29b98a59cbc9d33601fa2f903c1b6f';
    const posfra = new Posfra(embedToken);
    posfra.createPayWithBitcoinButton(element, {
        btc: '0.002',
        ref: 'order-12345',
        redirectURL: 'https://yoursite.com/paid',
        data: '{"customerId":"abc123"}',
    });
});
```

## Events

You can listen for and respond to various events emitted throughout the paymnet lifecycle. These events allow you to track user interactions (such as opening or closing the payment window), get real-time updates to the payment status, and handle the outcome once a payment is accepted.

Below are all of events emitted by the payment button:

- `onOpenPaymentWindow`: Triggered when a user clicks the button to open the payment popup.
- `onClosePaymentWindow`: Triggered when the user closes the payment popup (either manually or after payment is complete).
- `onUpdated`: Fired whenever the transaction status changes or new data is available (providing updated transaction details).
- `onPaymentAccepted`: Fired when the payment is successfully accepted and confirmed, including transaction details (amount, ref, txid, etc.).

To listen to these events, you can use `addEventListener` on your payment element, as shown below:
```js
const element = document.getElementById('#my-element');

element.addEventListener('onOpenPaymentWindow', e => {
  console.log('User clicked the button and opend payment popup.');
});

element.addEventListener('onClosePaymentWindow', () => {
  console.log('User closed payment popup.');
});

element.addEventListener('onUpdated', (event) => {
    const transaction = event.detail;
    console.log(`The API resonded with ${transaction.status}`);
});

element.addEventListener('onPaymentAccepted', (event) => {
    const transaction = event.detail;
    console.log({
        ref: transaction.ref,
        amount: transaction.amount,
        txid: transaction.txid,
        isAccepted: transaction.isAccepted,
    });
});
```



## License
MIT &copy; 2026 Posfra.com
