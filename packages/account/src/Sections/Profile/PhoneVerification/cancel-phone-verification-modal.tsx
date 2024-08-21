import { useEffect, useState } from 'react';
import { Modal, Text } from '@deriv-com/quill-ui';
import { Localize } from '@deriv/translations';
import { useHistory, useLocation } from 'react-router';
import { observer, useStore } from '@deriv/stores';
import { useDevice } from '@deriv-com/ui';
import { usePhoneVerificationAnalytics } from '@deriv/hooks';

const CancelPhoneVerificationModal = observer(() => {
    const history = useHistory();
    const location = useLocation();
    const [show_modal, setShowModal] = useState(false);
    const [next_location, setNextLocation] = useState(location.pathname);
    const { ui, client } = useStore();
    const { setShouldShowPhoneNumberOTP, is_forced_to_exit_pnv } = ui;
    const { setVerificationCode, is_virtual, account_settings } = client;
    const { isMobile } = useDevice();
    const { trackPhoneVerificationEvents } = usePhoneVerificationAnalytics();

    useEffect(() => {
        const unblock = history.block((location: Location) => {
            if (
                !show_modal &&
                !is_virtual &&
                !is_forced_to_exit_pnv &&
                !account_settings.phone_number_verification?.verified
            ) {
                setShowModal(true);
                setNextLocation(location.pathname);
                return false;
            }
            return true;
        });

        return () => unblock();
    }, [history, show_modal, is_virtual, is_forced_to_exit_pnv, account_settings.phone_number_verification?.verified]);

    const handleStayAtPhoneVerificationPage = () => {
        setShowModal(false);
        setNextLocation(location.pathname);
    };

    const handleLeavePhoneVerificationPage = () => {
        if (next_location) {
            setVerificationCode('', 'phone_number_verification');
            setShouldShowPhoneNumberOTP(false);
            setShowModal(false);
            trackPhoneVerificationEvents({
                action: 'back',
            });
            history.push(next_location);
        }
    };

    return (
        <Modal
            isMobile={isMobile}
            showHandleBar
            isOpened={show_modal}
            shouldCloseOnPrimaryButtonClick
            primaryButtonLabel={<Localize i18n_default_text='Go back' />}
            showSecondaryButton
            showCrossIcon
            toggleModal={handleStayAtPhoneVerificationPage}
            secondaryButtonLabel={<Localize i18n_default_text='Yes, cancel' />}
            secondaryButtonCallback={handleLeavePhoneVerificationPage}
        >
            <Modal.Header title={<Localize i18n_default_text='Cancel phone number verification?' />} />
            <Modal.Body>
                <div className='phone-verification__cancel-modal--contents'>
                    <Text>
                        <Localize i18n_default_text='All details entered will be lost.' />
                    </Text>
                </div>
            </Modal.Body>
        </Modal>
    );
});

export default CancelPhoneVerificationModal;
