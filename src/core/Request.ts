import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { MoMoConfig } from '../types';
import { MoMoError, MoMoNetworkError, MoMoAuthError } from '../utils/errors';

export class Request {
    private client: AxiosInstance;
    private config: MoMoConfig;

    constructor(config: MoMoConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: this.getBaseUrl(),
            timeout: config.timeout || 30000,
            headers: {
                'Ocp-Apim-Subscription-Key': config.subscriptionKey,
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private getBaseUrl(): string {
        if (this.config.baseUrl) return this.config.baseUrl;
        return this.config.environment === 'sandbox'
            ? 'https://sandbox.momodeveloper.mtn.com'
            : 'https://ericssonbasicapi1.azure-api.net';
    }

    private setupInterceptors() {
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response) {
                    const status = error.response.status;
                    const data = error.response.data as any;
                    const message = data?.message || error.message;

                    if (status === 401) {
                        throw new MoMoAuthError('Unauthorized: Invalid credentials or token', data);
                    }
                    throw new MoMoNetworkError(`Request failed with status ${status}: ${message}`, data);
                } else if (error.request) {
                    throw new MoMoNetworkError('No response received from server', error.request);
                } else {
                    throw new MoMoError(error.message);
                }
            },
        );
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    public setHeader(key: string, value: string) {
        this.client.defaults.headers.common[key] = value;
    }
}
