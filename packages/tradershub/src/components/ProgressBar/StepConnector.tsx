import React from 'react';
import { qtMerge } from '@deriv/quill-design';
import { desktopStyle, mobileStyle } from './ProgressBar.classnames';

const StepConnector = ({ isActive }: { isActive?: boolean }) => (
    <div
        aria-current={isActive}
        className={qtMerge(
            'via-solid-grey-default to-solid-grey-default from-solid-coral-700 from-50% via-50% transition-all duration-700 ease-out',
            mobileStyle.connector,
            desktopStyle.connector
        )}
    >
        {' '}
    </div>
);

export default StepConnector;
