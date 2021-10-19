import PropTypes                      from 'prop-types';
import React                          from 'react';
import { PropTypes as MobxPropTypes } from 'mobx-react';
import { connect }                    from 'Stores/connect';
import { convertDurationLimit }       from 'Stores/Modules/Trading/Helpers/duration';
import Duration                       from './duration.jsx';

class DurationWrapper extends React.Component {
    state = {
        min_value: 0,
        max_value: 0,
    };

    hasDurationUnit = (duration_unit) => {
        let duration_list = [...this.props.duration_units_list];

        if (this.props.duration_units_list.length > 1 && !this.props.is_advanced_duration) {
            duration_list = duration_list.filter(du => du.value === 'm' || du.value === 't');
        }
        return duration_list.some(du => du.value === duration_unit);
    };

    setDurationUnit() {
        const new_duration_unit  = this.props.duration_units_list[0].value;
        const new_duration_value = this.props.getDurationFromUnit(new_duration_unit);

        this.props.onChangeUiStore({ name: `${this.props.is_advanced_duration ? 'advanced' : 'simple'}_duration_unit`, value: new_duration_unit });
        this.props.onChangeMultiple({
            duration_unit: new_duration_unit,
            duration     : +new_duration_value,
        });
    }

    advancedHasWrongExpiry = () => (this.props.is_advanced_duration
        && this.props.expiry_type !== this.props.advanced_expiry_type);

    handleEndTime = () => {
        const symbol_has_endtime = this.props.duration_units_list.length > 1  || this.props.is_advanced_duration;

        if (symbol_has_endtime) {
            // simple duration does not have endtime
            if (!this.props.is_advanced_duration) this.props.onChangeUiStore({ name: 'is_advanced_duration', value: true });

            this.props.onChangeUiStore({ name: 'advanced_expiry_type', value: 'endtime' });
        } else {
            // If query string contains endtime but contract type does not e.g. digits (only ticks contracts)
            this.props.onChange({ target: { name: 'expiry_type', value: 'duration' } });
        }
    };

    getDurationMinMaxValues = (duration_min_max, contract_expiry_type, duration_unit) => {
        const max_value = convertDurationLimit(+duration_min_max[contract_expiry_type].max, duration_unit);
        const min_value = convertDurationLimit(+duration_min_max[contract_expiry_type].min, duration_unit);

        return [min_value, max_value];
    };

    componentDidMount() {
        const {
            advanced_duration_unit,
            advanced_expiry_type,
            contract_expiry_type,
            duration,
            duration_min_max,
            duration_unit,
            expiry_type,
            getDurationFromUnit,
            is_advanced_duration,
            onChange,
            onChangeUiStore,
            simple_duration_unit,
        } = this.props;

        const current_unit = is_advanced_duration ? advanced_duration_unit : simple_duration_unit;
        const current_duration = getDurationFromUnit(current_unit);
        const [min_value, max_value] =
            this.getDurationMinMaxValues(duration_min_max, contract_expiry_type, duration_unit);

        this.setState({ min_value, max_value });

        if (duration_unit !== current_unit) {
            onChangeUiStore({ name: `${is_advanced_duration ? 'advanced' : 'simple'}_duration_unit`, value: duration_unit });
        }

        if (+duration !== +current_duration) {
            onChangeUiStore({ name: `duration_${duration_unit}`, value: duration });
        }

        if (expiry_type === 'endtime') this.handleEndTime();

        if (this.advancedHasWrongExpiry()) {
            onChange({ target: { name: 'expiry_type', value: advanced_expiry_type } });
        }

        if (current_duration < min_value) {
            onChangeUiStore({ name: `duration_${duration_unit}`, value: min_value });
            onChange({ target: { name: 'duration', value: min_value } });
        } else if (current_duration > max_value) {
            onChangeUiStore({ name: `duration_${duration_unit}`, value: max_value });
            onChange({ target: { name: 'duration', value: max_value } });
        }
    }

