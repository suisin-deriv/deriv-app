import React from 'react';
import { Redirect } from 'react-router-dom';
import { Loading } from '@deriv/components';
import { useGetPasskeysList, useIsPasskeySupported, useRegisterPasskey } from '@deriv/hooks';
import { routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import PasskeysStatusContainer from './components/passkeys-status-container';
import PasskeysList from './components/passkeys-list';
import PasskeyModal from './components/passkey-modal';
import { getErrorContent, PASSKEY_STATUS_CODES, TPasskeysStatus } from './passkeys-configs';
import './passkeys.scss';

const Passkeys = observer(() => {
    const { ui } = useStore();
    const { is_mobile } = ui;
    //TODO: add feature flag with growthbook
    const is_passkeys_enabled = true;

    const [passkey_status, setPasskeyStatus] = React.useState<TPasskeysStatus>(PASSKEY_STATUS_CODES.NONE);
    const { is_passkey_supported, is_loading: is_passkey_support_checked } = useIsPasskeySupported();
    const {
        data: passkeys_list,
        isLoading: is_passkeys_list_loading,
        error: passkeys_list_error,
    } = useGetPasskeysList();
    const { createPasskey, is_passkey_registered, registration_error } = useRegisterPasskey();

    const should_show_passkeys = is_passkeys_enabled && is_passkey_supported && is_mobile;

    React.useEffect(() => {
        if (!passkeys_list?.length && !is_passkey_registered) {
            setPasskeyStatus(PASSKEY_STATUS_CODES.NO_PASSKEY);
        } else if (is_passkey_registered) {
            setPasskeyStatus(PASSKEY_STATUS_CODES.CREATED);
        } else {
            setPasskeyStatus(PASSKEY_STATUS_CODES.NONE);
        }
    }, [is_passkey_registered, passkeys_list]);

    if (is_passkey_support_checked || is_passkeys_list_loading) {
        return <Loading is_fullscreen={false} className='account__initial-loader' />;
    }
    if (!should_show_passkeys) {
        return <Redirect to={routes.traders_hub} />;
    }

    const error_text =
        (passkeys_list_error && String(passkeys_list_error)) || (registration_error && String(registration_error));

    //TODO consider different error messages with title and descriptions
    return (
        <div className='passkeys'>
            {passkey_status ? (
                <PasskeysStatusContainer
                    createPasskey={createPasskey}
                    passkey_status={passkey_status}
                    setPasskeyStatus={setPasskeyStatus}
                />
            ) : (
                <PasskeysList
                    passkeys_list={passkeys_list || []}
                    onPrimaryButtonClick={createPasskey}
                    onSecondaryButtonClick={() => setPasskeyStatus(PASSKEY_STATUS_CODES.LEARN_MORE)}
                />
            )}

            <PasskeyModal
                className='passkeys-modal__error'
                is_modal_open={!!error_text}
                title={getErrorContent(error_text).title}
                description={getErrorContent(error_text).description}
                button_text={getErrorContent(error_text).button_text}
                onButtonClick={getErrorContent(error_text).buttonOnclick}
            />
        </div>
    );
});

export default Passkeys;
