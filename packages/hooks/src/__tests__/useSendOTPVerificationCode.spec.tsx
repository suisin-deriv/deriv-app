import { renderHook, act } from '@testing-library/react-hooks';
import { useMutation } from '@deriv/api';
import useSendOTPVerificationCode from '../useSendOTPVerificationCode';

jest.mock('@deriv/api', () => ({
    ...jest.requireActual('@deriv/api'),
    useMutation: jest.fn(),
}));

describe('useSendOTPVerificationCode', () => {
    const mockMutate = jest.fn();
    const mock_response = {
        data: null,
        mutate: mockMutate,
        error: {},
        isSuccess: false,
    };

    beforeEach(() => {
        (useMutation as jest.Mock).mockReturnValue(mock_response);
    });

    it('should return initial state correctly', () => {
        const { result } = renderHook(() => useSendOTPVerificationCode());

        expect(result.current.data).toBe(null);
        expect(result.current.phone_otp_error).toStrictEqual({});
        expect(result.current.phone_otp_error_message).toBe(undefined);
        expect(result.current.phone_number_verified).toBe(false);
    });

    it('should handle successful OTP submission', () => {
        mock_response.isSuccess = true;

        const { result } = renderHook(() => useSendOTPVerificationCode());

        act(() => {
            result.current.sendPhoneOTPVerification('123456');
        });

        expect(mockMutate).toHaveBeenCalledWith({ payload: { otp: '123456' } });

        expect(result.current.phone_number_verified).toBe(true);
    });

    it('should handle ExpiredCode error', () => {
        mock_response.error = { code: 'ExpiredCode', message: 'Code expired.' };

        const { result } = renderHook(() => useSendOTPVerificationCode());

        expect(result.current.phone_otp_error_message).toBe('Code expired. Please get a new one.');
    });

    it('should handle InvalidOTP error', () => {
        mock_response.error = { code: 'InvalidOTP', message: 'Invalid code.' };

        const { result } = renderHook(() => useSendOTPVerificationCode());

        expect(result.current.phone_otp_error_message).toBe('Invalid code. Please try again.');
    });

    it('should handle NoAttemptsLeft error', () => {
        mock_response.error = { code: 'NoAttemptsLeft', message: 'OTP limit reached.' };

        const { result } = renderHook(() => useSendOTPVerificationCode());

        expect(result.current.phone_otp_error_message).toBe('Invalid code. OTP limit reached.');
    });
});
