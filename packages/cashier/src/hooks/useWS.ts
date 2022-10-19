import { useState } from 'react';
import { useWS as useWSShared } from '@deriv/shared';
import { TSocketEndpointNames, TSocketRequestProps, TSocketResponseData } from 'Types';

const useWS = <T extends TSocketEndpointNames>(name: T) => {
    const [is_loading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>();
    const [data, setData] = useState<TSocketResponseData<T>>();
    const WS = useWSShared();

    const send = async (...props: TSocketRequestProps<T> extends never ? [undefined?] : [TSocketRequestProps<T>]) => {
        if (is_loading) return;

        setIsLoading(true);

        try {
            const response = await WS.send({ [name]: 1, ...props });

            if (response.error) {
                setError(response.error);
            } else {
                setData(response[name]);
            }
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    return { send, is_loading, error, data };
};

export default useWS;
