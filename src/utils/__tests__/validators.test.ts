import { validatePhoneNumber, validateAmount, validateUuid } from '../validators';
import { MoMoValidationError } from '../errors';

describe('Validators', () => {
    describe('validatePhoneNumber', () => {
        it('should return true for valid phone numbers', () => {
            expect(validatePhoneNumber('256774290781')).toBe(true);
            expect(validatePhoneNumber('233244567890')).toBe(true);
        });

        it('should return false for invalid phone numbers', () => {
            expect(validatePhoneNumber('123')).toBe(false);
            expect(validatePhoneNumber('abc')).toBe(false);
        });
    });

    describe('validateAmount', () => {
        it('should return true for valid amounts', () => {
            expect(validateAmount('100')).toBe(true);
            expect(validateAmount('100.50')).toBe(true);
        });

        it('should return false for invalid amounts', () => {
            expect(validateAmount('-100')).toBe(false);
            expect(validateAmount('abc')).toBe(false);
            expect(validateAmount('0')).toBe(false);
        });
    });

    describe('validateUuid', () => {
        it('should return true for valid UUIDs', () => {
            expect(validateUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
        });

        it('should return false for invalid UUIDs', () => {
            expect(validateUuid('invalid-uuid')).toBe(false);
            expect(validateUuid('123')).toBe(false);
        });
    });
});
