import * as React from 'react';
// Todo: After upgrading to react 18 we should use @testing-library/react-hooks instead.
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '../useStore';
import useRealSTPAccount from '../useRealSTPAccount';
import { TRootStore, DeepPartial } from '../../types';

const UseRealSTPAccountExample = () => {
    const has_real_stp_account = useRealSTPAccount();

    return (
        <>
            <p data-testid={'dt_has_real_stp_account'}>{has_real_stp_account ? 'true' : 'false'}</p>
        </>
    );
};

describe('useRealSTPAccount', () => {
    test('should be false if does not have an account type of real with sub account type of financial_stp', async () => {
        const mockRootStore: DeepPartial<TRootStore> = {
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                    {
                        account_type: 'real',
                        sub_account_type: 'financial',
                    },
                ],
            },
        };

        render(<UseRealSTPAccountExample />, {
            wrapper: ({ children }) => <StoreProvider store={mockRootStore}>{children}</StoreProvider>,
        });

        const has_real_stp_account = screen.getByTestId('dt_has_real_stp_account');
        expect(has_real_stp_account).toHaveTextContent('false');
    });

    test('should be true if has an account type of real with sub account type of financial_stp', async () => {
        const mockRootStore: DeepPartial<TRootStore> = {
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial',
                    },
                    {
                        account_type: 'real',
                        sub_account_type: 'financial_stp',
                    },
                ],
            },
        };

        render(<UseRealSTPAccountExample />, {
            wrapper: ({ children }) => <StoreProvider store={mockRootStore}>{children}</StoreProvider>,
        });

        const has_real_stp_account = screen.getByTestId('dt_has_real_stp_account');
        expect(has_real_stp_account).toHaveTextContent('true');
    });
});
