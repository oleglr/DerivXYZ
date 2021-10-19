import React            from 'react';
import { formatDate }   from 'Utils/Date';
import { WS }           from 'Services';
import { getRiskAssessment,
    isAccountOfType,
    shouldAcceptTnc,
    shouldCompleteTax } from '_common/base/client_base';
import { localize }     from 'App/i18n';
import {
    LocalStore,
    State }             from '_common/storage';
import { urlFor }       from '_common/url';
import Localize         from '../../App/Components/Elements/localize.jsx';

// TODO: Update links to app_2 links when components are done.
/* eslint-disable react/jsx-no-target-blank */
const client_notifications = {
    currency: {
        header : localize('Set Currency'),
        message: (
            <Localize
                i18n_default_text='Please set the <0>currency</0> of your account to enable trading.'
                components={[<a key={0} className='link link--white' target='_blank' href={urlFor('user/set-currency', undefined, undefined, true)} />]}
            />
        ),
        type: 'danger',
    },
    self_exclusion: (excluded_until) => ({
        header : localize('Self-exclusion Detected'),
        message: (
            <Localize
                i18n_default_text='You have opted to be excluded from Binary.com until {{exclusion_end}}. Please <0>contact us</0> for assistance.'
                values={{ exclusion_end: formatDate(excluded_until, 'DD/MM/YYYY'), interpolation: { escapeValue: false } }}
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('contact', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'danger',
    }),
    authenticate: {
        header : localize('Account Authentication'),
        message: (
            <Localize
                i18n_default_text='<0>Authenticate your account</0> now to take full advantage of all payment methods available.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('user/authenticate', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'info',
    },
    cashier_locked: {
        header : localize('Cashier Disabled'),
        message: localize('Deposits and withdrawals have been disabled on your account. Please check your email for more details.'),
        type   : 'warning',
    },
    withdrawal_locked: {
        header : localize('Withdrawal Disabled'),
        message: localize('Withdrawals have been disabled on your account. Please check your email for more details.'),
        type   : 'warning',
    },
    mt5_withdrawal_locked: {
        header : localize('MT5 Withdrawal Disabled'),
        message: localize('MT5 withdrawals have been disabled on your account. Please check your email for more details.'),
        type   : 'warning',
    },
    document_needs_action: {
        header : localize('Authentication Failed'),
        message: (
            <Localize
                i18n_default_text='<0>Your Proof of Identity or Proof of Address</0> did not meet our requirements. Please check your email for further instructions.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('user/authenticate', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'warning',
    },
    unwelcome: {
        header : localize('Trading and Deposits Disabled'),
        message: (
            <Localize
                i18n_default_text='Trading and deposits have been disabled on your account. Kindly contact <0>customer support</0> for assistance.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('contact', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'danger',
    },
    mf_retail: {
        header : localize('Binary Options Trading Disabled'),
        message: (
            <Localize
                i18n_default_text='Binary Options Trading has been disabled on your account. Kindly contact <0>customer support</0> for assistance.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('contact', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'danger',
    },
    financial_limit: {
        header : localize('Remove Deposit Limits'),
        message: (
            <Localize
                i18n_default_text='Please set your <0>30-day turnover limit</0> to remove deposit limits.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('user/security/self_exclusionws', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'warning',
    },
    risk: {
        header : localize('Withdrawal and Trading Limits'),
        message: (
            <Localize
                i18n_default_text='Please complete the <0>Financial Assessment form</0> to lift your withdrawal and trading limits.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('user/settings/assessmentws', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'info',
    },
    tax: {
        header : localize('Complete your personal details'),
        message: (
            <Localize
                i18n_default_text='Please complete your <0>Personal Details</0> before you proceed.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('user/settings/detailsws', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'danger',
    },
    tnc: {
        header : localize('Terms & Conditions Updated'),
        message: (
            <Localize
                i18n_default_text='Please <0>accept the updated Terms and Conditions</0> to enable deposit and trading.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('user/tnc_approvalws', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'danger',
    },
    required_fields: {
        header : localize('Complete your personal details'),
        message: (
            <Localize
                i18n_default_text='Please complete your <0>Personal Details</0> before you proceed.'
                components={[ <a key={0} className='link link--white' target='_blank' href={urlFor('user/settings/detailsws', undefined, undefined, true)} /> ]}
            />
        ),
        type: 'danger',
    },
};

const hasMissingRequiredField = (response, client) => {
    if (!response.get_settings) return false;

    const { landing_company_shortcode } = client;
    const is_svg = (landing_company_shortcode === 'svg' || landing_company_shortcode === 'costarica');

    let required_fields;
    if (is_svg) {
        required_fields = getSVGRequiredFields();
    } else {
        required_fields = getRequiredFields();
    }

    const get_settings = response.get_settings;
    return required_fields.some(field => !get_settings[field]);

    function getSVGRequiredFields() {
        const necessary_withdrawal_fields = State.getResponse('landing_company.financial_company.requirements.withdrawal');
        const necessary_signup_fields     = State.getResponse('landing_company.financial_company.requirements.signup')
            .map(field => (field === 'residence' ? 'country' : field));

        return [...necessary_withdrawal_fields, ...necessary_signup_fields];
    }

    function getRequiredFields() {
        if (!isAccountOfType('financial')) return [];
        const { residence } = client;

        const required_settings_fields = [
            'account_opening_reason',
            'address_line_1',
            'address_city',
            'phone',
            'tax_identification_number',
            'tax_residence'];
        const address_postcode_is_required = (residence === 'gb' || landing_company_shortcode === 'iom');
        if (address_postcode_is_required) required_settings_fields.push('address_postcode');

        return [...required_settings_fields];
    }
};

const checkAccountStatus = (response, client, addNotification, loginid) => {
    if (!response.get_account_status) return;
    if (loginid !== LocalStore.get('active_loginid')) return;

    const { prompt_client_to_authenticate, status } = response.get_account_status;

    const {
        document_under_review,
        cashier_locked,
        withdrawal_locked,
        mt5_withdrawal_locked,
        document_needs_action,
        unwelcome,
        ukrts_max_turnover_limit_not_set,
        professional,
    } = getStatusValidations(status);
    const is_mf_retail = client.landing_company_shortcode === 'maltainvest' && !professional;

    if (cashier_locked)        addNotification(client_notifications.cashier_locked);
    if (withdrawal_locked)     addNotification(client_notifications.withdrawal_locked);
    if (mt5_withdrawal_locked) addNotification(client_notifications.mt5_withdrawal_locked);
    if (document_needs_action) addNotification(client_notifications.document_needs_action);
    if (unwelcome)             addNotification(client_notifications.unwelcome);
    if (is_mf_retail)          addNotification(client_notifications.mf_retail);
    if (ukrts_max_turnover_limit_not_set) {
        addNotification(client_notifications.financial_limit);
    }
    if (getRiskAssessment()) addNotification(client_notifications.risk);
    if (shouldCompleteTax()) addNotification(client_notifications.tax);

    if ((+prompt_client_to_authenticate) && !(document_under_review || document_needs_action)) {
        addNotification(client_notifications.authenticate);
    }

    function getStatusValidations(status_arr) {
        return status_arr.reduce((validations, account_status) => {
            validations[account_status] = true;
            return validations;
        }, {});
    }
};

export const handleClientNotifications = (client, addNotification, loginid) => {
    const { currency, excluded_until } = client;
    if (!currency)         addNotification(client_notifications.currency);
    if (excluded_until)    addNotification(client_notifications.self_exclusion(excluded_until));

    WS.getAccountStatus().then((response) => checkAccountStatus(response, client, addNotification, loginid));

    WS.sendRequest({ get_settings: 1 }, { forced: true }).then((response) => {
        if (loginid !== LocalStore.get('active_loginid')) return;

        if (shouldAcceptTnc()) addNotification(client_notifications.tnc);

        if (hasMissingRequiredField(response, client)) {
            addNotification(client_notifications.required_fields);
        }
    });
};