    // intercept changes to contract duration and check that trade_store and ui_store are aligned.
    componentWillReact() {
        const {
            advanced_expiry_type,
            contract_expiry_type,
            duration,
            duration_min_max,
            duration_unit,
            expiry_type,
            getDurationFromUnit,
            is_advanced_duration,
            onChange,
            onChangeUiStore,
        } = this.props;

        const current_duration            = getDurationFromUnit(duration_unit);
        const simple_is_not_type_duration = (!is_advanced_duration && expiry_type !== 'duration');
        const [min_value, max_value] =
            this.getDurationMinMaxValues(duration_min_max, contract_expiry_type, duration_unit);

        this.setState({ min_value, max_value });

        // simple only has expiry type duration
        if (simple_is_not_type_duration) {
            onChange({ target: { name: 'expiry_type', value: 'duration' } });
        }

        if (this.advancedHasWrongExpiry()) {
            onChange({ target: { name: 'expiry_type', value: advanced_expiry_type } });
        }

        if (+duration !== +current_duration) {
            onChangeUiStore({ name: `duration_${duration_unit}`, value: duration });
        }
    }

    render() {
        const current_duration_unit           = (this.props.is_advanced_duration ?
            this.props.advanced_duration_unit : this.props.simple_duration_unit);
        const has_missing_duration_unit       = !this.hasDurationUnit(current_duration_unit);
        const simple_is_missing_duration_unit = (!this.props.is_advanced_duration && this.props.simple_duration_unit === 'd' && this.props.duration_units_list.length === 4);

        if (has_missing_duration_unit || simple_is_missing_duration_unit) {
            this.setDurationUnit();
        }

        return (
            <Duration
                hasDurationUnit={this.hasDurationUnit}
                {...this.state}
                {...this.props}
            />
        );
    }
}

DurationWrapper.propTypes = {
    advanced_duration_unit: PropTypes.string,
    advanced_expiry_type  : PropTypes.string,
    contract_expiry_type  : PropTypes.string,
    duration              : PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    duration_d: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    duration_h: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    duration_m: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    duration_min_max: PropTypes.object,
    duration_s      : PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    duration_t: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    duration_unit      : PropTypes.string,
    duration_units_list: MobxPropTypes.arrayOrObservableArray,
    expiry_date        : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    expiry_time         : PropTypes.string,
    expiry_type         : PropTypes.string,
    getDurationFromUnit : PropTypes.func,
    is_advanced_duration: PropTypes.bool,
    is_minimized        : PropTypes.bool,
    market_open_times   : PropTypes.array,
    onChange            : PropTypes.func,
    onChangeMultiple    : PropTypes.func,
    onChangeUiStore     : PropTypes.func,
    sessions            : MobxPropTypes.arrayOrObservableArray,
    simple_duration_unit: PropTypes.string,
    start_date          : PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    start_time: PropTypes.string,
    symbol    : PropTypes.string,
};

export default connect(({ modules, ui }) => ({
    advanced_duration_unit: ui.advanced_duration_unit,
    advanced_expiry_type  : ui.advanced_expiry_type,
    contract_expiry_type  : modules.trade.contract_expiry_type,
    duration              : modules.trade.duration,
    duration_unit         : modules.trade.duration_unit,
    duration_units_list   : modules.trade.duration_units_list,
    duration_min_max      : modules.trade.duration_min_max,
    duration_t            : ui.duration_t,
    expiry_date           : modules.trade.expiry_date,
    expiry_time           : modules.trade.expiry_time,
    expiry_type           : modules.trade.expiry_type,
    getDurationFromUnit   : ui.getDurationFromUnit,
    is_advanced_duration  : ui.is_advanced_duration,
    onChange              : modules.trade.onChange,
    onChangeUiStore       : ui.onChangeUiStore,
    onChangeMultiple      : modules.trade.onChangeMultiple,
    simple_duration_unit  : ui.simple_duration_unit,
    start_date            : modules.trade.start_date,
    market_open_times     : modules.trade.market_open_times,
}))(DurationWrapper);
