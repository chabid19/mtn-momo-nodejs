import { Auth } from '../Auth';
import { Request } from '../Request';
import { MoMoConfig } from '../../types';

jest.mock('../Request');

describe('Auth', () => {
    let auth: Auth;
    let mockRequest: jest.Mocked<Request>;
    const config: MoMoConfig = {
        environment: 'sandbox',
        subscriptionKey: 'test-key',
        apiUser: 'test-user',
        apiKey: 'test-api-key',
    };

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Setup mock Request instance
        mockRequest = {
            post: jest.fn(),
            get: jest.fn(),
        } as unknown as jest.Mocked<Request>;

        (Request as jest.Mock).mockImplementation(() => mockRequest);

        auth = new Auth(config);
    });

    it('should update config correctly', async () => {
        auth.updateConfig({ apiUser: 'new-user', apiKey: 'new-key' });

        // Setup mock for getToken
        const mockResponse = {
            access_token: 'new-token',
            token_type: 'Bearer',
            expires_in: 3600
        };
        mockRequest.post.mockResolvedValue(mockResponse);

        await auth.getToken('collection');

        // Check if the auth header was constructed with new credentials
        const expectedAuth = Buffer.from('new-user:new-key').toString('base64');
        expect(mockRequest.post).toHaveBeenCalledWith(
            '/collection/token/',
            {},
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: `Basic ${expectedAuth}`
                })
            })
        );
    });

    it('should get token successfully', async () => {
        mockRequest.post.mockResolvedValue({
            access_token: 'token',
            expires_in: 3600,
            token_type: 'Bearer',
        });

        const token = await auth.getToken('collection');
        expect(token).toBe('token');
        expect(mockRequest.post).toHaveBeenCalledWith(
            '/collection/token/',
            {},
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: expect.stringContaining('Basic'),
                }),
            })
        );
    });

    it('should use cached token if valid', async () => {
        mockRequest.post.mockResolvedValue({
            access_token: 'token',
            expires_in: 3600,
            token_type: 'Bearer',
        });

        await auth.getToken('collection');
        await auth.getToken('collection');

        expect(mockRequest.post).toHaveBeenCalledTimes(1);
    });
    it('should throw error if apiUser or apiKey is missing', async () => {
        const invalidConfig = { ...config, apiUser: undefined };
        const invalidAuth = new Auth(invalidConfig);

        await expect(invalidAuth.getToken('collection')).rejects.toThrow(
            'API User and API Key are required to get a token'
        );
    });

    describe('createApiUser', () => {
        it('should create api user successfully', async () => {
            mockRequest.post.mockResolvedValue({});
            const callbackUrl = 'https://callback.url';

            const referenceId = await auth.createApiUser(callbackUrl);

            expect(referenceId).toBeDefined();
            expect(mockRequest.post).toHaveBeenCalledWith(
                '/v1_0/apiuser',
                { providerCallbackHost: callbackUrl },
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Reference-Id': referenceId
                    })
                })
            );
        });
    });

    describe('createApiKey', () => {
        it('should create api key successfully', async () => {
            const mockApiKey = 'test-api-key-123';
            mockRequest.post.mockResolvedValue({ apiKey: mockApiKey });
            const apiUser = 'test-user-id';

            const apiKey = await auth.createApiKey(apiUser);

            expect(apiKey).toBe(mockApiKey);
            expect(mockRequest.post).toHaveBeenCalledWith(
                `/v1_0/apiuser/${apiUser}/apikey`
            );
        });
    });
});
