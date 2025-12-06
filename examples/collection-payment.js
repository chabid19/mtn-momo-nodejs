const { Client, MoMoError } = require('../dist');

// Configuration
const config = {
    environment: 'sandbox',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
    apiUser: 'YOUR_API_USER',
    apiKey: 'YOUR_API_KEY',
};

const client = new Client(config);

async function main() {
    try {
        const collection = client.collection();

        // 1. Request to Pay
        const referenceId = await collection.requestToPay({
            amount: '500',
            currency: 'EUR',
            externalId: '123456',
            payer: {
                partyIdType: 'MSISDN',
                partyId: '256774290781',
            },
            payerMessage: 'Payment for order #123',
            payeeNote: 'Thank you',
        });

        console.log('Request to pay initiated. Reference ID:', referenceId);

        // 2. Check Status
        const status = await collection.getTransactionStatus(referenceId);
        console.log('Transaction Status:', status);

    } catch (error) {
        if (error instanceof MoMoError) {
            console.error('MoMo Error:', error.message);
        } else {
            console.error('Unexpected Error:', error);
        }
    }
}

main();
