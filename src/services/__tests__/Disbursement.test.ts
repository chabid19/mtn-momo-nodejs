import { Disbursement } from '../Disbursement';
import { Auth } from '../../core/Auth';
import { MoMoConfig } from '../../types';
import { Request } from '../../core/Request';

jest.mock('../../core/Auth');
jest.mock('../../core/Request');

describe('Disbursement', () => {
    let disbursement: Disbursement;
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
            ['config']: { environment: 'sandbox' }
        } as unknown as jest.Mocked<Request>;

        (Request as jest.Mock).mockImplementation(() => mockRequest);

        mockAuth.getToken.mockResolvedValue('mock-token');

        disbursement = new Disbursement(config, mockAuth);
        (disbursement as any).request = mockRequest;
    });

    it('should transfer funds', async () => {
        mockRequest.post.mockResolvedValue({});

        const params = {
            amount: '100',
            currency: 'EUR',
            externalId: '123',
            payee: { partyIdType: 'MSISDN' as const, partyId: '1234567890' },
            payerMessage: 'msg',
            payeeNote: 'note',
        };

        const refId = await disbursement.transfer(params);

        expect(refId).toBeDefined();
        expect(mockRequest.post).toHaveBeenCalledWith(
            '/disbursement/v1_0/transfer',
            params,
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                }),
            })
        );
    });
});
