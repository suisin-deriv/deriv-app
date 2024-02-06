import React, { useCallback } from 'react';
import { Input } from '@/components';
import SearchIcon from '../../public/ic-search.svg';
import './Search.scss';

type TSearchProps = {
    name: string;
    onSearch: (value: string) => void;
    placeholder: string;
};

//TODO: replace the component with deriv shared component
const Search = ({ name, onSearch, placeholder }: TSearchProps) => {
    const debounce = (func: (value: string) => void, delay: number) => {
        let timer: ReturnType<typeof setTimeout>;
        return (value: string) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(value), delay);
        };
    };

    const debouncedOnSearch = useCallback(debounce(onSearch, 500), [onSearch]);

    return (
        <form className='p2p-v2-search' onChange={event => debouncedOnSearch((event.target as HTMLInputElement).value)}>
            <Input leadingIcon={<SearchIcon />} name={name} placeholder={placeholder} />
        </form>
    );
};

export default Search;
