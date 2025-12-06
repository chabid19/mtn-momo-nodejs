import { MoMoError } from '../utils/errors';

export type Environment = 'sandbox' | 'production';

export interface MoMoConfig {
    environment: Environment;
    subscriptionKey: string;
    callbackUrl?: string;
    apiUser?: string;
    apiKey?: string;
    timeout?: number;
    retryAttempts?: number;
    baseUrl?: string; // Optional override
}

export interface AccessToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    expires_at?: number; // Calculated expiration timestamp
}

export interface TokenCache {
    [product: string]: AccessToken | null;
}

export interface Party {
    partyIdType: 'MSISDN' | 'EMAIL' | 'PARTY_CODE';
    partyId: string;
}

export interface Money {
    amount: string;
    currency: string;
}

export interface RequestToPayParams {
    amount: string;
    currency: string;
    externalId: string;
    payer: Party;
    payerMessage?: string;
    payeeNote?: string;
}

export interface TransferParams {
    amount: string;
    currency: string;
    externalId: string;
    payee: Party;
    payerMessage?: string;
    payeeNote?: string;
}

export interface AccountBalance {
    availableBalance: string;
    currency: string;
}

export interface TransactionStatus {
    financialTransactionId?: string;
    externalId: string;
    amount: string;
    currency: string;
    payer: Party;
    payee?: Party;
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    reason?: MoMoError; // Using MoMoError type for reason if applicable, or just string
}

export interface AccountHolderStatus {
    result: boolean;
}
