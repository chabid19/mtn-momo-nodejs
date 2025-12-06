import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '../core/BaseService';
import { MoMoConfig } from '../types';
import { Auth } from '../core/Auth';
import { RequestToPayParams, TransactionStatus } from '../types';

export class Collection extends BaseService {
    constructor(config: MoMoConfig, auth: Auth) {
        super(config, auth, 'collection');
    }

    public async requestToPay(params: RequestToPayParams): Promise<string> {
        const referenceId = uuidv4();
        const headers = await this.getCommonHeaders(referenceId);

        // POST /collection/v1_0/requesttopay
        await this.request.post(
            '/collection/v1_0/requesttopay',
            params,
            { headers }
        );

        return referenceId;
    }

    public async getTransactionStatus(referenceId: string): Promise<TransactionStatus> {
        const headers = await this.getCommonHeaders();
        // GET /collection/v1_0/requesttopay/{referenceId}
        return this.request.get<TransactionStatus>(
            `/collection/v1_0/requesttopay/${referenceId}`,
            { headers }
        );
    }
}
