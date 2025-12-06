import { Collection } from '../Collection';
import { Auth } from '../../core/Auth';
import { MoMoConfig } from '../../types';
import { Request } from '../../core/Request';

jest.mock('../../core/Auth');
jest.mock('../../core/Request');

describe('Collection', () => {
    let collection: Collection;
    let mockAuth: jest.Mocked<Auth>;
    let mockRequest: jest.Mocked<Request>;
    const config: MoMoConfig = {
        environment: 'sandbox',
        subscriptionKey: 'test-key',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockAuth = {
            getToken: jest.fn(),
        } as unknown as jest.Mocked<Auth>;

        mockRequest = {
            post: jest.fn(),
            get: jest.fn(),
            // Mock internal config access if needed, but we mock methods directly
            ['config']: { environment: 'sandbox' }
        } as unknown as jest.Mocked<Request>;

        (Request as jest.Mock).mockImplementation(() => mockRequest);

        mockAuth.getToken.mockResolvedValue('mock-token');

        collection = new Collection(config, mockAuth);
        // Inject mock request (since it's protected)
        (collection as any).request = mockRequest;
    });

    it('should request to pay', async () => {
        mockRequest.post.mockResolvedValue({});

        const params = {
            amount: '100',
            currency: 'EUR',
            externalId: '123',
            payer: { partyIdType: 'MSISDN' as const, partyId: '1234567890' },
            payerMessage: 'msg',
            payeeNote: 'note',
        };

        const refId = await collection.requestToPay(params);

        expect(refId).toBeDefined();
        expect(mockRequest.post).toHaveBeenCalledWith(
            '/collection/v1_0/requesttopay',
            params,
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                }),
            })
        );
    });
});
