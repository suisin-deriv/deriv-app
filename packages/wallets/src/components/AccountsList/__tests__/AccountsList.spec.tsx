import React, { ComponentProps, PropsWithChildren } from 'react';
import { APIProvider, AuthProvider } from '@deriv/api-v2';
import { render, screen } from '@testing-library/react';
import useDevice from '../../../hooks/useDevice';
import { ModalProvider } from '../../ModalProvider';
import WalletMobileTourGuide from '../../WalletTourGuide/WalletMobileTourGuide';
import AccountsList from '../AccountsList';

jest.mock('../../../hooks/useDevice');
const mockUseDevice = useDevice as jest.MockedFunction<typeof useDevice>;

const mockWalletMobileTourGuide = jest.fn();
jest.mock(
    '../../WalletTourGuide/WalletMobileTourGuide',
    // eslint-disable-next-line react/display-name
    () => (props: ComponentProps<typeof WalletMobileTourGuide>) => {
        mockWalletMobileTourGuide(props);
        return (
            <div>
                <p>mock wallet tour guide</p>
                <p>{props.isMT5PlatformListLoaded ? 'mt5 list loaded' : 'mt5 list not loaded'}</p>
                <p>
                    {props.isOptionsAndMultipliersLoaded
                        ? 'options and multipliers loaded'
                        : 'options and multipliers not loaded'}
                </p>
                <p>{props.isWalletSettled ? 'wallet settled' : 'wallet not settled'}</p>
            </div>
        );
    }
);

const wrapper = ({ children }: PropsWithChildren) => (
    <APIProvider>
        <AuthProvider>
            <ModalProvider>{children}</ModalProvider>
        </AuthProvider>
    </APIProvider>
);

describe('AccountsList', () => {
    it('should render account list in mobile view', () => {
        mockUseDevice.mockReturnValue({
            isDesktop: false,
            isMobile: true,
            isTablet: false,
        });
        render(<AccountsList isWalletSettled={true} />, { wrapper });
        expect(screen.getByTestId('dt_tabs')).toBeInTheDocument();
        expect(screen.getByTestId('dt_tab_list')).toBeInTheDocument();
        expect(screen.getByTestId('dt_tab_panels')).toBeInTheDocument();
        expect(screen.getByText('CFDs')).toBeInTheDocument();
        expect(screen.getByText('Options & multipliers')).toBeInTheDocument();
        expect(screen.getByText('Deriv MT5')).toBeInTheDocument();
        expect(screen.getByText('Compare accounts')).toBeInTheDocument();
    });

    it('should show Options & Multipliers tab in mobile view when the tab active', () => {
        mockUseDevice.mockReturnValue({
            isDesktop: false,
            isMobile: true,
            isTablet: false,
        });
        render(<AccountsList isWalletSettled={true} />, { wrapper });
        expect(screen.getByTestId('dt_tab_panels')).toBeInTheDocument();
        expect(screen.getByText('CFDs')).toBeInTheDocument();
        expect(screen.getByText('Options & multipliers')).toBeInTheDocument();

        screen.getByText('Options & multipliers').click();
        expect(screen.getByText('Deriv Apps')).toBeInTheDocument();
        expect(screen.getByText('Deriv Trader')).toBeInTheDocument();
        expect(screen.getByText('Deriv Bot')).toBeInTheDocument();
        expect(screen.getByText('SmartTrader')).toBeInTheDocument();
        expect(screen.getByText('Binary Bot')).toBeInTheDocument();
        expect(screen.getByText('Deriv GO')).toBeInTheDocument();
    });

    it('should render account list in desktop view', () => {
        mockUseDevice.mockReturnValue({
            isDesktop: true,
            isMobile: false,
            isTablet: false,
        });
        render(<AccountsList isWalletSettled={true} />, { wrapper });

        expect(screen.getByTestId('dt_desktop_accounts_list')).toBeInTheDocument();
        expect(screen.getByText('CFDs')).toBeInTheDocument();
        expect(screen.getByText('Options & Multipliers')).toBeInTheDocument();
    });

    it('should render wallet tour guide in mobile view with isWalletSettled set to false', () => {
        mockUseDevice.mockReturnValue({
            isDesktop: false,
            isMobile: true,
            isTablet: false,
        });
        render(<AccountsList isWalletSettled={false} />, { wrapper });
        expect(mockWalletMobileTourGuide).toBeCalledWith(expect.objectContaining({ isWalletSettled: false }));
    });

    it('should render wallet tour guide in mobile view with isWalletSettled set to true', () => {
        mockUseDevice.mockReturnValue({
            isDesktop: false,
            isMobile: true,
            isTablet: false,
        });
        render(<AccountsList isWalletSettled={true} />, { wrapper });
        expect(mockWalletMobileTourGuide).toBeCalledWith(expect.objectContaining({ isWalletSettled: true }));
    });
});
