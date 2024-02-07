import React from 'react';
import { useResidenceList } from '@deriv/api';
import FormDropDownField from '../../components/FormFields/FormDropDownField';
import { countryValidations } from './validation';

export const CountrySelector = () => {
    const { data: countryList, isFetched: countryListFetched } = useResidenceList();
    const { countryInput: countryInputSchema } = countryValidations();
    return (
        <div>
            {countryListFetched && (
                <FormDropDownField
                    label='Country'
                    list={countryList}
                    name='countryInput'
                    validationSchema={countryInputSchema}
                />
            )}
        </div>
    );
};
