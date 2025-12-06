import axios, { AxiosError } from 'axios';
import { Request } from '../Request';
import { MoMoConfig } from '../../types';
import { MoMoAuthError, MoMoNetworkError, MoMoError } from '../../utils/errors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Request', () => {
    let request: Request;
    let mockAxiosInstance: any;
    let responseInterceptor: (error: any) => Promise<any>;

    const config: MoMoConfig = {
        environment: 'sandbox',
        subscriptionKey: 'test-key',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockAxiosInstance = {
            interceptors: {
                response: {
                    use: jest.fn((onFulfilled, onRejected) => {
                        responseInterceptor = onRejected;
                        return 1;
                    }),
                },
            },
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            defaults: { headers: { common: {} } },
        };

        mockedAxios.create.mockReturnValue(mockAxiosInstance);

        request = new Request(config);
    });

    it('should create axios instance with correct config', () => {
        expect(mockedAxios.create).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: 'https://sandbox.momodeveloper.mtn.com',
            headers: expect.objectContaining({
                'Ocp-Apim-Subscription-Key': 'test-key',
            }),
        }));
    });

    describe('HTTP Methods', () => {
        it('should make GET request', async () => {
            const mockData = { id: 1 };
            mockAxiosInstance.get.mockResolvedValue({ data: mockData });

            const result = await request.get('/test');
            expect(result).toEqual(mockData);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
        });

        it('should make POST request', async () => {
            const mockData = { id: 1 };
            const postData = { name: 'test' };
            mockAxiosInstance.post.mockResolvedValue({ data: mockData });

            const result = await request.post('/test', postData);
            expect(result).toEqual(mockData);
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData, undefined);
        });

        it('should make PUT request', async () => {
            const mockData = { id: 1 };
            const putData = { name: 'test' };
            mockAxiosInstance.put.mockResolvedValue({ data: mockData });

            const result = await request.put('/test', putData);
            expect(result).toEqual(mockData);
            expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', putData, undefined);
        });
    });

    describe('Interceptors', () => {
        it('should handle 401 Unauthorized', () => {
            const error = {
                response: {
                    status: 401,
                    data: { message: 'Unauthorized' }
                },
                message: 'Request failed'
            };

            expect(() => responseInterceptor(error)).toThrow(MoMoAuthError);
        });

        it('should handle other API errors', () => {
            const error = {
                response: {
                    status: 400,
                    data: { message: 'Bad Request' }
                },
                message: 'Request failed'
            };

            expect(() => responseInterceptor(error)).toThrow(MoMoNetworkError);
        });

        it('should handle network errors (no response)', () => {
            const error = {
                request: {},
                message: 'Network Error'
            };

            expect(() => responseInterceptor(error)).toThrow(MoMoNetworkError);
        });

        it('should handle generic errors', () => {
            const error = {
                message: 'Unknown Error'
            };

            expect(() => responseInterceptor(error)).toThrow(MoMoError);
        });
    });
});
