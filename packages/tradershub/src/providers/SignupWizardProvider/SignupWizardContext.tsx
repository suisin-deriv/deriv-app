import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { useStep } from 'usehooks-ts';
import { Helpers, TSignupWizardContext, TSignupWizardProvider } from './types';
import { valuesReducer } from './ValuesReducer';

export const ACTION_TYPES = {
    RESET: 'RESET',
    SET_ADDRESS: 'SET_ADDRESS',
    SET_CURRENCY: 'SET_CURRENCY',
    SET_PERSONAL_DETAILS: 'SET_PERSONAL_DETAILS',
} as const;

const initialHelpers: Helpers = {
    canGoToNextStep: false,
    canGoToPrevStep: false,
    goToNextStep: /* noop */ () => {
        /* noop */
    },
    goToPrevStep: /* noop */ () => {
        /* noop */
    },
    reset: /* noop */ () => {
        /* noop */
    },
    setStep: /* noop */ (() => {
        /* noop */
    }) as React.Dispatch<React.SetStateAction<number>>,
};

export const SignupWizardContext = createContext<TSignupWizardContext>({
    currentStep: 0,
    dispatch: /* noop */ () => {
        /* noop */
    },
    helpers: initialHelpers,
    isWizardOpen: false,
    setIsWizardOpen: /* noop */ () => {
        /* noop */
    },
    state: {
        currency: '',
    },
});

export const useSignupWizardContext = () => {
    const context = useContext<TSignupWizardContext>(SignupWizardContext);
    if (!context)
        throw new Error('useSignupWizardContext() must be called within a component wrapped in SignupWizardProvider.');

    return context;
};

/**
 * @name SignupWizardProvider
 * @description The SignupWizardProvider component is used to wrap the components that need access to the SignupWizardContext.
 * @param {React.ReactNode} children - The content to be wrapped.
 */
export const SignupWizardProvider = ({ children }: TSignupWizardProvider) => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [currentStep, helpers] = useStep(4);
    const [state, dispatch] = useReducer(valuesReducer, {
        currency: '',
    });

    const contextState = useMemo(
        () => ({
            currentStep,
            dispatch,
            helpers,
            isWizardOpen,
            setIsWizardOpen,
            state,
        }),
        [currentStep, helpers, isWizardOpen, state]
    );

    return <SignupWizardContext.Provider value={contextState}>{children}</SignupWizardContext.Provider>;
};
