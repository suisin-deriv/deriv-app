import React from 'react';
import { Form, Formik, FormikValues } from 'formik';
import { useSettings, useStatesList } from '@deriv/api';
import { LabelPairedChevronDownMdRegularIcon } from '@deriv/quill-icons';
import { Dropdown, Input, Text } from '@deriv-com/ui';
import Actions from '../../flows/RealAccountSIgnup/SignupWizard/Actions';
import WizardScreenWrapper from '../../flows/RealAccountSIgnup/SignupWizard/WizardScreenWrapper';
import { ACTION_TYPES, useSignupWizardContext } from '../../providers/SignupWizardProvider/SignupWizardContext';

/**
 * @name Address
 * @description The Address component is used to display the address screen.
 * @example <Address />
 * @returns {React.ReactNode}
 */
const Address = () => {
    const { data: getSettings } = useSettings();
    const country = getSettings?.country_code ?? '';
    const { data: statesList } = useStatesList(country);
    const { dispatch, state } = useSignupWizardContext();

    const handleSubmit = (values: FormikValues) => {
        dispatch({
            payload: {
                firstLineAddress: values.firstLineAddress,
                secondLineAddress: values.secondLineAddress,
                stateProvince: values.stateProvince,
                townCity: values.townCity,
                zipCode: values.zipCode,
            },
            type: ACTION_TYPES.SET_ADDRESS,
        });
    };

    const initialValues = {
        firstLineAddress: getSettings?.address_line_1 ?? state.firstLineAddress,
        secondLineAddress: getSettings?.address_line_2 ?? state.secondLineAddress,
        stateProvince: getSettings?.address_state ?? state.stateProvince,
        townCity: getSettings?.address_city ?? state.townCity,
        zipCode: getSettings?.address_postcode ?? state.zipCode,
    };

    return (
        <WizardScreenWrapper heading='Complete your address details'>
            <Formik enableReinitialize initialValues={initialValues} onSubmit={handleSubmit}>
                {({ handleBlur, handleChange, setFieldValue, values }) => (
                    <Form className='flex flex-col flex-grow w-full overflow-y-auto'>
                        <div className='flex-1 overflow-y-auto p-1200'>
                            <div className='flex flex-col'>
                                <Text size='sm' weight='bold'>
                                    Only use an address for which you have proof of residence -
                                </Text>
                                <Text size='sm'>
                                    a recent utility bill (e.g. electricity, water, gas, landline or internet), bank
                                    statement, or government-issued letter with your name and this address.
                                </Text>
                            </div>
                            <div className='flex flex-col items-center self-stretch gap-2000 mt-1500'>
                                <Input
                                    className='text-body-sm'
                                    label='First line of address*'
                                    name='firstLineAddress'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    required
                                    value={values.firstLineAddress}
                                />
                                <Input
                                    className='text-body-sm'
                                    label='Second line of address'
                                    name='secondLineAddress'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.secondLineAddress}
                                />
                                <Input
                                    className='text-body-sm'
                                    label='Town/City*'
                                    name='townCity'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    required
                                    value={values.townCity}
                                />
                                <div>
                                    <Dropdown
                                        dropdownIcon={<LabelPairedChevronDownMdRegularIcon />}
                                        label='State/Province'
                                        list={statesList}
                                        name='stateProvince'
                                        onSelect={selectedItem => {
                                            setFieldValue('stateProvince', selectedItem);
                                        }}
                                        value={values.stateProvince}
                                        variant='comboBox'
                                    />
                                </div>
                                <Input
                                    className='text-body-sm'
                                    label='Postal/ZIP Code'
                                    name='zipCode'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.zipCode}
                                />
                            </div>
                        </div>
                        <Actions />
                    </Form>
                )}
            </Formik>
        </WizardScreenWrapper>
    );
};

export default Address;
