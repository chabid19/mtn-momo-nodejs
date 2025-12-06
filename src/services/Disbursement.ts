import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '../core/BaseService';
import { MoMoConfig, TransferParams, TransactionStatus } from '../types';
import { Auth } from '../core/Auth';

export class Disbursement extends BaseService {
    constructor(config: MoMoConfig, auth: Auth) {
        super(config, auth, 'disbursement');
    }

    public async transfer(params: TransferParams): Promise<string> {
        const referenceId = uuidv4();
        const headers = await this.getCommonHeaders(referenceId);

        await this.request.post('/disbursement/v1_0/transfer', params, { headers });

        return referenceId;
    }

    public async getTransferStatus(
        referenceId: string,
    ): Promise<TransactionStatus> {
        const headers = await this.getCommonHeaders();
        return this.request.get<TransactionStatus>(
            `/disbursement/v1_0/transfer/${referenceId}`,
            { headers },
        );
    }
}
