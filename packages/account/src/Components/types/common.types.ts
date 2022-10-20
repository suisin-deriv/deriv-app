import { FormikValues } from 'formik';

export type TFinancialDetails = {
    goToPreviousStep: () => void;
    goToNextStep: () => void;
    getCurrentStep: () => number;
    onSave: (current_step: number, values: FormikValues) => void;
    onSubmit: (
        current_step: number,
        values: FormikValues,
        actions: (isSubmitting: boolean) => void,
        props: () => void
    ) => void;
    onCancel: (current_step: number, props: () => void) => void;
    validate: (values: FormikValues) => object;
    income_source_enum: object | object[];
    employment_status_enum: object | object[];
    employment_industry_enum: object | object[];
    occupation_enum: object | object[];
    source_of_wealth_enum: object | object[];
    education_level_enum: object | object[];
    net_income_enum: object | object[];
    estimated_worth_enum: object | object[];
    account_turnover_enum: object | object[] | undefined;
    forex_trading_experience_enum: object | object[];
    forex_trading_frequency_enum: object | object[];
    binary_options_trading_experience_enum: object | object[] | HTMLElement | undefined;
    binary_options_trading_frequency_enum: object | object[];
    cfd_trading_experience_enum: object | object[];
    cfd_trading_frequency_enum: object | object[];
    other_instruments_trading_experience_enum: object | object[];
    other_instruments_trading_frequency_enum: object | object[];
    value: object;
};
