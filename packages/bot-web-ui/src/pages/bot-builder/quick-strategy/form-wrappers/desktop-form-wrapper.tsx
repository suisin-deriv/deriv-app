import React from 'react';
import classNames from 'classnames';
import { useFormikContext } from 'formik';
import { Button, Text, ThemedScrollbars } from '@deriv/components';
import Icon from '@deriv/components/src/components/icon/icon';
import { observer } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { useDBotStore } from 'Stores/useDBotStore';
import {
    rudderStackSendQsEditStrategyEvent,
    rudderStackSendQsRunStrategyEvent,
    rudderStackSendQsSelectedTabEvent,
    rudderStackSendQsStrategyChangeEvent,
} from '../analytics/rudderstack-quick-strategy';
import { STRATEGIES } from '../config';
import { TFormValues } from '../types';
import { getQsActiveTabString } from '../utils/quick-strategy-string-utils';
import FormTabs from './form-tabs';
import StrategyTabContent from './strategy-tab-content';
import useQsSubmitHandler from './useQsSubmitHandler';
import '../quick-strategy.scss';

type TDesktopFormWrapper = {
    active_tab_ref?: React.MutableRefObject<HTMLDivElement | null>;
    children: React.ReactNode;
    onClickClose: () => void;
};

const FormWrapper: React.FC<TDesktopFormWrapper> = observer(({ children, onClickClose, active_tab_ref }) => {
    const [activeTab, setActiveTab] = React.useState('TRADE_PARAMETERS');
    const { submitForm, isValid, setFieldValue, validateForm, values } = useFormikContext<TFormValues>();
    const { quick_strategy } = useDBotStore();
    const { selected_strategy, setSelectedStrategy } = quick_strategy;
    const strategy = STRATEGIES[selected_strategy as keyof typeof STRATEGIES];
    const { handleSubmit } = useQsSubmitHandler();

    React.useEffect(() => {
        validateForm();
    }, [selected_strategy, validateForm]);

    const onChangeStrategy = (strategy: string) => {
        setSelectedStrategy(strategy);
        setActiveTab('TRADE_PARAMETERS');
        rudderStackSendQsStrategyChangeEvent({ strategy_type: STRATEGIES[strategy]?.rs_strategy_type });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        rudderStackSendQsSelectedTabEvent({ strategy_switcher_mode: getQsActiveTabString(tab) });
    };

    const onEdit = async () => {
        rudderStackSendQsEditStrategyEvent({
            form_values: values,
            strategy_type: STRATEGIES[selected_strategy]?.rs_strategy_type,
            strategy_switcher_mode: getQsActiveTabString(activeTab),
        });
        await setFieldValue('action', 'EDIT');
        submitForm();
    };

    const onRun = () => {
        rudderStackSendQsRunStrategyEvent({
            form_values: values,
            strategy_type: STRATEGIES[selected_strategy]?.rs_strategy_type,
            strategy_switcher_mode: getQsActiveTabString(activeTab),
        });
        handleSubmit();
    };

    return (
        <div className='qs'>
            <div className='qs__head'>
                <div className='qs__head__title'>
                    <Text weight='bold'>{localize('Quick Strategy')}</Text>
                </div>
                <div className='qs__head__action'>
                    <span
                        data-testid='qs-desktop-close-button'
                        onClick={onClickClose}
                        tabIndex={0}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter') {
                                onClickClose();
                            }
                        }}
                    >
                        <Icon icon='IcCross' />
                    </span>
                </div>
            </div>
            <div className='qs__body'>
                <div className='qs__body__sidebar'>
                    <div className='qs__body__sidebar__subtitle'>
                        <Text size='xs'>{localize('Choose a template below and set your trade parameters.')}</Text>
                    </div>
                    <div className='qs__body__sidebar__items'>
                        <ul>
                            {(Object.keys(STRATEGIES) as (keyof typeof STRATEGIES)[]).map(key => {
                                const str = STRATEGIES[key];
                                const active = key === selected_strategy;
                                return (
                                    <li
                                        className={classNames({ active })}
                                        key={key}
                                        onClick={() => onChangeStrategy(String(key))}
                                    >
                                        <Text size='xs' weight={active ? 'bold' : 'normal'}>
                                            {str.label}
                                        </Text>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                <div className='qs__body__content'>
                    <ThemedScrollbars
                        className={classNames('qs__form__container', {
                            'qs__form__container--no-footer': activeTab !== 'TRADE_PARAMETERS',
                        })}
                        autohide={false}
                    >
                        <div ref={active_tab_ref}>
                            <FormTabs
                                active_tab={activeTab}
                                onChange={handleTabChange}
                                description={strategy?.description}
                            />
                        </div>
                        <StrategyTabContent formfields={children} active_tab={activeTab} />
                    </ThemedScrollbars>
                    {activeTab === 'TRADE_PARAMETERS' && (
                        <div className='qs__body__content__footer'>
                            <Button secondary disabled={!isValid} onClick={onEdit}>
                                {localize('Edit')}
                            </Button>
                            <Button data-testid='qs-run-button' primary onClick={onRun} disabled={!isValid}>
                                {localize('Run')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default React.memo(FormWrapper);
