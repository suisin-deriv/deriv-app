import React from 'react';
import { TSocketError } from '@deriv/api/types';
import { Text } from '@deriv/components';
import { Localize } from '@deriv/translations';
import { mobileOSDetect } from '@deriv/shared';
import { DescriptionContainer } from './components/description-container';
import { TipsBlock } from './components/tips-block';
import { TServerError } from '../../../Types/common.type';

export const PASSKEY_STATUS_CODES = {
    CREATED: 'created',
    LEARN_MORE: 'learn_more',
    NONE: '',
    NO_PASSKEY: 'no_passkey',
    REMOVED: 'removed',
    RENAMING: 'renaming',
    VERIFYING: 'verifying',
} as const;

export type TPasskeysStatus = typeof PASSKEY_STATUS_CODES[keyof typeof PASSKEY_STATUS_CODES];

export const getStatusContent = (status: Exclude<TPasskeysStatus, ''>) => {
    const learn_more_button_text = <Localize i18n_default_text='Learn more' />;
    const create_passkey_button_text = <Localize i18n_default_text='Create passkey' />;
    const continue_button_text = <Localize i18n_default_text='Continue' />;
    const continue_trading_button_text = <Localize i18n_default_text='Continue trading' />;
    const add_more_passkeys_button_text = <Localize i18n_default_text='Add more passkeys' />;

    const getPasskeysRemovedDescription = () => {
        const os_type = mobileOSDetect();

        switch (os_type) {
            case 'Android':
                return (
                    <Localize i18n_default_text='Your passkey is successfully removed. To avoid sign-in prompts, also remove the passkey from your Google password manager. ' />
                );
            case 'iOS':
                return (
                    <Localize i18n_default_text='Your passkey is successfully removed. To avoid sign-in prompts, also remove the passkey from your iCloud keychain. ' />
                );
            default:
                return (
                    <Localize i18n_default_text='Your passkey is successfully removed. To avoid sign-in prompts, also remove the passkey from your password manager. ' />
                );
        }
    };

    const titles = {
        created: <Localize i18n_default_text='Success!' />,
        learn_more: <Localize i18n_default_text='Effortless login with passkeys' />,
        no_passkey: <Localize i18n_default_text='Experience safer logins' />,
        removed: <Localize i18n_default_text='Passkey successfully removed' />,
        renaming: <Localize i18n_default_text='Edit passkey' />,
        verifying: <Localize i18n_default_text='Verify your request' />,
    };
    const descriptions = {
        created: (
            <Localize
                i18n_default_text='Your account is now secured with a passkey.<0/>Manage your passkey through your<0/>Deriv account settings.'
                components={[<br key={0} />]}
            />
        ),
        learn_more: (
            <React.Fragment>
                <DescriptionContainer />
                <TipsBlock />
            </React.Fragment>
        ),
        no_passkey: <Localize i18n_default_text='Enhanced security is just a tap away.' />,
        removed: getPasskeysRemovedDescription(),
        renaming: '',
        verifying: (
            <Localize i18n_default_text="We'll send you a secure link to verify your request. Tap on it to confirm you want to remove the passkey. This protects your account from unauthorised requests." />
        ),
    };
    const icons = {
        created: 'IcSuccessPasskey',
        learn_more: 'IcInfoPasskey',
        no_passkey: 'IcAddPasskey',
        removed: 'IcSuccessPasskey',
        renaming: 'IcEditPasskey',
        verifying: 'IcVerifyPasskey',
    };
    const primary_button_texts = {
        created: continue_trading_button_text,
        learn_more: create_passkey_button_text,
        no_passkey: create_passkey_button_text,
        removed: continue_button_text,
        renaming: <Localize i18n_default_text='Save changes' />,
        verifying: <Localize i18n_default_text='Send email' />,
    };
    const secondary_button_texts = {
        created: add_more_passkeys_button_text,
        learn_more: undefined,
        no_passkey: learn_more_button_text,
        removed: undefined,
        renaming: <Localize i18n_default_text='Back' />,
        verifying: undefined,
    };

    return {
        title: titles[status],
        description: descriptions[status],
        icon: icons[status],
        primary_button_text: primary_button_texts[status],
        secondary_button_text: secondary_button_texts[status],
    };
};

// TODO: fix types for TServerError and TSocketError
type TGetModalContent = {
    error: TServerError | null | TSocketError<'passkeys_list' | 'passkeys_register' | 'passkeys_register_options'>;
    is_passkey_registration_started: boolean;
};

export const NOT_SUPPORTED_ERROR_NAME = 'NotSupportedError';

export const getModalContent = ({ error, is_passkey_registration_started }: TGetModalContent) => {
    const error_message_header = (
        <Text size='xs' weight='bold'>
            <Localize i18n_default_text='Passkey setup failed' />
        </Text>
    );

    const error_message =
        (error as TServerError)?.name === NOT_SUPPORTED_ERROR_NAME ? (
            <Localize i18n_default_text="This device doesn't support passkeys." />
        ) : (
            (error as TServerError)?.message
        );
    const button_text =
        (error as TServerError)?.name === NOT_SUPPORTED_ERROR_NAME ? (
            <Localize i18n_default_text='OK' />
        ) : (
            <Localize i18n_default_text='Try again' />
        );

    const reminder_tips = [
        <Localize i18n_default_text='Enable screen lock on your device.' key='tip_1' />,
        <Localize i18n_default_text='Enable bluetooth.' key='tip_2' />,
        <Localize i18n_default_text='Sign in to your Google or iCloud account.' key='tip_3' />,
    ];
    if (is_passkey_registration_started) {
        return {
            description: (
                <ul>
                    {reminder_tips.map(tip => (
                        <li key={tip.key}>
                            <Text size='xxs' line_height='l'>
                                {tip}
                            </Text>
                        </li>
                    ))}
                </ul>
            ),
            button_text: <Localize i18n_default_text='Continue' />,
            header: (
                <Text size='xs' weight='bold'>
                    <Localize i18n_default_text='Just a reminder' />
                </Text>
            ),
        };
    }

    return {
        description: error_message ?? '',
        button_text: error ? button_text : undefined,
        header: error ? error_message_header : undefined,
    };
};
