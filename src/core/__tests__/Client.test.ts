import { Client } from '../Client';
import { Collection } from '../../services/Collection';
import { Disbursement } from '../../services/Disbursement';
import { Remittance } from '../../services/Remittance';
import { MoMoConfig } from '../../types';

describe('Client', () => {
    const config: MoMoConfig = {
        subscriptionKey: 'test-key',
        apiUser: 'test-user',
        apiKey: 'test-api-key',
        environment: 'sandbox',
        callbackUrl: 'https://callback.url',
    };

    let client: Client;

    beforeEach(() => {
        client = new Client(config);
    });

    it('should instantiate Collection service', () => {
        const collection = client.collection();
        expect(collection).toBeInstanceOf(Collection);
    });

    it('should instantiate Disbursement service', () => {
        const disbursement = client.disbursement();
        expect(disbursement).toBeInstanceOf(Disbursement);
    });

    it('should instantiate Remittance service', () => {
        const remittance = client.remittance();
        expect(remittance).toBeInstanceOf(Remittance);
    });
});
