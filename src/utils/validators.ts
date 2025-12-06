export function validatePhoneNumber(phoneNumber: string): boolean {
    // Basic MSISDN validation: 10-15 digits
    // This is a generic validation. Specific country rules might apply.
    return /^\d{10,15}$/.test(phoneNumber);
}

export function validateAmount(amount: string): boolean {
    // Positive number string, max 2 decimal places
    return /^\d+(\.\d{1,2})?$/.test(amount) && parseFloat(amount) > 0;
}

export function validateUuid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}
