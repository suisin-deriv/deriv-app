import React from 'react';
import { Button, Text } from '@deriv/quill-design';
import { useSignupWizardContext } from '../../providers/SignupWizardProvider';

/**
 * `GetADerivAccountBanner` is a functional component that displays a banner message
 * informing the user that they need a Deriv account to create a CFD account.
 * It includes a button that leads the user to a modal where they can create a Deriv account.
 *
 * @returns {React.ReactElement} A `div` element containing the banner message and the button.
 */
const GetADerivAccountBanner = () => {
    const { setIsWizardOpen } = useSignupWizardContext();
    return (
        <div className='flex items-center justify-center w-full p-800 gap-800 rounded-200 bg-system-light-secondary-background'>
            <Text bold>You need a Deriv account to create a CFD account.</Text>
            <Button className='rounded-200' onClick={() => setIsWizardOpen(true)}>
                Get a Deriv account
            </Button>
        </div>
    );
};

export default GetADerivAccountBanner;
