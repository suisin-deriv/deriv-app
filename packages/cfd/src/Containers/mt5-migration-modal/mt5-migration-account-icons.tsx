import React from 'react';
import { Icon, Text } from '@deriv/components';
import { Localize } from '@deriv/translations';
import { useMT5SVGEligibleToMigrate } from '@deriv/hooks';

const MT5MigrationAccountIcons = () => {
    const {
        eligible_svg_to_bvi_derived_accounts,
        eligible_svg_to_bvi_financial_accounts,
        eligible_svg_to_vanuatu_derived_accounts,
        eligible_svg_to_vanuatu_financial_accounts,
    } = useMT5SVGEligibleToMigrate();

    return (
        <div className='mt5-migration-modal__migration_content-items__list'>
            <div className='mt5-migration-modal__migration_content-items__list--container'>
                <Text weight='bold' size='xs'>
                    <Localize i18n_default_text='Existing account' />
                </Text>
                <div className='mt5-migration-modal__migration_content-items__list--container__icons'>
                    {(eligible_svg_to_bvi_derived_accounts || eligible_svg_to_vanuatu_derived_accounts) && (
                        <Icon icon='IcMt5SvgDerived' size={96} data_testid='dt_migrate_from_svg_derived' />
                    )}
                    {(eligible_svg_to_bvi_financial_accounts || eligible_svg_to_vanuatu_financial_accounts) && (
                        <Icon icon='IcMt5SvgFinancial' size={96} data_testid='dt_migrate_from_svg_financial' />
                    )}
                </div>
            </div>
            <div className='mt5-migration-modal__migration_content-items__list--container'>
                <Text weight='bold' size='xs'>
                    <Localize i18n_default_text='New account' />
                </Text>
                <div className='mt5-migration-modal__migration_content-items__list--container__icons'>
                    {eligible_svg_to_bvi_derived_accounts && (
                        <Icon icon='IcMt5BviDerived' size={96} data_testid='dt_migrate_to_bvi_derived' />
                    )}
                    {eligible_svg_to_bvi_financial_accounts && (
                        <Icon icon='IcMt5BviFinancial' size={96} data_testid='dt_migrate_to_bvi_financial' />
                    )}
                    {eligible_svg_to_vanuatu_derived_accounts && (
                        <Icon icon='IcMt5VanuatuDerived' size={96} data_testid='dt_migrate_to_vanuatu_derived' />
                    )}
                    {eligible_svg_to_vanuatu_financial_accounts && (
                        <Icon icon='IcMt5VanuatuFinancial' size={96} data_testid='dt_migrate_to_vanuatu_financial' />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MT5MigrationAccountIcons;
