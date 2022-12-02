import React from 'react';
import classNames from 'classnames';
import { Autocomplete, Button, DesktopWrapper, Input, MobileWrapper, Text, SelectNative } from '@deriv/components';
import { Formik, Field, FormikProps, FormikValues, FormikHelpers } from 'formik';
import { localize, Localize } from '@deriv/translations';
import { formatInput, WS } from '@deriv/shared';
import FormFooter from 'Components/form-footer';
import { getDocumentData, getRegex } from './utils';
import BackButtonIcon from 'Assets/ic-poi-back-btn.svg';
import DocumentSubmitLogo from 'Assets/ic-document-submit-icon.svg';

type TIdvDocumentSubmit = {
    handleBack: () => void;
    handleViewComplete: () => void;
    selected_country: {
        value: string;
        identity: {
            services: {
                idv: {
                    has_visual_sample: boolean;
                    documents_supported: Record<string, { display_name: string; format: string }>;
                };
            };
        };
    };
    is_from_external: boolean;
};

type TFormValues = {
    error_message?: string;
    document_type?: string;
    document_number?: string;
};

const IdvDocumentSubmit = ({
    handleBack,
    handleViewComplete,
    selected_country,
    is_from_external,
}: Partial<FormikProps<FormikValues>> & TIdvDocumentSubmit) => {
    const [document_list, setDocumentList] = React.useState<object[]>([]);
    const [document_image, setDocumentImage] = React.useState<string | null>(null);
    const [is_input_disable, setInputDisable] = React.useState(true);
    const [is_doc_selected, setDocSelected] = React.useState(false);
    const document_data = selected_country?.identity.services.idv.documents_supported;
    const {
        value: country_code,
        identity: {
            services: {
                idv: { has_visual_sample },
            },
        },
    } = selected_country;

    React.useEffect(() => {
        // NOTE: This is a temporary filter. Remove after backend handles this from their side
        const document_types = Object.keys(document_data);
        const filtered_documents = ['gh', 'ng'].includes(country_code)
            ? document_types.filter(d => d !== 'voter_id')
            : document_types;

        setDocumentList(
            filtered_documents.map(key => {
                const { display_name, format } = document_data[key];
                const { new_display_name, example_format, sample_image } = getDocumentData(country_code, key) || {};

                return {
                    id: key,
                    text: new_display_name || display_name,
                    value: format,
                    sample_image,
                    example_format,
                };
            })
        );
    }, [country_code, document_data]);

    type TsetFieldValue = FormikHelpers<FormikValues>['setFieldValue'];

    const resetDocumentItemSelected = (setFieldValue: TsetFieldValue) => {
        // debugger;
        setFieldValue(
            'document_type',
            {
                id: '',
                text: '',
                value: '',
                example_format: '',
                sample_image: '',
            },
            true
        );
        setDocumentImage(null);
    };

    const initial_form_values: TFormValues = {
        document_type: '',
        document_number: '',
    };

    const getDocument = (text: FormikValues) => {
        return document_list.find((d: any) => d.text === text);
    };

    const getExampleFormat = (example_format: boolean) => {
        return example_format ? localize('Example: ') + example_format : '';
    };

    const validateFields = (values: FormikValues) => {
        const errors: TFormValues = {};
        const { document_type, document_number } = values;

        if (!document_type || !document_type.text || !document_type.value) {
            errors.document_type = localize('Please select a document type.');
        } else {
            setInputDisable(false);
        }

        if (!document_number) {
            errors.document_number =
                localize('Please enter your document number. ') + getExampleFormat(document_type.example_format);
        } else {
            const format_regex = getRegex(document_type.value);
            if (!format_regex.test(document_number)) {
                errors.document_number =
                    localize('Please enter the correct format. ') + getExampleFormat(document_type.example_format);
            }
        }

        return errors;
    };

    const submitHandler = (values: TFormValues, { setSubmitting, setErrors }: FormikHelpers<TFormValues>) => {
        setSubmitting(true);
        const { document_number, document_type }: FormikValues = values;
        const submit_data = {
            identity_verification_document_add: 1,
            document_number,
            document_type: document_type.id,
            issuing_country: country_code,
        };

        WS.send(submit_data).then((response: FormikValues) => {
            setSubmitting(false);
            if (response.error) {
                setErrors({ error_message: response.error.message });
                return;
            }
            handleViewComplete();
        });
    };

    return (
        <Formik initialValues={initial_form_values} validate={validateFields} onSubmit={submitHandler}>
            {({
                dirty,
                errors,
                handleBlur,
                handleChange,
                handleSubmit,
                isSubmitting,
                isValid,
                setFieldValue,
                touched,
                values,
            }: Pick<
                FormikProps<FormikValues>,
                | 'dirty'
                | 'errors'
                | 'handleBlur'
                | 'handleChange'
                | 'handleSubmit'
                | 'isSubmitting'
                | 'isValid'
                | 'setFieldValue'
                | 'touched'
                | 'values'
            >) => (
                <div className='proof-of-identity__container'>
                    <DocumentSubmitLogo className='icon' />
                    <Text className='proof-of-identity btm-spacer' align='center' weight='bold'>
                        {localize('Verify your identity')}
                    </Text>
                    <Text className='proof-of-identity__text btm-spacer' size='xs'>
                        {localize('Please select the document type and enter the ID number.')}
                    </Text>
                    <div className='proof-of-identity__inner-container btm-spacer'>
                        <div className='proof-of-identity__fieldset-container'>
                            <fieldset className='proof-of-identity__fieldset'>
                                <Field name='document'>
                                    {({ field }: FormikValues) => (
                                        <React.Fragment>
                                            <DesktopWrapper>
                                                <div className='document-dropdown'>
                                                    <Autocomplete
                                                        {...field}
                                                        name='document_type'
                                                        data-lpignore='true'
                                                        error={touched?.document_type && errors?.document_type}
                                                        autoComplete='off'
                                                        type='text'
                                                        label={localize('Choose the document type')}
                                                        list_items={document_list}
                                                        value={values?.document_type.text}
                                                        onBlur={(e: FormikValues) => {
                                                            if (typeof handleBlur === 'function') {
                                                                handleBlur(e);
                                                            }
                                                            if (!getDocument(e.target.value)) {
                                                                resetDocumentItemSelected(setFieldValue);
                                                            }
                                                        }}
                                                        onChange={handleChange}
                                                        onItemSelection={(item: {
                                                            id: string;
                                                            text: string;
                                                            value: string;
                                                            sample_image: string;
                                                            example_format: string;
                                                        }) => {
                                                            if (item.text === 'No results found' || !item.text) {
                                                                setDocSelected(false);
                                                                resetDocumentItemSelected(setFieldValue);
                                                            } else {
                                                                if (typeof setFieldValue === 'function') {
                                                                    setFieldValue('document_type', item, true);
                                                                }
                                                                setDocSelected(true);
                                                                if (has_visual_sample) {
                                                                    setDocumentImage(item.sample_image || '');
                                                                }
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </DesktopWrapper>
                                            <MobileWrapper>
                                                <SelectNative
                                                    {...field}
                                                    name='document_type'
                                                    error={touched?.document_type && errors?.document_type}
                                                    label={localize('Choose the document type')}
                                                    placeholder={localize('Please select')}
                                                    list_items={document_list}
                                                    value={values?.document_type.text}
                                                    onChange={(e: FormikValues) => {
                                                        if (typeof handleChange === 'function') {
                                                            handleChange(e);
                                                        }
                                                        const selected_document: undefined | FormikValues = getDocument(
                                                            e.target.value
                                                        );
                                                        if (selected_document) {
                                                            setDocSelected(true);
                                                            if (typeof setFieldValue === 'function') {
                                                                setFieldValue('document_type', selected_document, true);
                                                            }
                                                            if (has_visual_sample) {
                                                                setDocumentImage(selected_document.sample_image);
                                                            }
                                                        }
                                                    }}
                                                    use_text={true}
                                                    required
                                                />
                                            </MobileWrapper>
                                        </React.Fragment>
                                    )}
                                </Field>
                            </fieldset>
                            <fieldset className='proof-of-identity__fieldset-input'>
                                <Field name='document_number'>
                                    {({ field }: FormikValues) => (
                                        <Input
                                            {...field}
                                            name='document_number'
                                            bottom_label={
                                                values?.document_type &&
                                                getExampleFormat(values?.document_type.example_format)
                                            }
                                            disabled={is_input_disable}
                                            error={
                                                (touched?.document_number && errors?.document_number) ||
                                                errors?.error_message
                                            }
                                            autoComplete='off'
                                            placeholder='Enter your document number'
                                            value={values?.document_number}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                const { example_format } = values?.document_type;
                                                const current_input: string = example_format.includes('-')
                                                    ? formatInput(example_format, e.currentTarget.value, '-')
                                                    : e.currentTarget.value;
                                                if (typeof setFieldValue === 'function') {
                                                    setFieldValue('document_number', current_input, true);
                                                }
                                                validateFields(values);
                                            }}
                                            required
                                        />
                                    )}
                                </Field>
                            </fieldset>
                        </div>
                        {document_image && (
                            <div
                                className={classNames('proof-of-identity__sample-container', {
                                    'proof-of-identity__sample-container-external': is_from_external,
                                })}
                            >
                                <Text size='xxs' weight='bold'>
                                    {localize('Sample:')}
                                </Text>
                                <div className='proof-of-identity__image-container'>
                                    <img
                                        className='proof-of-identity__image'
                                        src={document_image}
                                        alt='document sample image'
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {is_doc_selected && (
                        <Text
                            className={classNames('proof-of-identity__text btm-spacer', {
                                'top-spacer': is_from_external,
                            })}
                            align='center'
                            size='xs'
                        >
                            <Localize i18n_default_text='Please ensure all your personal details are the same as in your chosen document. If you wish to update your personal details, go to account settings.' />
                        </Text>
                    )}
                    <FormFooter className='proof-of-identity__footer'>
                        <Button className='back-btn' onClick={handleBack} type='button' has_effect large secondary>
                            <BackButtonIcon className='back-btn-icon' /> {localize('Go Back')}
                        </Button>
                        <Button
                            className='proof-of-identity__submit-button'
                            type='submit'
                            onClick={() => handleSubmit()}
                            has_effect
                            is_disabled={!dirty || isSubmitting || !isValid}
                            text={localize('Verify')}
                            large
                            primary
                        />
                    </FormFooter>
                </div>
            )}
        </Formik>
    );
};

export default IdvDocumentSubmit;
