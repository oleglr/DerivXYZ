import { getUnderlyingPipSize } from 'Stores/Modules/Trading/Helpers/active-symbols';
import {
    createMarkerEndTime,
    createMarkerPurchaseTime,
    createMarkerSpotEntry,
    createMarkerSpotExit,
    createMarkerStartTime,
    createMarkerSpotMiddle,
    getSpotCount }              from './chart-marker-helpers';
import {
    getChartType,
    getEndTime }                from './logic';
import { unique }               from '_common/utility';
import { MARKER_TYPES_CONFIG }  from '../../SmartChart/Constants/markers';

export const createChartMarkers = (SmartChartStore, contract_info) => {
    if (contract_info) {
        const end_time = getEndTime(contract_info);
        const chart_type = getChartType(contract_info.date_start, end_time);
        if (contract_info.tick_count) {
            addTickMarker(SmartChartStore, contract_info);
        } else if (chart_type !== 'candle') {
            addMarker(marker_spots, SmartChartStore, contract_info);
        }
        addMarker(marker_lines, SmartChartStore, contract_info);
    }
};

const marker_spots = {
    [MARKER_TYPES_CONFIG.SPOT_ENTRY.type]: createMarkerSpotEntry,
    [MARKER_TYPES_CONFIG.SPOT_EXIT.type] : createMarkerSpotExit,
};

const marker_lines = {
    [MARKER_TYPES_CONFIG.LINE_START.type]   : createMarkerStartTime,
    [MARKER_TYPES_CONFIG.LINE_END.type]     : createMarkerEndTime,
    [MARKER_TYPES_CONFIG.LINE_PURCHASE.type]: createMarkerPurchaseTime,
};

const addMarker = async (marker_obj, SmartChartStore, contract_info) => {
    const decimal_places = await getUnderlyingPipSize(contract_info.underlying);
    Object.keys(marker_obj).forEach(createMarker);

    function createMarker(marker_type) {
        if (marker_type in SmartChartStore.markers) return;

        const marker_config = marker_obj[marker_type](contract_info, decimal_places);
        if (marker_config) {
            SmartChartStore.createMarker(marker_config);
        }
    }
};

const addLabelAlignment = (tick, idx, arr) => {
    if (idx > 0 && arr.length) {
        const prev_tick = arr[idx - 1];

        if (+tick > +prev_tick.tick) tick.align_label = 'top';
        if (+tick.tick < +prev_tick.tick) tick.align_label = 'bottom';
        if (+tick.tick === +prev_tick.tick) tick.align_label = prev_tick.align_label;
    }

    return tick;
};

const addTickMarker = async (SmartChartStore, contract_info) => {
    const tick_stream = unique(contract_info.tick_stream, 'epoch').map(addLabelAlignment);
    const decimal_places = await getUnderlyingPipSize(contract_info.underlying);

    tick_stream.forEach((tick, idx) => {
        const is_entry_spot  = idx === 0 && +tick.epoch !== contract_info.exit_tick_time;
        const is_middle_spot = idx > 0 && +tick.epoch !== +contract_info.exit_tick_time;
        const is_exit_spot   = +tick.epoch === +contract_info.exit_tick_time ||
            getSpotCount(contract_info, idx) === contract_info.tick_count;

        let marker_config;
        if (is_entry_spot) {
            marker_config = createMarkerSpotEntry(contract_info, decimal_places);
        } else if (is_middle_spot) {
            marker_config = createMarkerSpotMiddle(contract_info, tick, decimal_places, idx);
        } else if (is_exit_spot) {
            tick.align_label = 'top'; // force exit spot label to be 'top' to avoid overlapping
            marker_config = createMarkerSpotExit(contract_info, tick, decimal_places, idx);
        }

        if (marker_config) {
            if (marker_config.type in SmartChartStore.markers) return;

            SmartChartStore.createMarker(marker_config);
        }
    });
};
