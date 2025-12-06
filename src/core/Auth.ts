import { v4 as uuidv4 } from 'uuid';
import { Request } from './Request';
import { MoMoConfig, AccessToken, TokenCache } from '../types';
import { MoMoAuthError } from '../utils/errors';

export class Auth {
    private request: Request;
    private config: MoMoConfig;
    private tokenCache: TokenCache = {};

    constructor(config: MoMoConfig) {
        this.config = config;
        this.request = new Request(config);
    }

    public updateConfig(config: Partial<MoMoConfig>) {
        this.config = { ...this.config, ...config };
        this.request = new Request(this.config);
    }

    public async createApiUser(callbackUrl: string): Promise<string> {
        const referenceId = uuidv4();
        // Sandbox provisioning endpoint
        await this.request.post(
            '/v1_0/apiuser',
            { providerCallbackHost: callbackUrl },
            {
                headers: {
                    'X-Reference-Id': referenceId,
                },
            },
        );
        return referenceId;
    }

    public async createApiKey(apiUser: string): Promise<string> {
        const response = await this.request.post<{ apiKey: string }>(
            `/v1_0/apiuser/${apiUser}/apikey`,
        );
        return response.apiKey;
    }

    public async getToken(product: string): Promise<string> {
        // Check cache
        const cached = this.tokenCache[product];
        if (cached && cached.expires_at && cached.expires_at > Date.now()) {
            return cached.access_token;
        }

        if (!this.config.apiUser || !this.config.apiKey) {
            throw new MoMoAuthError('API User and API Key are required to get a token');
        }

        const auth = Buffer.from(`${this.config.apiUser}:${this.config.apiKey}`).toString('base64');

        const response = await this.request.post<AccessToken>(
            `/${product}/token/`,
            {},
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            },
        );

        // Cache token
        // expires_in is in seconds. Let's buffer by 60s.
        const expiresAt = Date.now() + (response.expires_in - 60) * 1000;
        this.tokenCache[product] = { ...response, expires_at: expiresAt };

        return response.access_token;
    }
}
