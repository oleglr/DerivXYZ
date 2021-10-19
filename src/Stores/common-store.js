import {
    action,
    observable }           from 'mobx';
import moment              from 'moment';
import { currentLanguage } from 'Utils/Language/index';
import BaseStore           from './base-store';

export default class CommonStore extends BaseStore {
    @observable server_time      = moment.utc();
    @observable current_language = currentLanguage;
    @observable has_error        = false;

    @observable error = {
        type   : 'info',
        message: '',
    };

    @observable network_status    = {};
    @observable is_network_online = false;
    @observable is_socket_opened  = false;

    @observable services_error = {};

    @observable deposit_url = '';
    @observable withdraw_url = '';

    @action.bound
    setIsSocketOpened(is_socket_opened) {
        this.is_socket_opened = is_socket_opened;
    }

    @action.bound
    setNetworkStatus(status, is_online) {
        if (this.network_status.class) {
            this.network_status.class   = status.class;
            this.network_status.tooltip = status.tooltip;
        } else {
            this.network_status = status;
        }
        this.is_network_online = is_online;
    }

    @action.bound
    setError(has_error, error) {
        this.has_error = has_error;
        this.error     = {
            type: error ? error.type : 'info',
            ...(error && {
                header             : error.header,
                message            : error.message,
                redirect_label     : error.redirect_label,
                redirectOnClick    : error.redirectOnClick,
                should_show_refresh: error.should_show_refresh,
            }),
        };
    }

    @action.bound
    showError(message, header, redirect_label, redirectOnClick, should_show_refresh) {
        this.setError(true, {
            header,
            message,
            redirect_label,
            redirectOnClick,
            should_show_refresh,
            type: 'error',
        });
    }

    @action.bound
    setDepositURL(deposit_url) {
        this.deposit_url = deposit_url;
    }

    @action.bound
    setWithdrawURL(withdraw_url) {
        this.withdraw_url = withdraw_url;
    }
}
