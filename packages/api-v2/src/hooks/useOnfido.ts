import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import useOnfidoServiceToken from './useOnfidoServiceToken';
import { ALPHA_2_TO_ALPHA_3, ONFIDO_PHRASES } from '../constants';
import useSettings from './useSettings';
import useResidenceList from './useResidenceList';
import type { SdkHandle, SdkResponse } from '../types/onfido';
import useOnfidoNotificationEvent from './useOnfidoNotificationEvent';
import { v4 as uuidv4 } from 'uuid';

/** A custom hook to initialize Onfido SDK.
 * To initialize Onfido, ensure that an empty container is present.
 * Call the hook and use `onfidoContainerId` to mark the empty container where the Onfido UI is to be mounted.
 * For example:
 * ```
 * const { data: { onfidoContainerId } } = useOnfido()
 * ...
 * return (
 *    <>
 *       ...
 *       <div id={onfidoContainerId}></div>
 *       ...
 *    </>
 * )
 * ```
 */
const useOnfido = () => {
    // use to check that we do not re-attempt to reload the onfido script while its still loading
    const [isOnfidoLoading, setIsOnfidoLoading] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    /**
     * A reference to the Onfido SDK
     */
    const onfidoRef = useRef<SdkHandle | null>(null);
    /**
     * A generated ID which should be assigned to a container where the Onfido UI is to be mounted.
     * For example:
     * ```
     * const { data: { onfidoContainerId } } = useOnfido()
     * ...
     * return (
     *    <>
     *       ...
     *       <div id={onfidoContainerId}></div>
     *       ...
     *    </>
     * )
     * ```
     */
    const onfidoContainerId = useMemo(() => uuidv4(), []);

    // settings for retrieving country code
    const { data: settings } = useSettings();
    // residence list for retrieving supported documents for onfido for the user's country
    const { data: residenceList } = useResidenceList();
    // onfido service token to be passed in Onfido SDK
    const {
        data: { token },
    } = useOnfidoServiceToken();
    // notification event for onfido once user submits documents
    const { mutate: submitDocuments } = useOnfidoNotificationEvent();

    const countryCode = useMemo(() => {
        return settings?.country_code || '';
    }, [settings?.country_code]);

    const supportedDocuments = useMemo(() => {
        if (countryCode && residenceList.length) {
            const onfidoResidence = residenceList.find(residence => residence?.value === countryCode)?.identity
                ?.services?.onfido;

            if (onfidoResidence && onfidoResidence.is_country_supported) {
                return Object.keys(onfidoResidence.documents_supported || {}).map(
                    (document: string) => onfidoResidence.documents_supported?.[document].display_name
                );
            }
        }
        return [];
    }, [residenceList, countryCode]);

    const onComplete = useCallback(
        (data: Omit<SdkResponse, 'data'> & { data?: { id?: string } }) => {
            const document_ids = Object.keys(data).map(key => data[key as keyof SdkResponse]?.id || '');
            submitDocuments(document_ids);
            setHasSubmitted(true);
        },
        [submitDocuments]
    );

    const initOnfido = useCallback(async () => {
        const i18NLanguage = window.localStorage.getItem('i18n_language')?.toLowerCase() || 'en';
        const onfidoCountryCode =
            countryCode.length !== 3 ? ALPHA_2_TO_ALPHA_3[countryCode.toUpperCase()] : settings?.country_code;

        onfidoRef.current = await window.Onfido.init({
            containerId: onfidoContainerId,
            language: {
                locale: i18NLanguage,
                phrases: ONFIDO_PHRASES,
                mobilePhrases: ONFIDO_PHRASES,
            },
            token,
            useModal: false,
            useMemoryHistory: true,
            onComplete,
            steps: [
                {
                    type: 'document',
                    options: {
                        documentTypes: {
                            passport: supportedDocuments.some(doc => /Passport/g.test(doc || '')),
                            driving_licence: supportedDocuments.some(doc => /Driving Licence/g.test(doc || ''))
                                ? {
                                      country: onfidoCountryCode,
                                  }
                                : false,
                            national_identity_card: supportedDocuments.some(doc =>
                                /National Identity Card/g.test(doc || '')
                            )
                                ? {
                                      country: onfidoCountryCode,
                                  }
                                : false,
                        },
                        hideCountrySelection: true,
                    },
                },
                'face',
            ],
        });
    }, [countryCode, onComplete, onfidoContainerId, settings?.country_code, supportedDocuments, token]);

    const loadOnfidoSdkScript = useCallback(() => {
        const hasOnfidoScriptNode = !!document.getElementById('onfido_sdk');
        // check if the onfido sdk script has been loaded, and if its still loading the onfido script, don't re-attempt to load the script again
        if (hasOnfidoScriptNode) {
            if (!isOnfidoLoading) initOnfido();
        } else {
            setIsOnfidoLoading(true);
            const scriptNode = document.createElement('script');
            const linkNode = document.createElement('link');

            scriptNode.id = 'onfido_sdk';
            scriptNode.src = 'https://assets.onfido.com/web-sdk-releases/latest/onfido.min.js';
            linkNode.href = 'https://assets.onfido.com/web-sdk-releases/latest/style.css';
            linkNode.rel = 'stylesheet';

            document.body.appendChild(scriptNode);
            document.body.appendChild(linkNode);

            scriptNode.addEventListener('load', () => {
                initOnfido();
                setIsOnfidoLoading(false);
            });
        }
    }, [initOnfido, isOnfidoLoading]);

    useEffect(() => {
        if (token && supportedDocuments.length && countryCode) {
            loadOnfidoSdkScript();
        }
    }, [token, supportedDocuments, countryCode, loadOnfidoSdkScript]);

    return {
        data: {
            onfidoRef,
            onfidoContainerId,
            hasSubmitted,
        },
    };
};

export default useOnfido;
