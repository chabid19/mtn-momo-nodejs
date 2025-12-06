const { Client } = require('../dist');

const config = {
    environment: 'sandbox',
    subscriptionKey: 'YOUR_DISBURSEMENT_KEY',
    apiUser: 'YOUR_API_USER',
    apiKey: 'YOUR_API_KEY',
};

const client = new Client(config);

async function main() {
    try {
        const disbursement = client.disbursement();

        const referenceId = await disbursement.transfer({
            amount: '100',
            currency: 'EUR',
            externalId: 'transfer-123',
            payee: {
                partyIdType: 'MSISDN',
                partyId: '256774290781',
            },
            payerMessage: 'Salary payment',
            payeeNote: 'Salary',
        });

        console.log('Transfer initiated. Reference ID:', referenceId);

        const status = await disbursement.getTransferStatus(referenceId);
        console.log('Transfer Status:', status);

    } catch (error) {
        console.error(error);
    }
}

main();
