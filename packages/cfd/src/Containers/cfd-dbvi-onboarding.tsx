import React from 'react';
import {
    Button,
    DesktopWrapper,
    Icon,
    Loading,
    MobileDialog,
    MobileWrapper,
    Modal,
    Text,
    UILoader,
} from '@deriv/components';
import { localize } from '@deriv/translations';
import RootStore from 'Stores/index';
import { PoiPoaDocsSubmitted } from '@deriv/account';
import { connect } from 'Stores/connect';
import { getAuthenticationStatusInfo, isMobile, WS } from '@deriv/shared';
import { AccountStatusResponse } from '@deriv/api-types';
import { TCFDDbViOnBoardingProps } from './props.types';
import CFDFinancialStpRealAccountSignup from './cfd-financial-stp-real-account-signup';

type TSwitchToRealAccountMessage = {
    onClickOK: () => void;
};

const SwitchToRealAccountMessage = ({ onClickOK }: TSwitchToRealAccountMessage) => {
    return (
        <div className='da-icon-with-message'>
            <Icon icon={'IcPoaLock'} size={128} />
            <Text
                className='da-icon-with-message__text'
                as='p'
                color='general'
                size={isMobile() ? 'xs' : 's'}
                line_height='m'
                weight='bold'
            >
                {localize('Switch to your real account to submit your documents')}
            </Text>
            <Button
                has_effect
                text={localize('Ok')}
                onClick={() => {
                    onClickOK();
                }}
                style={{ margin: '2rem' }}
                primary
            />
        </div>
    );
};
const CFDDbViOnBoarding = ({
    account_status,
    disableApp,
    enableApp,
    fetchAccountSettings,
    has_created_account_for_selected_jurisdiction,
    has_submitted_cfd_personal_details,
    is_cfd_verification_modal_visible,
    is_virtual,
    jurisdiction_selected_shortcode,
    openPasswordModal,
    toggleCFDVerificationModal,
    updateAccountStatus,
    responseMt5LoginList,
}: TCFDDbViOnBoardingProps) => {
    const [showSubmittedModal, setShowSubmittedModal] = React.useState(false);
    const [is_loading, setIsLoading] = React.useState(false);

    const getAccountStatusFromAPI = () => {
        WS.authorized.getAccountStatus().then((response: AccountStatusResponse) => {
            const { get_account_status } = response;
            if (get_account_status?.authentication) {
                const { need_poi_for_vanuatu, poi_acknowledged_for_bvi_labuan_maltainvest, poa_acknowledged } =
                    getAuthenticationStatusInfo(get_account_status);
                if (
                    jurisdiction_selected_shortcode === 'vanuatu' &&
                    need_poi_for_vanuatu &&
                    has_submitted_cfd_personal_details
                ) {
                    setShowSubmittedModal(false);
                } else if (
                    jurisdiction_selected_shortcode === 'maltainvest' &&
                    poi_acknowledged_for_bvi_labuan_maltainvest &&
                    poa_acknowledged
                ) {
                    setShowSubmittedModal(true);
                } else if (
                    poi_acknowledged_for_bvi_labuan_maltainvest &&
                    poa_acknowledged &&
                    has_submitted_cfd_personal_details
                ) {
                    setShowSubmittedModal(true);
                } else {
                    setShowSubmittedModal(false);
                }
            }
            setIsLoading(false);
        });
        setIsLoading(false);
    };

    const updateMt5LoginList = async () => {
        const mt5_login_list_response = await WS.authorized.mt5LoginList();
        responseMt5LoginList(mt5_login_list_response);
    };

    React.useEffect(() => {
        setIsLoading(true);
        getAccountStatusFromAPI();
        fetchAccountSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_cfd_verification_modal_visible]);

    const getModalContent = () => {
        if (is_virtual) {
            return <SwitchToRealAccountMessage onClickOK={toggleCFDVerificationModal} />;
        }
        return showSubmittedModal ? (
            <PoiPoaDocsSubmitted
                onClickOK={toggleCFDVerificationModal}
                updateAccountStatus={updateAccountStatus}
                account_status={account_status}
                jurisdiction_selected_shortcode={jurisdiction_selected_shortcode}
                has_created_account_for_selected_jurisdiction={has_created_account_for_selected_jurisdiction}
                openPasswordModal={openPasswordModal}
            />
        ) : (
            <CFDFinancialStpRealAccountSignup
                onFinish={() => {
                    updateMt5LoginList();
                    if (has_created_account_for_selected_jurisdiction) {
                        setShowSubmittedModal(true);
                    } else {
                        toggleCFDVerificationModal();
                        openPasswordModal();
                    }
                }}
            />
        );
    };
    const getModalTitle = () =>
        has_created_account_for_selected_jurisdiction
            ? localize('Submit your proof of identity and address')
            : localize('Add a real MT5 account');

    return is_loading ? (
        <Loading is_fullscreen={false} />
    ) : (
        <React.Suspense fallback={<UILoader />}>
            <DesktopWrapper>
                <Modal
                    className='cfd-financial-stp-modal'
                    disableApp={disableApp}
                    enableApp={enableApp}
                    is_open={is_cfd_verification_modal_visible}
                    title={getModalTitle()}
                    toggleModal={toggleCFDVerificationModal}
                    height='700px'
                    width='996px'
                    onMount={() => getAccountStatusFromAPI()}
                    exit_classname='cfd-modal--custom-exit'
                >
                    {getModalContent()}
                </Modal>
            </DesktopWrapper>
            <MobileWrapper>
                <MobileDialog
                    portal_element_id='deriv_app'
                    title={getModalTitle()}
                    wrapper_classname='cfd-financial-stp-modal'
                    visible={is_cfd_verification_modal_visible}
                    onClose={toggleCFDVerificationModal}
                >
                    {getModalContent()}
                </MobileDialog>
            </MobileWrapper>
        </React.Suspense>
    );
};

export default connect(({ client, modules: { cfd }, ui }: RootStore) => ({
    account_status: client.account_status,
    account_type: cfd.account_type,
    disableApp: ui.disableApp,
    enableApp: ui.enableApp,
    fetchAccountSettings: client.fetchAccountSettings,
    has_created_account_for_selected_jurisdiction: cfd.has_created_account_for_selected_jurisdiction,
    has_submitted_cfd_personal_details: cfd.has_submitted_cfd_personal_details,
    is_cfd_verification_modal_visible: cfd.is_cfd_verification_modal_visible,
    is_virtual: client.is_virtual,
    jurisdiction_selected_shortcode: cfd.jurisdiction_selected_shortcode,
    mt5_login_list: client.mt5_login_list,
    openPasswordModal: cfd.enableCFDPasswordModal,
    toggleCFDVerificationModal: cfd.toggleCFDVerificationModal,
    updateAccountStatus: client.updateAccountStatus,
    responseMt5LoginList: client.responseMt5LoginList,
}))(CFDDbViOnBoarding);
