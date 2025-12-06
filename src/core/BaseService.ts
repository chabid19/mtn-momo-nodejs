import { v4 as uuidv4 } from 'uuid';
import { Request } from './Request';
import { Auth } from './Auth';
import { MoMoConfig, AccountBalance, AccountHolderStatus, Party } from '../types';

export abstract class BaseService {
    protected request: Request;
    protected auth: Auth;
    protected product: string;

    constructor(config: MoMoConfig, auth: Auth, product: string) {
        this.request = new Request(config);
        this.auth = auth;
        this.product = product;
    }

    protected async getAuthHeader(): Promise<{ Authorization: string }> {
        const token = await this.auth.getToken(this.product);
        return { Authorization: `Bearer ${token}` };
    }

    protected async getCommonHeaders(referenceId?: string): Promise<any> {
        const authHeader = await this.getAuthHeader();
        return {
            ...authHeader,
            'X-Reference-Id': referenceId || uuidv4(),
            'X-Target-Environment': this.request['config'].environment, // Accessing config via request or storing it
        };
    }

    // Helper to access config environment if needed, or just pass it in constructor
    protected getEnvironment(): string {
        return this.request['config'].environment;
    }

    public async getAccountBalance(): Promise<AccountBalance> {
        const headers = await this.getCommonHeaders();
        // GET /{product}/v1_0/account/balance
        return this.request.get<AccountBalance>(
            `/${this.product}/v1_0/account/balance`,
            { headers }
        );
    }

    public async validateAccountHolder(
        partyIdType: string,
        partyId: string
    ): Promise<boolean> {
        const headers = await this.getCommonHeaders();
        // GET /{product}/v1_0/accountholder/{partyIdType}/{partyId}/active
        try {
            const response = await this.request.get<AccountHolderStatus>(
                `/${this.product}/v1_0/accountholder/${partyIdType}/${partyId}/active`,
                { headers }
            );
            return response.result;
        } catch (error: any) {
            // If the status is 404, it means the account holder is not found/not active
            if (error?.response?.status === 404) {
                return false;
            }
            // For any other error (network, 401, 500), we should rethrow
            throw error;
        }
    }
}
