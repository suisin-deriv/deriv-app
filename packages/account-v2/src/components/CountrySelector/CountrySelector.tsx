import React from 'react';
import { useResidenceList } from '@deriv/api';
import { LabelPairedChevronDownMdRegularIcon } from '@deriv/quill-icons';
import { Dropdown } from '@deriv-com/ui';

type TCountrySelector = {
    errorMessage?: React.ReactNode;
    label: string;
};

const CountrySelector = ({ errorMessage, label }: TCountrySelector) => {
    const { data: residenceList } = useResidenceList();

    return (
        <Dropdown
            dropdownIcon={<LabelPairedChevronDownMdRegularIcon />}
            errorMessage={errorMessage}
            label={label}
            list={residenceList}
            name='country'
            /*eslint-disable @typescript-eslint/no-empty-function */
            onSelect={() => {}}
            variant='prompt'
        />
    );
};

export default CountrySelector;
