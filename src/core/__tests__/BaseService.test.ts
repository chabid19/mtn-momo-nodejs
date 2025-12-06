import { BaseService } from '../BaseService';
import { Auth } from '../Auth';
import { MoMoConfig } from '../../types';
import { MoMoError } from '../../utils/errors';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Concrete implementation of BaseService for testing
class TestService extends BaseService {
    constructor(config: MoMoConfig, auth: Auth) {
        super(config, auth, 'test-product');
    }
}

describe('BaseService', () => {
    let service: TestService;
    let authMock: Auth;
    let mockAxiosInstance: any;

    const config: MoMoConfig = {
        environment: 'sandbox',
        subscriptionKey: 'test-key',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockAxiosInstance = {
            interceptors: {
                response: { use: jest.fn() },
            },
            get: jest.fn(),
            defaults: { headers: { common: {} } },
        };
        mockedAxios.create.mockReturnValue(mockAxiosInstance);

        authMock = new Auth(config);
        // Mock getToken to return a dummy token
        jest.spyOn(authMock, 'getToken').mockResolvedValue('mock-token');

        service = new TestService(config, authMock);
    });

    describe('validateAccountHolder', () => {
        it('should return true when account is active', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: { result: true } });

            const result = await service.validateAccountHolder('MSISDN', '1234567890');
            expect(result).toBe(true);
        });

        it('should return false when account is explicitly inactive', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: { result: false } });

            const result = await service.validateAccountHolder('MSISDN', '1234567890');
            expect(result).toBe(false);
        });

        it('should return false when API returns 404', async () => {
            const error: any = new Error('Not Found');
            error.response = { status: 404 };
            mockAxiosInstance.get.mockRejectedValue(error);

            const result = await service.validateAccountHolder('MSISDN', '1234567890');
            expect(result).toBe(false);
        });

        it('should THROW when API returns 500', async () => {
            const error: any = new Error('Server Error');
            error.response = { status: 500 };
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(service.validateAccountHolder('MSISDN', '1234567890'))
                .rejects.toThrow('Server Error');
        });

        it('should THROW when API returns network error', async () => {
            const error: any = new Error('Network Error');
            // No response object for network errors often
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(service.validateAccountHolder('MSISDN', '1234567890'))
                .rejects.toThrow('Network Error');
        });
    });
});
