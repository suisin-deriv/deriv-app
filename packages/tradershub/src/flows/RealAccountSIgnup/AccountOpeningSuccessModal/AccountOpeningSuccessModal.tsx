import React from 'react';
import ReactModal from 'react-modal';
import { useHistory } from 'react-router-dom';
import Checkmark from '@/assets/svgs/checkmark.svg';
import { ActionScreen, ButtonGroup } from '@/components';
import { IconToCurrencyMapper } from '@/constants';
import { CUSTOM_STYLES } from '@/helpers';
import { useSignupWizardContext } from '@/providers/SignupWizardProvider';
import { Button, Text, useDevice } from '@deriv-com/ui';

const SelectedCurrencyIcon = () => {
    const { state } = useSignupWizardContext();
    return (
        <div className='relative'>
            <div className='[&>svg]:scale-[2.4] w-[96px] h-[96px] flex justify-center items-center'>
                {/* add currency icons to platform icon component */}
                {IconToCurrencyMapper[state.currency ?? 'USD']?.icon}
            </div>
            <Checkmark className='absolute w-32 h-32 bottom-6 right-6' />
        </div>
    );
};

const AccountOpeningSuccessModal = () => {
    const { isSuccessModalOpen, reset } = useSignupWizardContext();
    const { isDesktop } = useDevice();
    const { state } = useSignupWizardContext();
    const history = useHistory();

    const handleNavigateToDeposit = () => {
        reset();
        history.push('/cashier/deposit');
    };

    return (
        <ReactModal
            ariaHideApp={false}
            className='modal'
            isOpen={isSuccessModalOpen}
            shouldCloseOnEsc={false}
            shouldCloseOnOverlayClick={false}
            style={CUSTOM_STYLES}
        >
            <ActionScreen
                className='bg-system-light-primary-background h-screen w-screen lg:h-[304px] lg:w-[440px] lg:rounded-default p-16 lg:p-0'
                description={
                    <div className='text-center'>
                        <Text align='center' as='p' className='text-sm lg:text-default'>
                            You have added a {state.currency} account.
                        </Text>
                        <Text align='center' as='p' className='text-sm lg:text-default'>
                            Make a deposit now to start trading.
                        </Text>
                    </div>
                }
                icon={<SelectedCurrencyIcon />}
                renderButtons={() => (
                    <ButtonGroup className='flex-col lg:flex-row sm:w-full'>
                        <Button color='black' isFullWidth={!isDesktop} onClick={reset} size='md' variant='outlined'>
                            Maybe later
                        </Button>
                        <Button isFullWidth={!isDesktop} onClick={handleNavigateToDeposit} size='md'>
                            Deposit
                        </Button>
                    </ButtonGroup>
                )}
                title='Your account is ready'
            />
        </ReactModal>
    );
};

export default AccountOpeningSuccessModal;
