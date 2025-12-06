export class MoMoError extends Error {
    constructor(
        public message: string,
        public code?: string,
        public details?: any,
    ) {
        super(message);
        this.name = 'MoMoError';
        Object.setPrototypeOf(this, MoMoError.prototype);
    }
}

export class MoMoAuthError extends MoMoError {
    constructor(message: string, details?: any) {
        super(message, 'AUTH_ERROR', details);
        this.name = 'MoMoAuthError';
        Object.setPrototypeOf(this, MoMoAuthError.prototype);
    }
}

export class MoMoNetworkError extends MoMoError {
    constructor(message: string, details?: any) {
        super(message, 'NETWORK_ERROR', details);
        this.name = 'MoMoNetworkError';
        Object.setPrototypeOf(this, MoMoNetworkError.prototype);
    }
}

export class MoMoValidationError extends MoMoError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'MoMoValidationError';
        Object.setPrototypeOf(this, MoMoValidationError.prototype);
    }
}
