import classNames from 'classnames';
import React from 'react';
import { Icon, Text } from '@deriv/components';
import { jurisdictionVerificationContents } from 'Constants/jurisdiction-contents/jurisdiction-verification-contents';
import { TJurisdictionCardBackProps } from 'Containers/props.types';

const JurisdictionCardBack = ({
    card_classname,
    toggleCardFlip,
    verification_docs,
    is_card_selected,
}: TJurisdictionCardBackProps) => (
    <div
        className={classNames(card_classname, 'cfd-card-back', {
            [`${card_classname}--selected selected-card`]: is_card_selected,
        })}
    >
        <div
            className={classNames(
                `${card_classname}__card-content-container`,
                `${card_classname}__card-flipped-container`
            )}
        >
            <div>
                <Icon
                    onClick={toggleCardFlip}
                    className='cfd-card-back-section-back-button'
                    icon='IcBackButton'
                    size={20}
                />
            </div>
            <Text as='div' size='xxs'>
                {jurisdictionVerificationContents().short_description}
            </Text>
            <div className={classNames('cfd-card-back-section-items-container')}>
                {verification_docs?.map(verification_item => (
                    <div key={verification_item} className='cfd-card-back-section-items-sub-container'>
                        <div>
                            <Icon
                                icon={
                                    jurisdictionVerificationContents().required_verification_docs[verification_item]
                                        ?.icon
                                }
                            />
                        </div>
                        <Text as='span' size='xxs'>
                            {jurisdictionVerificationContents().required_verification_docs[verification_item]?.text}
                        </Text>
                    </div>
                ))}
            </div>
            <div className='cfd-card-section-divider' />
            <div className='cfd-card-back-section-items-container'>
                {jurisdictionVerificationContents().status_references.map(status_item => (
                    <div className='cfd-card-back-section-items-sub-container' key={status_item.color}>
                        <div>
                            <Icon icon={status_item.icon} />
                        </div>
                        <Text as='span' size='xxs'>
                            {status_item.text}
                        </Text>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default JurisdictionCardBack;
