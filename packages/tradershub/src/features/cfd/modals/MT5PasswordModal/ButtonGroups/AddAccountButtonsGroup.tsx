import React from 'react';
import { Provider } from '@deriv/library';
import { Button } from '@deriv/quill-design';
import { ButtonGroup, Modal, SentEmailContent } from '../../../../../components';
import { PlatformDetails } from '../../../constants';
import CreateAccountButton from './CreateAccountButton';

type TAddAccountButtonsGroupProps = {
    password: string;
};

const AddAccountButtonsGroup = ({ password }: TAddAccountButtonsGroupProps) => {
    const { show } = Provider.useModal();
    const { getCFDState } = Provider.useCFDContext();
    const platform = getCFDState('platform') ?? PlatformDetails.mt5.platform;

    return (
        <ButtonGroup className='w-full'>
            <Button
                fullWidth
                onClick={() => {
                    show(
                        <Modal>
                            <Modal.Header title="We've sent you an email" />
                            <Modal.Content>
                                <SentEmailContent platform={platform} />
                            </Modal.Content>
                        </Modal>
                    );
                }}
                size='lg'
                variant='secondary'
            >
                Forgot password?
            </Button>
            <CreateAccountButton buttonText='Add account' password={password} />;
        </ButtonGroup>
    );
};

export default AddAccountButtonsGroup;
