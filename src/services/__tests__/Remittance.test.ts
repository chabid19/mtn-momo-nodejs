import { Remittance } from '../Remittance';
import { Auth } from '../../core/Auth';
import { Request } from '../../core/Request';
import { MoMoConfig } from '../../types';

jest.mock('../../core/Auth');
jest.mock('../../core/Request');

describe('Remittance', () => {
    let remittance: Remittance;
    let mockAuth: jest.Mocked<Auth>;
    let mockRequest: jest.Mocked<Request>;

    const config: MoMoConfig = {
        subscriptionKey: 'test-key',
        apiUser: 'test-user',
        apiKey: 'test-api-key',
        environment: 'sandbox',
        callbackUrl: 'https://callback.url',
    };

    beforeEach(() => {
        mockAuth = new Auth(config) as jest.Mocked<Auth>;
        mockRequest = new Request(config) as jest.Mocked<Request>;
        // @ts-ignore
        mockRequest.config = config;

        // Mock getToken to return a dummy token
        mockAuth.getToken.mockResolvedValue('test-token');

        remittance = new Remittance(config, mockAuth);
        // Inject mock request
        (remittance as any).request = mockRequest;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('transfer', () => {
        it('should initiate a transfer successfully', async () => {
            mockRequest.post.mockResolvedValue({});

            const params = {
                amount: '100',
                currency: 'EUR',
                externalId: '123456',
                payee: {
                    partyIdType: 'MSISDN' as const,
                    partyId: '256774290781'
                },
                payerMessage: 'Test transfer',
                payeeNote: 'Test note'
            };

            const referenceId = await remittance.transfer(params);

            expect(referenceId).toBeDefined();
            expect(mockRequest.post).toHaveBeenCalledWith(
                '/remittance/v1_0/transfer',
                params,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Reference-Id': referenceId,
                        'Authorization': 'Bearer test-token',
                        'X-Target-Environment': 'sandbox'
                    })
                })
            );
        });
    });

    describe('getAccountBalance', () => {
        it('should get account balance successfully', async () => {
            const mockBalance = {
                availableBalance: '1000',
                currency: 'EUR'
            };

            mockRequest.get.mockResolvedValue(mockBalance);

            const balance = await remittance.getAccountBalance();

            expect(balance).toEqual(mockBalance);
            expect(mockRequest.get).toHaveBeenCalledWith(
                '/remittance/v1_0/account/balance',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                        'X-Target-Environment': 'sandbox'
                    })
                })
            );
        });
    });

    describe('validateAccountHolder', () => {
        it('should validate account holder successfully', async () => {
            mockRequest.get.mockResolvedValue({ result: true });

            const isValid = await remittance.validateAccountHolder('MSISDN', '256774290781');

            expect(isValid).toBe(true);
            expect(mockRequest.get).toHaveBeenCalledWith(
                '/remittance/v1_0/accountholder/MSISDN/256774290781/active',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                        'X-Target-Environment': 'sandbox'
                    })
                })
            );
        });

        it('should return false on validation error', async () => {
            const error: any = new Error('Failed');
            error.response = { status: 404 };
            mockRequest.get.mockRejectedValue(error);

            const isValid = await remittance.validateAccountHolder('MSISDN', '256774290781');

            expect(isValid).toBe(false);
        });
    });

    describe('getTransferStatus', () => {
        it('should get transfer status successfully', async () => {
            const mockStatus = {
                amount: '100',
                currency: 'EUR',
                financialTransactionId: '12345',
                externalId: '123456',
                payer: {
                    partyIdType: 'MSISDN' as const,
                    partyId: '256774290781'
                },
                status: 'SUCCESSFUL' as const
            };

            mockRequest.get.mockResolvedValue(mockStatus);

            const referenceId = 'test-ref-id';
            const status = await remittance.getTransferStatus(referenceId);

            expect(status).toEqual(mockStatus);
            expect(mockRequest.get).toHaveBeenCalledWith(
                `/remittance/v1_0/transfer/${referenceId}`,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                        'X-Target-Environment': 'sandbox'
                    })
                })
            );
        });
    });

    describe('getCashTransferStatus', () => {
        it('should get cash transfer status successfully', async () => {
            const mockStatus = {
                amount: '100',
                currency: 'EUR',
                financialTransactionId: '12345',
                externalId: '123456',
                payer: {
                    partyIdType: 'MSISDN' as const,
                    partyId: '256774290781'
                },
                status: 'SUCCESSFUL' as const
            };

            mockRequest.get.mockResolvedValue(mockStatus);

            const referenceId = 'test-ref-id';
            const status = await remittance.getCashTransferStatus(referenceId);

            expect(status).toEqual(mockStatus);
            expect(mockRequest.get).toHaveBeenCalledWith(
                `/remittance/v1_0/cashtransfer/${referenceId}`,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                        'X-Target-Environment': 'sandbox'
                    })
                })
            );
        });
    });
});
