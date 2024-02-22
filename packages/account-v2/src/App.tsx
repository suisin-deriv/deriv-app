// TODO - Remove this once the IDV form is moved out
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { APIProvider } from '@deriv/api';
import { BreakpointProvider } from '@deriv/quill-design';
import { INITIAL_VALUES } from './mocks/idv-form.mock';
import { CountrySelector } from './modules/CountrySelector';
import RouteLinks from './router/components/route-links/route-links';
import './index.scss';
import { Formik } from 'formik';

const App: React.FC = () => {
    return (
        <APIProvider standalone>
            <BreakpointProvider>
                <div className=' text-solid-slate-500 text-heading-h1'>Account V2</div>
                <Formik initialValues={INITIAL_VALUES} onSubmit={() => {}}>
                    <CountrySelector />
                </Formik>
                <RouteLinks />
            </BreakpointProvider>
        </APIProvider>
    );
};

export default App;
