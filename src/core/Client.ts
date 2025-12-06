import { Auth } from './Auth';
import { Collection } from '../services/Collection';
import { Disbursement } from '../services/Disbursement';
import { Remittance } from '../services/Remittance';
import { MoMoConfig } from '../types';

export class Client {
    private config: MoMoConfig;
    private auth: Auth;

    constructor(config: MoMoConfig) {
        this.config = config;
        this.auth = new Auth(config);
    }

    public updateConfig(config: Partial<MoMoConfig>) {
        this.config = { ...this.config, ...config };
        this.auth.updateConfig(config);
    }

    public collection(): Collection {
        return new Collection(this.config, this.auth);
    }

    public disbursement(): Disbursement {
        return new Disbursement(this.config, this.auth);
    }

    public remittance(): Remittance {
        return new Remittance(this.config, this.auth);
    }
}
