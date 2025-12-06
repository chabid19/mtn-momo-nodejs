# mtn-momo-nodejs
Un kit de développement logiciel (SDK) Node.js professionnel, robuste et facile à utiliser pour l'intégration des API MTN Mobile Money (collecte, décaissement, transfert de fonds).
# 💰 MTN MoMo SDK for Node.js

[![npm version](https://badge.fury.io/js/%40chabifadeen%2Fmtn-momo.svg)](https://www.npmjs.com/package/@chabifadeen/mtn-momo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A professional, robust, and easy-to-use Node.js SDK for integrating MTN Mobile Money APIs (Collection, Disbursement, Remittance).

## ✨ Features

- 🔐 **Automatic Authentication**: Token generation, caching, and auto-refresh
- 📦 **Modular Services**: Separate modules for Collection, Disbursement, and Remittance
- 🛡️ **Full TypeScript Support**: Complete type definitions and IntelliSense
- ⚡ **Promise-based API**: Modern async/await syntax
- 🔄 **Sandbox & Production**: Easy environment switching
- 🧪 **Well Tested**: Comprehensive unit test coverage
- 🚨 **Error Handling**: Custom error classes for better debugging

## 📦 Installation
```bash
npm install @chabifadeen/mtn-momo
```

or with yarn:
```bash
yarn add @chabifadeen/mtn-momo
```

## 🚀 Quick Start

### 1. Configuration
```typescript
import { Client, MoMoConfig } from '@chabifadeen/mtn-momo';

const config: MoMoConfig = {
  environment: 'sandbox', // or 'production'
  subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
  apiUser: 'YOUR_API_USER',
  apiKey: 'YOUR_API_KEY',
  callbackUrl: 'https://your-webhook.com/callback', // Optional
};

const client = new Client(config);
```

### 2. Collection API (Request to Pay)

Request payment from a customer:
```typescript
const collection = client.collection();

// Request payment
const referenceId = await collection.requestToPay({
  amount: '500',
  currency: 'EUR',
  externalId: 'order-123',
  payer: {
    partyIdType: 'MSISDN',
    partyId: '256774290781',
  },
  payerMessage: 'Payment for goods',
  payeeNote: 'Thanks for your purchase',
});

console.log('Transaction Reference:', referenceId);

// Check transaction status
const status = await collection.getTransactionStatus(referenceId);
console.log('Status:', status.status); // SUCCESSFUL, FAILED, PENDING
console.log('Amount:', status.amount);
console.log('Currency:', status.currency);

// Get account balance
const balance = await collection.getAccountBalance();
console.log('Available Balance:', balance.availableBalance);

// Validate account holder
const isValid = await collection.validateAccountHolder({
  partyIdType: 'MSISDN',
  partyId: '256774290781',
});
console.log('Account Valid:', isValid);
```

### 3. Disbursement API (Transfer Money)

Transfer money to a recipient:
```typescript
const disbursement = client.disbursement();

// Transfer money
const referenceId = await disbursement.transfer({
  amount: '100',
  currency: 'EUR',
  externalId: 'salary-001',
  payee: {
    partyIdType: 'MSISDN',
    partyId: '256774290781',
  },
  payerMessage: 'Salary payment',
  payeeNote: 'Monthly salary - November 2024',
});

// Check transfer status
const status = await disbursement.getTransferStatus(referenceId);
console.log('Transfer Status:', status.status);

// Get account balance
const balance = await disbursement.getAccountBalance();
console.log('Balance:', balance);
```

### 4. Remittance API (International Transfers)

Send money internationally:
```typescript
const remittance = client.remittance();

// Send remittance
const referenceId = await remittance.transfer({
  amount: '200',
  currency: 'EUR',
  externalId: 'remit-001',
  payee: {
    partyIdType: 'MSISDN',
    partyId: '256774290781',
  },
  payerMessage: 'Money transfer',
  payeeNote: 'Family support',
});

// Check status
const status = await remittance.getTransferStatus(referenceId);
console.log('Remittance Status:', status);
```

## 🔧 Advanced Usage

### Custom Configuration
```typescript
const config: MoMoConfig = {
  environment: 'production',
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY!,
  apiUser: process.env.MTN_API_USER!,
  apiKey: process.env.MTN_API_KEY!,
  callbackUrl: 'https://api.myapp.com/webhooks/mtn',
  timeout: 30000, // Request timeout in ms
  retryAttempts: 3, // Number of retry attempts
};
```

### Environment Variables

Create a `.env` file:
```env
MTN_ENVIRONMENT=sandbox
MTN_SUBSCRIPTION_KEY=your_subscription_key
MTN_API_USER=your_api_user
MTN_API_KEY=your_api_key
MTN_CALLBACK_URL=https://your-webhook.com/callback
```

Then use in your code:
```typescript
import * as dotenv from 'dotenv';
dotenv.config();

const config: MoMoConfig = {
  environment: process.env.MTN_ENVIRONMENT as 'sandbox' | 'production',
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY!,
  apiUser: process.env.MTN_API_USER!,
  apiKey: process.env.MTN_API_KEY!,
  callbackUrl: process.env.MTN_CALLBACK_URL,
};
```

### Error Handling

The SDK provides custom error classes for better error handling:
```typescript
import {
  MoMoError,
  MoMoAuthError,
  MoMoValidationError,
  MoMoTransactionError,
  MoMoNetworkError
} from '@chabifadeen/mtn-momo';

try {
  const referenceId = await collection.requestToPay({
    // ... payment details
  });
} catch (error) {
  if (error instanceof MoMoAuthError) {
    console.error('Authentication failed:', error.message);
    // Handle authentication issues (refresh credentials, etc.)
  } else if (error instanceof MoMoValidationError) {
    console.error('Validation error:', error.message);
    // Handle validation errors (check input data)
  } else if (error instanceof MoMoTransactionError) {
    console.error('Transaction failed:', error.message, error.code);
    // Handle transaction failures
  } else if (error instanceof MoMoNetworkError) {
    console.error('Network error:', error.message);
    // Handle network issues (retry, etc.)
  } else if (error instanceof MoMoError) {
    console.error('MoMo error:', error.message);
    // Handle generic MoMo errors
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Webhook Handling

Handle MTN callbacks in your Express app:
```typescript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhooks/mtn', (req, res) => {
  const notification = req.body;
  
  console.log('Payment notification:', notification);
  console.log('Reference ID:', notification.referenceId);
  console.log('Status:', notification.status);
  console.log('Amount:', notification.amount);
  
  // Process the notification
  // Update your database, send confirmation email, etc.
  
  res.sendStatus(200);
});

