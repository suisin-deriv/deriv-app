import * as Yup from 'yup';

export const countryValidations = () => ({
    countryInput: Yup.string().required('Please select the country of document issuance.'),
});
