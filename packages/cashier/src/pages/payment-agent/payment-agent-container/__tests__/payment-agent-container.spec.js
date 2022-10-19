import React from 'react';
import { fireEvent, screen, render } from '@testing-library/react';
import PaymentAgentContainer from '../payment-agent-container';
import { isMobile } from '@deriv/shared';

jest.mock('Stores/connect.js', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    connect: () => Component => Component,
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    isMobile: jest.fn(() => false),
}));

jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    Loading: () => <div>Loading</div>,
}));

jest.mock('Pages/payment-agent/payment-agent-unlisted-withdraw-form', () => () => (
    <div>PaymentAgentUnlistedWithdrawForm</div>
));
jest.mock('Pages/payment-agent/payment-agent-withdraw-confirm', () => () => <div>PaymentAgentWithdrawConfirm</div>);
jest.mock('Pages/payment-agent/payment-agent-receipt', () => () => <div>PaymentAgentReceipt</div>);
jest.mock('Pages/payment-agent/payment-agent-disclaimer', () => () => <div>PaymentAgentDisclaimer</div>);
jest.mock('Pages/payment-agent/payment-agent-search-box', () => () => <div>PaymentAgentSearchBox</div>);

describe('<PaymentAgentContainer />', () => {
    const props = {
        app_contents_scroll_ref: {
            current: {},
        },
        is_deposit: true,
        is_try_withdraw_successful: false,
        is_withdraw_successful: false,
        onChangePaymentMethod: jest.fn(),
        payment_agent_list: [
            {
                currencies: 'USD',
                deposit_commission: 0,
                email: 'pa@example.com',
                further_information: 'further information CR90000000',
                max_withdrawal: '2000',
                min_withdrawal: '10',
                name: 'Payment Agent of CR90000000',
                paymentagent_loginid: 'CR90000000',
                phones: '+12345678',
                supported_banks: [{ payment_method: 'Visa' }],
                telephone: '+12345678',
                url: 'http://www.pa.com',
                withdrawal_commission: 0,
            },
            {
                currencies: 'USD',
                deposit_commission: 0,
                email: 'pa@example.com',
                further_information: 'further information CR90000002',
                max_withdrawal: '2000',
                min_withdrawal: '10',
                name: 'Payment Agent of CR90000002',
                paymentagent_loginid: 'CR90000002',
                phones: '+12345678',
                supported_banks: [{ payment_method: 'Visa' }, { payment_method: 'Mastercard' }],
                telephone: '+12345678',
                url: 'http://www.pa.com',
                withdrawal_commission: 0,
            },
        ],
        resetPaymentAgent: jest.fn(),
        selected_bank: '',
        supported_banks: [
            { text: 'MasterCard', value: 'mastercard' },
            { text: 'Visa', value: 'visa' },
        ],
        verification_code: 'ABCdef',
    };

    it('should show proper messages and icons', () => {
        render(<PaymentAgentContainer {...props} />);

        expect(
            screen.getByText('Contact your preferred payment agent for payment instructions and make your deposit.')
        ).toBeInTheDocument();
        expect(screen.getByText('PaymentAgentSearchBox')).toBeInTheDocument();
        expect(screen.getByTestId('dt_dropdown_container')).toBeInTheDocument();
        expect(screen.getByText('Payment Agent of CR90000000')).toBeInTheDocument();
        expect(screen.getByText('Further information CR90000000')).toBeInTheDocument();
        expect(screen.getByText('Payment Agent of CR90000002')).toBeInTheDocument();
        expect(screen.getByText('Further information CR90000002')).toBeInTheDocument();
        expect(screen.getAllByTestId('dt_payment_method_icon').length).toBe(2);
    });

    it('should show proper header when is_deposit is equal to false', () => {
        render(<PaymentAgentContainer {...props} is_deposit={false} />);

        expect(
            screen.getByText(
                /choose your preferred payment agent and enter your withdrawal amount. If your payment agent is not listed/i
            )
        ).toBeInTheDocument();
        expect(screen.getByText('search for them using their account number')).toBeInTheDocument();
    });

    it('should show PaymentAgentUnlistedWithdrawForm when the user clicks on "search for them using their account number" link', () => {
        render(<PaymentAgentContainer {...props} is_deposit={false} />);

        const el_withdrawal_link = screen.getByTestId('dt_withdrawal_link');
        fireEvent.click(el_withdrawal_link);

        expect(screen.getByText('PaymentAgentUnlistedWithdrawForm')).toBeInTheDocument();
    });

    it('should show PaymentAgentWithdrawConfirm component when is_try_withdraw_successful is equal to true', () => {
        render(<PaymentAgentContainer {...props} is_try_withdraw_successful />);

        expect(screen.getByText('PaymentAgentWithdrawConfirm')).toBeInTheDocument();
    });

    it('should show PaymentAgentReceipt component when is_withdraw_successful is equal to true', () => {
        render(<PaymentAgentContainer {...props} is_withdraw_successful />);

        expect(screen.getByText('PaymentAgentReceipt')).toBeInTheDocument();
    });

    it('should show PaymentAgentDisclaimer in mobile view', () => {
        isMobile.mockReturnValue(true);
        render(<PaymentAgentContainer {...props} />);

        expect(screen.getByText('PaymentAgentDisclaimer')).toBeInTheDocument();
    });

    it('should show search loader when is_search_loading equal to true', () => {
        render(<PaymentAgentContainer {...props} is_search_loading />);

        expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('should show proper warning messages if there are no matches in search results', () => {
        render(<PaymentAgentContainer {...props} has_payment_agent_search_warning />);

        expect(screen.getByText('No payment agents found for your search')).toBeInTheDocument();
        expect(screen.getByText('Try changing your search criteria.')).toBeInTheDocument();
    });
});
