import React from 'react';
import classNames from 'classnames';
import { Field, FieldProps, useFormikContext } from 'formik';
import { ApiHelpers } from '@deriv/bot-skeleton';
import { Autocomplete, Text } from '@deriv/components';
import { TItem } from '@deriv/components/src/components/dropdown-list';
import { observer, useStore } from '@deriv/stores';
import { useDBotStore } from 'Stores/useDBotStore';
import { rudderStackSendQsParameterChangeEvent } from '../analytics/rudderstack-quick-strategy';
import { setRsDropdownTextToLocalStorage } from '../analytics/utils';
import { TApiHelpersInstance, TDropdownItems, TFormData } from '../types';

type TContractTypes = {
    name: string;
    attached?: boolean;
};

const ContractTypes: React.FC<TContractTypes> = observer(({ name }) => {
    const { ui } = useStore();
    const { is_mobile } = ui;
    const [list, setList] = React.useState<TDropdownItems[]>([]);
    const { quick_strategy } = useDBotStore();
    const { setValue } = quick_strategy;
    const { setFieldValue, validateForm, values } = useFormikContext<TFormData>();
    const { symbol, tradetype } = values;
    const selected = values?.type;

    React.useEffect(() => {
        if (tradetype && symbol && selected !== '') {
            const getContractTypes = async () => {
                const { contracts_for } = ApiHelpers.instance as unknown as TApiHelpersInstance;
                const categories = await contracts_for.getContractTypes(tradetype);
                setList(categories);
                const has_selected = categories?.some(contract => contract.value === selected);
                if (!has_selected) {
                    setFieldValue?.(name, categories?.[0]?.value);
                    setValue(name, categories?.[0]?.value);
                    validateForm();
                    setRsDropdownTextToLocalStorage(categories?.[0]?.text, name);
                } else {
                    const curzrent_selected = categories?.find(contract => contract.value === selected);
                    setRsDropdownTextToLocalStorage(curzrent_selected?.text ?? '', name);
                }
            };
            getContractTypes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, tradetype, selected]);

    const handleChange = (value: string, text: string) => {
        setFieldValue?.(name, value);
        setValue(name, value);
        rudderStackSendQsParameterChangeEvent({
            parameter_type: name,
            parameter_value: text,
            parameter_field_type: 'dropdown',
        });
        setRsDropdownTextToLocalStorage(text, name);
    };

    const key = `qs-contract-type-${name}`;

    return (
        <div className='qs__form__field qs__form__field__input no-top-spacing'>
            <Field name={name} key={key} id={key}>
                {({ field }: FieldProps) => {
                    const selected_item = list?.find(item => item?.value === field?.value);
                    if (is_mobile) {
                        return (
                            <ul className='qs__form__field__list' data-testid='dt-qs-contract-types'>
                                {list.map(item => {
                                    const is_active = selected_item?.value === item?.value;
                                    return (
                                        <li
                                            key={item?.value}
                                            className={classNames('qs__form__field__list__item', {
                                                'qs__form__field__list__item--active': is_active,
                                            })}
                                            onClick={() => {
                                                handleChange(item?.value, item?.text);
                                            }}
                                        >
                                            <Text size='xs' color='prominent' weight={is_active ? 'bold ' : 'normal'}>
                                                {item?.text}
                                            </Text>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    }
                    return (
                        <Autocomplete
                            {...field}
                            readOnly
                            inputMode='none'
                            data-testid='qs_autocomplete_contract_type'
                            autoComplete='off'
                            className='qs__select contract-type'
                            value={selected_item?.text || ''}
                            list_items={list}
                            onItemSelection={(item: TItem) => {
                                const { value, text } = item as TDropdownItems;
                                if (value) {
                                    handleChange(value, text);
                                }
                            }}
                        />
                    );
                }}
            </Field>
        </div>
    );
});

export default ContractTypes;
