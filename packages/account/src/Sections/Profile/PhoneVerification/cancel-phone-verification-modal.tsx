import { useEffect, useState } from 'react';
import { Modal, Text } from '@deriv-com/quill-ui';
import { Localize } from '@deriv/translations';
import { useHistory, useLocation } from 'react-router';
import { observer, useStore } from '@deriv/stores';
import { LabelPairedCircleXmarkLgRegularIcon } from '@deriv/quill-icons';
import { useDevice } from '@deriv-com/ui';
import { usePhoneVerificationAnalytics } from '@deriv/hooks';

const CancelPhoneVerificationModal = observer(() => {
    const history = useHistory();
    const location = useLocation();
    const [show_modal, setShowModal] = useState(false);
    const [next_location, setNextLocation] = useState(location.pathname);
    const { ui, client } = useStore();
    const { setShouldShowPhoneNumberOTP, is_forced_to_exit_pnv } = ui;
    const { setVerificationCode, is_virtual } = client;
    const { isMobile } = useDevice();
    const { trackPhoneVerificationEvents } = usePhoneVerificationAnalytics();

    useEffect(() => {
        const unblock = history.block((location: Location) => {
            if (!show_modal && !is_virtual && !is_forced_to_exit_pnv) {
                setShowModal(true);
                setNextLocation(location.pathname);
                return false;
            }
            return true;
        });

        return () => unblock();
    }, [history, show_modal, is_virtual, is_forced_to_exit_pnv]);

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
            primaryButtonCallback={handleStayAtPhoneVerificationPage}
            primaryButtonLabel={<Localize i18n_default_text='Go back' />}
            disableCloseOnOverlay
            showSecondaryButton
            secondaryButtonLabel={<Localize i18n_default_text='Yes, cancel' />}
            secondaryButtonCallback={handleLeavePhoneVerificationPage}
        >
            <Modal.Header
                className='phone-verification__cancel-modal--header'
                image={<LabelPairedCircleXmarkLgRegularIcon fill='#C40000' height={96} width={96} />}
            />
            <Modal.Body>
                <div className='phone-verification__cancel-modal--contents'>
                    <Text bold>
                        <Localize i18n_default_text='Cancel phone number verification?' />
                    </Text>
                    <Text>
                        <Localize i18n_default_text='All details entered will be lost.' />
                    </Text>
                </div>
            </Modal.Body>
        </Modal>
    );
});

export default CancelPhoneVerificationModal;
