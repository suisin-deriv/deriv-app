import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerifyButton } from '../verify-button';
import { StoreProvider, mockStore } from '@deriv/stores';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import { routes } from '@deriv/shared';
import { usePhoneNumberVerificationSetTimer, useVerifyEmail } from '@deriv/hooks';

jest.mock('@deriv/hooks', () => ({
    ...jest.requireActual('@deriv/hooks'),
    usePhoneNumberVerificationSetTimer: jest.fn(),
    useVerifyEmail: jest.fn(() => ({
        sendPhoneNumberVerifyEmail: jest.fn(),
        WS: {},
    })),
}));

describe('VerifyButton', () => {
    beforeEach(() => {
        (usePhoneNumberVerificationSetTimer as jest.Mock).mockReturnValue({ next_otp_request: '' });
    });
    const history = createBrowserHistory();
    const mock_store = mockStore({
        client: {
            account_settings: {
                phone_number_verification: {
                    verified: 0,
                },
            },
        },
    });

    const renderWithRouter = () => {
        return render(
            <Router history={history}>
                <StoreProvider store={mock_store}>
                    <VerifyButton is_verify_button_disabled={false} />
                </StoreProvider>
            </Router>
        );
    };

    it('should render Verify Button', () => {
        renderWithRouter();
        expect(screen.getByText('Verify')).toBeInTheDocument();
    });

    it('should redirect user to phone-verification page when clicked on Verify Button', () => {
        (useVerifyEmail as jest.Mock).mockReturnValue({
            sendPhoneNumberVerifyEmail: jest.fn(),
            WS: {
                isSuccess: true,
            },
        });
        renderWithRouter();
        const verifyButton = screen.getByText('Verify');
        userEvent.click(verifyButton);
        expect(history.location.pathname).toBe(routes.phone_verification);
    });

    it('should render Verified text', () => {
        if (mock_store.client.account_settings.phone_number_verification)
            mock_store.client.account_settings.phone_number_verification.verified = 1;
        renderWithRouter();
        expect(screen.getByText('Verified')).toBeInTheDocument();
    });
});
