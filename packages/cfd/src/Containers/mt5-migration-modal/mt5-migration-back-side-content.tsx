import React from 'react';
import { Button, Checkbox, Modal, Text, StaticUrl } from '@deriv/components';
import { Localize } from '@deriv/translations';
import getMigrationModalDetails from '../../Constants/mt5-migration-modal-content';
import Icon from '@deriv/components/src/components/icon/icon';
import { observer, useStore } from '@deriv/stores';

type TMT5MigrationBackSideContentProps = {
    to_account: string;
    setShowModalFrontSide: (value: boolean) => void;
    onConfirmMigration: () => void;
};

const MT5MigrationBackSideContent = observer(
    ({ to_account, setShowModalFrontSide, onConfirmMigration }: TMT5MigrationBackSideContentProps) => {
        const { ui } = useStore();
        const { is_mobile } = ui;
        const [is_checked, setIsChecked] = React.useState(false);
        const content = getMigrationModalDetails(to_account);
        const header_size = is_mobile ? 'xs' : 's';
        const checkbox_text_size = is_mobile ? 'xxs' : 'xs';
        const content_size = is_mobile ? 'xxxs' : 'xs';

        return (
            <React.Fragment>
                <div>
                    <div className='mt5-migration-modal__description'>
                        <Text as='p' color='general' size={header_size} align='center' weight='bold'>
                            <Localize i18n_default_text='What will happen to the funds in my existing account(s)?' />
                        </Text>
                    </div>
                    <div className='mt5-migration-modal__existing-accounts'>
                        {content.map(item => (
                            <React.Fragment key={item.key}>
                                <div className='mt5-migration-modal__existing-accounts-card'>
                                    <div className='mt5-migration-modal__existing-accounts-card-content'>
                                        <Text as='div' size={header_size} weight='bold'>
                                            {item.title}
                                        </Text>
                                        {item.description.map((desc, idx) => (
                                            <div
                                                key={idx}
                                                className='mt5-migration-modal__existing-accounts-card-content__message'
                                            >
                                                <div>
                                                    <Icon icon='IcMigrationCheck' height={16} width={16} />
                                                </div>
                                                <Text as='div' size={content_size}>
                                                    {desc}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    <div>
                        <div className='mt5-migration-modal__existing-accounts-card-content'>
                            <Checkbox
                                value={is_checked}
                                onChange={() => setIsChecked(!is_checked)}
                                label={
                                    <Text as='p' size={checkbox_text_size} line_height='xs'>
                                        <Localize
                                            i18n_default_text='I agree to move my MT5 account(s) and agree to Deriv BVI Ltd’s <0>terms and conditions</0>'
                                            components={[
                                                <StaticUrl key={0} className='link' href={'tnc/deriv-(bvi)-ltd.pdf'} />,
                                            ]}
                                        />
                                    </Text>
                                }
                                defaultChecked={!!is_checked}
                            />
                        </div>
                    </div>
                </div>
                <Modal.Footer has_separator>
                    <Button type='button' large secondary onClick={() => setShowModalFrontSide(true)}>
                        <Localize i18n_default_text='Back' />
                    </Button>

                    <Button type='button' large primary onClick={onConfirmMigration} disabled={!is_checked}>
                        <Localize i18n_default_text='Next' />
                    </Button>
                </Modal.Footer>
            </React.Fragment>
        );
    }
);

export default MT5MigrationBackSideContent;
