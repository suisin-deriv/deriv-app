import React, { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
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
    isSuccessModalOpen: false,
    isWizardOpen: false,
    setIsSuccessModalOpen: /* noop */ () => {
        /* noop */
    },
    setIsWizardOpen: /* noop */ () => {
        /* noop */
    },
    state: {
        currency: '',
    },
    reset: /* noop */ () => {
        /* noop */
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
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [currentStep, helpers] = useStep(4);
    const [state, dispatch] = useReducer(valuesReducer, {
        currency: '',
    });

    const reset = useCallback(() => {
        dispatch({
            type: ACTION_TYPES.RESET,
        });
        setIsSuccessModalOpen(false);
        setIsWizardOpen(false);
        helpers.setStep(1);
    }, [helpers]);

    const contextState: TSignupWizardContext = useMemo(
        () => ({
            currentStep,
            dispatch,
            helpers,
            isSuccessModalOpen,
            isWizardOpen,
            setIsSuccessModalOpen,
            setIsWizardOpen,
            state,
            reset,
        }),
        [currentStep, helpers, isSuccessModalOpen, isWizardOpen, reset, state]
    );

    return <SignupWizardContext.Provider value={contextState}>{children}</SignupWizardContext.Provider>;
};
