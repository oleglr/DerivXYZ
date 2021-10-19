import classNames          from 'classnames';
import PropTypes           from 'prop-types';
import React               from 'react';
import { CSSTransition }   from 'react-transition-group';
import { NavLink }         from 'react-router-dom';
import { getContractPath } from 'App/Components/Routes/helpers';
import IconCheck           from 'Assets/SvgComponents/portfolio/ic-check.svg';
import IconCross           from 'Assets/SvgComponents/portfolio/ic-cross.svg';
import { localize }        from 'App/i18n';

class ResultOverlay extends React.PureComponent {

    handleClick = (e) => {
        if (this.props.is_unsupported) {
            e.preventDefault();
            this.props.onClick();
        }
    }

    render() {
        const {
            contract_id,
            onClickRemove,
            result } = this.props;
        const is_contract_won = (result === 'won');
        return (
            <React.Fragment>
                <CSSTransition
                    in={!!(result)}
                    timeout={250}
                    classNames={{
                        enter    : 'positions-drawer-card__result--enter',
                        enterDone: 'positions-drawer-card__result--enter-done',
                        exit     : 'positions-drawer-card__result--exit',
                    }}
                    unmountOnExit
                >
                    <div className={classNames('positions-drawer-card__result', {
                        'positions-drawer-card__result--won' : is_contract_won,
                        'positions-drawer-card__result--lost': !is_contract_won,
                    })}
                    >
                        <span
                            className='result__close-btn'
                            onClick={() => onClickRemove(contract_id)}
                        />
                        <NavLink
                            className='result__caption-wrapper'
                            to={getContractPath(contract_id)}
                            onClick={this.handleClick}
                        >
                            <span
                                className={classNames('result__caption', {
                                    'result__caption--won' : is_contract_won,
                                    'result__caption--lost': !is_contract_won,
                                }
                                )}
                            >
                                {
                                    (is_contract_won) ?
                                        <React.Fragment>
                                            {localize('won')}
                                            <IconCheck className='result__icon' />
                                        </React.Fragment>
                                        :
                                        <React.Fragment>
                                            {localize('lost')}
                                            <IconCross className='result__icon' />
                                        </React.Fragment>
                                }
                            </span>
                        </NavLink>
                    </div>
                </CSSTransition>
            </React.Fragment>
        );
    }
}

ResultOverlay.propTypes = {
    contract_id              : PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    has_same_contract_mounted: PropTypes.bool,
    is_unsupported           : PropTypes.bool,
    onClick                  : PropTypes.func,
    onClickRemove            : PropTypes.func,
    result                   : PropTypes.string,
};

export default ResultOverlay;
