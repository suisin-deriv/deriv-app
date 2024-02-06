import React, { useMemo } from 'react';
import { useActiveTradingAccount, useJurisdictionStatus } from '@deriv/api';
import { Provider } from '@deriv/library';
import { Text } from '@deriv/quill-design';
import { Button } from '@deriv-com/ui';
import { useUIContext } from '../../../../../components';
import { TradingAccountCard } from '../../../../../components/TradingAccountCard';
import useRegulationFlags from '../../../../../hooks/useRegulationFlags';
import { THooks } from '../../../../../types';
import { CFDPlatforms, MarketType, MarketTypeDetails } from '../../../constants';
import { TopUpModal, TradeModal } from '../../../modals';
import { MT5AccountIcon } from '../MT5AccountIcon';

const AddedMT5AccountsList = ({ account }: { account: THooks.MT5AccountsList }) => {
    const { data: activeAccount } = useActiveTradingAccount();

    const { uiState } = useUIContext();
    const activeRegulation = uiState.regulation;
    const { isEU } = useRegulationFlags(activeRegulation);

    const { show } = Provider.useModal();
    const { getVerificationStatus } = useJurisdictionStatus();
    const jurisdictionStatus = useMemo(
        () => getVerificationStatus(account.landing_company_short || 'svg', account.status),
        [account.landing_company_short, account.status, getVerificationStatus]
    );

    const marketTypeDetails = MarketTypeDetails(isEU)[account.market_type ?? MarketType.ALL];

    const title = marketTypeDetails?.title;
    const isVirtual = account.is_virtual;

    return (
        <TradingAccountCard
            leading={() => <MT5AccountIcon account={account} />}
            trailing={() => (
                <div className='flex flex-col gap-y-200'>
                    <Button
                        disabled={jurisdictionStatus.is_failed || jurisdictionStatus.is_pending}
                        onClick={() => {
                            if (isVirtual) show(<TopUpModal account={account} platform={CFDPlatforms.MT5} />);
                            // else transferModal;
                        }}
                        variant='outlined'
                    >
                        {isVirtual ? 'Top up' : 'Transfer'}
                    </Button>
                    <Button
                        disabled={jurisdictionStatus.is_failed || jurisdictionStatus.is_pending}
                        onClick={() =>
                            show(
                                <TradeModal
                                    account={account}
                                    marketType={account?.market_type}
                                    platform={CFDPlatforms.MT5}
                                />
                            )
                        }
                    >
                        Open
                    </Button>
                </div>
            )}
        >
            <div className='flex-grow user-select-none'>
                <div className='flex self-stretch flex-center gap-400'>
                    <Text size='sm'>{title}</Text>
                    {!activeAccount?.is_virtual && (
                        <div className='flex items-center rounded-md h-1200 py-50 px-200 gap-200 bg-system-light-secondary-background'>
                            <Text bold size='xs'>
                                {account.landing_company_short?.toUpperCase()}
                            </Text>
                        </div>
                    )}
                </div>
                {!(jurisdictionStatus.is_failed || jurisdictionStatus.is_pending) && (
                    <Text bold size='sm'>
                        {account.display_balance}
                    </Text>
                )}
                <Text size='sm'>{account.display_login}</Text>
            </div>
        </TradingAccountCard>
    );
};

export default AddedMT5AccountsList;
