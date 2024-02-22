import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import ReactModal from 'react-modal';
import { CUSTOM_STYLES } from '@/helpers';
import { SignupScreens } from '../SignupScreens';

export type TSignupFormValues = {
    citizenship: string;
    country: string;
    password: string;
};

const SignupWrapper = () => {
    // setIsOpen will be added later when flow is completed
    const [isOpen] = useState(false);
    const [step, setStep] = useState(1);

    const initialValues = {
        country: '',
        citizenship: '',
        password: '',
    };

    const handleSubmit = () => {
        // will be added later
    };

    useEffect(() => {
        ReactModal.setAppElement('#v2_modal_root');
    }, []);

    return (
        <ReactModal isOpen={isOpen} shouldCloseOnOverlayClick={false} style={CUSTOM_STYLES}>
            <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                <Form>
                    <SignupScreens setStep={setStep} step={step} />
                </Form>
            </Formik>
        </ReactModal>
    );
};

export default SignupWrapper;