app.listen(3000);
```

## 🧪 Testing

The SDK includes comprehensive tests. Run them with:
```bash
npm test
```

For coverage report:
```bash
npm run test:coverage
```

## 📖 API Reference

### Client
```typescript
new Client(config: MoMoConfig)
```

### Collection Service

- `requestToPay(params)` - Request payment from customer
- `getTransactionStatus(referenceId)` - Get transaction status
- `getAccountBalance()` - Get account balance
- `validateAccountHolder(params)` - Validate account holder
- `getAccountInfo(accountHolderId)` - Get account information

### Disbursement Service

- `transfer(params)` - Transfer money to recipient
- `getTransferStatus(referenceId)` - Get transfer status
- `getAccountBalance()` - Get account balance
- `validateAccountHolder(params)` - Validate recipient

### Remittance Service

- `transfer(params)` - Send international transfer
- `getTransferStatus(referenceId)` - Get transfer status
- `getAccountBalance()` - Get account balance

## 🌍 Supported Countries

MTN Mobile Money is available in multiple African countries. Check [MTN's official documentation](https://momodeveloper.mtn.com/) for the latest list of supported countries and currencies.

## 📚 Resources

- [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
- [API Documentation](https://momodeveloper.mtn.com/api-documentation)
- [Sandbox Testing](https://momodeveloper.mtn.com/docs/services/sandbox-provisioning-api)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**CHABI DOSSOUMON Abdou Fawaz**

- GitHub: [@chabid19](https://github.com/chabid19)
- Email: chabifadeen@gmail.com

## ⭐ Support

If you find this SDK helpful, please give it a star on GitHub!

---

Made with ❤️ for the African developer community