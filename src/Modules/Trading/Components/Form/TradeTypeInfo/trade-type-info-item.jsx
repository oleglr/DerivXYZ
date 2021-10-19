import classNames         from 'classnames';
import PropTypes          from 'prop-types';
import React              from 'react';
import { Scrollbars }     from 'tt-react-custom-scrollbars';
import Icon               from 'Assets/icon.jsx';
import Button             from 'App/Components/Form/button.jsx';
import { localize }       from 'App/i18n';

const TradeTypeInfoItem = ({
    handleNavigationClick,
    handleNextClick,
    handlePrevClick,
    is_dark_theme,
    is_mobile,
    item,
    item_index,
    itemList,
    onBackButtonClick,
    onSubmitButtonClick,
}) => (
    <React.Fragment>
        {!is_mobile &&
        <div className='trade-type-info-dialog__header'>
            <span onClick={() => onBackButtonClick()}>
                <Icon icon='IconBack' />
            </span>
            <span className='title'>{item.text}</span>
        </div>
        }
        <div className='trade-type-info-dialog__body'>
            <div
                className='trade-type-info-dialog__card-wrapper'
                // total calculated below is from 258px and 16px horizontal margin set in trade-info-dialog css
                style={{ 'transform': `translate3d(-${(274 * item_index)}px, 0, 0)`  }}
            >
                {
                    itemList.map((type, idx) => (
                        <div className='trade-type-info-dialog__card' key={idx}>
                            <div className='trade-type-info-dialog__gif'>
                                <Icon
                                    icon='TradeCategoriesGIF'
                                    category={type.value}
                                    className='trade-type-info-dialog__gif-image'
                                    is_dark_theme={is_dark_theme}
                                />
                            </div>
                            <div className='trade-type-info-dialog__content'>
                                <Scrollbars
                                    autoHide
                                    style={{ height: '100%' }}
                                >
                                    <Icon icon='TradeCategories' category={type.value} />
                                </Scrollbars>
                            </div>
                            <div>
                                <Button
                                    className='btn--primary--orange trade-type-info-dialog__choose-button'
                                    onClick={() => onSubmitButtonClick(type)}
                                    text={localize('Choose')}
                                />
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
        <div className='trade-type-info-navigation'>
            <div className='trade-type-info-navigation__icon' onClick={() => handlePrevClick(itemList)} >
                <Icon icon='IconChevronLeft' />
            </div>
            <div className='trade-type-info-navigation__list'>
                <i
                    className={classNames(
                        'trade-type-info-navigation__circle-button',
                        'trade-type-info-navigation__circle-button--active')}
                    style={{ 'transform': `translate3d(${16 * item_index}px, 0, 0)` }}
                />
                {
                    itemList.map((contract, idx) => (
                        <React.Fragment key={idx}>
                            <div
                                className='trade-type-info-navigation__circle-button'
                                onClick={() => handleNavigationClick(contract)}
                            />
                        </React.Fragment>
                    ))
                }
            </div>
            <div className='trade-type-info-navigation__icon' onClick={() => handleNextClick(itemList)} >
                <Icon icon='IconChevronRight' />
            </div>
        </div>
    </React.Fragment>
);

TradeTypeInfoItem.propTypes = {
    handleNavigationClick: PropTypes.func,
    handleNextClick      : PropTypes.func,
    handlePrevClick      : PropTypes.func,
    is_dark_theme        : PropTypes.bool,
    is_mobile            : PropTypes.bool,
    item                 : PropTypes.object,
    item_index           : PropTypes.number,
    itemList             : PropTypes.array,
    onBackButtonClick    : PropTypes.func,
    onSubmitButtonClick  : PropTypes.func,
};

export default TradeTypeInfoItem;
