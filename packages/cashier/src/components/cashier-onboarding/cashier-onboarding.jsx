import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { getStaticUrl, isCryptocurrency, routes } from '@deriv/shared';
import { Localize } from '@deriv/translations';
import { Loading, ThemedScrollbars, Text } from '@deriv/components';
import { connect } from 'Stores/connect';
import Providers from './cashier-onboarding-providers';
import CashierOnboardingDetails from './cashier-onboarding-details.jsx';
import CashierOnboardingSideNote from './cashier-onboarding-side-note.jsx';
import SideNote from 'Components/side-note';

const CashierOnboarding = ({
    accounts,
    available_crypto_currencies,
    can_change_fiat_currency,
    currency,
    has_set_currency,
    is_dark_mode_on,
    is_landing_company_loaded,
    is_mobile,
    is_from_derivgo,
    is_payment_agent_visible_in_onboarding,
    is_switching,
    onMountCashierOnboarding,
    openRealAccountSignup,
    shouldNavigateAfterChooseCrypto,
    shouldNavigateAfterPrompt,
    setIsCashierOnboarding,
    setIsDeposit,
    setDepositTarget,
    setShouldShowAllAvailableCurrencies,
    setSideNotes,
    showP2pInCashierOnboarding,
    show_p2p_in_cashier_onboarding,
    toggleSetCurrencyModal,
}) => {
    const history = useHistory();
    const is_crypto = !!currency && isCryptocurrency(currency);
    const has_crypto_account = React.useMemo(
        () => Object.values(accounts).some(acc_settings => isCryptocurrency(acc_settings.currency)),
        [accounts]
    );
    const has_fiat_account = React.useMemo(
        () =>
            Object.values(accounts).some(
                acc_settings => !acc_settings.is_virtual && !isCryptocurrency(acc_settings.currency)
            ),
        [accounts]
    );

    const is_currency_banner_visible =
        (!is_crypto && !can_change_fiat_currency) || (is_crypto && available_crypto_currencies.length > 0);

    React.useEffect(() => {
        onMountCashierOnboarding();
        return () => {
            setIsCashierOnboarding(false);
            if (!has_set_currency && window.location.pathname.includes(routes.cashier)) {
                history.push(routes.trade);
                toggleSetCurrencyModal();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (
            typeof setSideNotes === 'function' &&
            !is_switching &&
            Object.keys(accounts).length > 0 &&
            is_landing_company_loaded &&
            is_currency_banner_visible
        ) {
            setSideNotes([<CashierOnboardingSideNote key={0} is_crypto={is_crypto} />]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_switching, accounts, is_landing_company_loaded]);

    const openRealAccount = target => {
        openRealAccountSignup('choose');
        shouldNavigateAfterChooseCrypto(target);
    };

    const openTarget = target => {
        setDepositTarget(target);
        if (is_crypto || has_crypto_account) {
            openRealAccount(target);
        } else {
            openRealAccountSignup('add_crypto');
        }
    };

    const fiatAccountConditions = (next_location, current_location) => {
        if (has_fiat_account) {
            shouldNavigateAfterPrompt(next_location, current_location);
        } else {
            openRealAccountSignup('add_fiat');
        }
    };

    const onClickDepositCash = () => {
        setDepositTarget(routes.cashier_deposit);

        if (is_crypto) {
            fiatAccountConditions(routes.cashier_deposit, 'deposit');
        } else {
            setIsDeposit(true);
        }
    };

    const onClickDepositCrypto = () => {
        openTarget(routes.cashier_deposit);
    };

    const onClickOnramp = () => {
        openTarget(routes.cashier_onramp);
    };

    const onClickPaymentAgent = () => {
        setShouldShowAllAvailableCurrencies(true);
        setDepositTarget(routes.cashier_pa);
        openRealAccount(routes.cashier_pa);
    };

    const onClickDp2p = () => {
        setDepositTarget(routes.cashier_p2p);

        if (is_crypto) {
            fiatAccountConditions(routes.cashier_p2p, 'DP2P');
        } else {
            history.push(routes.cashier_p2p);
        }
    };

    const getDepositOptions = () => {
        showP2pInCashierOnboarding();
        const options = [];
        options.push(Providers.createCashProvider(onClickDepositCash));
        options.push(Providers.createCryptoProvider(onClickDepositCrypto));
        options.push(Providers.createOnrampProvider(onClickOnramp, is_crypto));
        if (is_payment_agent_visible_in_onboarding) {
            options.push(Providers.createPaymentAgentProvider(onClickPaymentAgent));
        }

        if (show_p2p_in_cashier_onboarding) {
            options.push(Providers.createDp2pProvider(onClickDp2p));
        }
        return options;
    };

    if (is_switching || Object.keys(accounts).length === 0 || !is_landing_company_loaded)
        return <Loading className='cashier-onboarding__loader' is_fullscreen />;

    return (
        <div>
            {is_currency_banner_visible && (
                <SideNote is_mobile has_title={false} className='outside-wrapper'>
                    <CashierOnboardingSideNote is_crypto={is_crypto} />
                </SideNote>
            )}
            <div className='cashier-onboarding'>
                <div className='cashier-onboarding-header'>
                    <Text size={is_mobile ? 's' : 'sm'} line_height='xxl'>
                        <Localize i18n_default_text='Choose a way to fund your account' />
                    </Text>
                    <Text size={is_mobile ? 'xs' : 's'} line_height={is_mobile ? 'xl' : 'xxl'} align='center'>
                        <Localize i18n_default_text='Please note that some payment methods might not be available in your country.' />
                    </Text>
                </div>
                {is_mobile && !is_from_derivgo && (
                    <div
                        className='cashier-onboarding-header-learn-more'
                        onClick={() => window.open(getStaticUrl('/payment-methods'))}
                    >
                        <Text size='xs' color='red'>
                            <Localize i18n_default_text='Learn more about payment methods' />
                        </Text>
                    </div>
                )}
                <ThemedScrollbars className='cashier-onboarding-content'>
                    <div className='cashier-onboarding-content__description'>
                        {getDepositOptions()?.map((deposit, idx) => (
                            <CashierOnboardingDetails
                                key={`${deposit.detail_header}${idx}`}
                                detail_click={deposit.detail_click}
                                detail_contents={deposit.detail_contents}
                                detail_description={deposit.detail_description}
                                detail_header={deposit.detail_header}
                                is_dark_mode_on={is_dark_mode_on}
                                is_mobile={is_mobile}
                            />
                        ))}
                    </div>
                </ThemedScrollbars>
            </div>
        </div>
    );
};

CashierOnboarding.propTypes = {
    accounts: PropTypes.object,
    available_crypto_currencies: PropTypes.array,
    can_change_fiat_currency: PropTypes.bool,
    currency: PropTypes.string,
    has_set_currency: PropTypes.bool,
    is_dark_mode_on: PropTypes.bool,
    is_landing_company_loaded: PropTypes.bool,
    is_mobile: PropTypes.bool,
    is_from_derivgo: PropTypes.bool,
    is_payment_agent_visible_in_onboarding: PropTypes.bool,
    is_switching: PropTypes.bool,
    onMountCashierOnboarding: PropTypes.func,
    openRealAccountSignup: PropTypes.func,
    shouldNavigateAfterChooseCrypto: PropTypes.func,
    shouldNavigateAfterPrompt: PropTypes.func,
    setIsCashierOnboarding: PropTypes.func,
    setIsDeposit: PropTypes.func,
    setDepositTarget: PropTypes.func,
    setShouldShowAllAvailableCurrencies: PropTypes.func,
    setSideNotes: PropTypes.func,
    showP2pInCashierOnboarding: PropTypes.func,
    show_p2p_in_cashier_onboarding: PropTypes.bool,
    toggleSetCurrencyModal: PropTypes.func,
};

export default connect(({ client, common, modules, ui }) => ({
    accounts: client.accounts,
    available_crypto_currencies: client.available_crypto_currencies,
    can_change_fiat_currency: client.can_change_fiat_currency,
    currency: client.currency,
    has_set_currency: modules.cashier.general_store.has_set_currency,
    is_dark_mode_on: ui.is_dark_mode_on,
    is_landing_company_loaded: client.is_landing_company_loaded,
    is_mobile: ui.is_mobile,
    is_from_derivgo: common.is_from_derivgo,
    is_payment_agent_visible_in_onboarding: modules.cashier.payment_agent.is_payment_agent_visible_in_onboarding,
    is_switching: client.is_switching,
    onMountCashierOnboarding: modules.cashier.general_store.onMountCashierOnboarding,
    openRealAccountSignup: ui.openRealAccountSignup,
    shouldNavigateAfterChooseCrypto: ui.shouldNavigateAfterChooseCrypto,
    shouldNavigateAfterPrompt: modules.cashier.account_prompt_dialog.shouldNavigateAfterPrompt,
    setIsCashierOnboarding: modules.cashier.general_store.setIsCashierOnboarding,
    setIsDeposit: modules.cashier.general_store.setIsDeposit,
    setDepositTarget: modules.cashier.general_store.setDepositTarget,
    setShouldShowAllAvailableCurrencies: modules.cashier.general_store.setShouldShowAllAvailableCurrencies,
    showP2pInCashierOnboarding: modules.cashier.general_store.showP2pInCashierOnboarding,
    show_p2p_in_cashier_onboarding: modules.cashier.general_store.show_p2p_in_cashier_onboarding,
    toggleSetCurrencyModal: ui.toggleSetCurrencyModal,
}))(CashierOnboarding);
