
/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import * as Constants from './constants';
import axios from 'axios';
import TokenUtil from './token'
import {store} from '../index'
import {closeLoading, createLoading} from '../redux/modules/loading'
import {createMessage} from '../redux/modules/message'
// import CookieUtil from './cookie';

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: Constants.BASE_URL,
    withCredentials: true
});

instance.defaults.timeout = Constants.HTTP_TIMEOUT;
// Set a user id in Cookie if it does not exist.
// CookieUtil.initUser()

// 前置拦截器
instance.interceptors.request.use(function (config) {
    // console.log('request config:', config)
    if(config.headers['need_loading']) {
        store.dispatch(createLoading());
        delete config.headers['need_loading']
    }
    if (TokenUtil.getAccessToken()) {
        config.headers['header_ci_token'] = TokenUtil.getAccessToken();
    }
    if (TokenUtil.getRefreshToken()) {
        config.headers['header_ci_refresh_token'] = TokenUtil.getRefreshToken();
    }
    // config.headers['ci-apikey'] = "?.?"
    return config;
}, function (error) {
    store.dispatch(closeLoading());
    // store.dispatch(NotificationAction.setNotificationMsg({
    //     notificationMsg: 'Network error'
    // }));
    return Promise.reject(error);
});

// 后置拦截器
instance.interceptors.response.use(function (response) {
    store.dispatch(closeLoading());
    
    // return response.data.data;
    return responseHandler(response);
}, function (error) {
    store.dispatch(closeLoading());
    if (error.response) {
        // store.dispatch(NotificationAction.setNotificationMsg({
        //     notificationMsg: 'Session expired'
        // }));
        if (401 === error.response.status) {
            login();
        }
    } else if (error.message.includes('timeout')) {
        store.dispatch(createMessage('error', {
            title: 'Reques timeout',
            subtitle: `Request timeout of ${Constants.HTTP_TIMEOUT/1000} seconds exceeded`
        }))
        //return null error. It means the error has been handled.
        return Promise.reject(null);
    }else {
        
        // store.dispatch(NotificationAction.setNotificationMsg({
        //     notificationMsg: error
        // }));
    }
    return Promise.reject(error);
});

// interface Response {
//     data: {
//         retCode: number,
//         msg: string,
//         data: any,
//     },
//     status: Number,
//     statusText: String
// }

const login = () => {
    window.location = (Constants.AUTH_URL
        + Constants.LOGIN
        + "?target="
        + encodeURIComponent(window.location.protocol
          + "//"
          + window.location.host
          + `/${Constants.HASH_SIGN}/`
          +
          (window.location.href.includes('/#/') ?
            window.location.href.replace(window.location.protocol + '//' + window.location.host + '/#/', '') :
            window.location.href.replace(window.location.protocol + '//' + window.location.host + '/', ''))
          // window.location.href
        ));
}

const responseHandler = (res) => {
    if (Constants.HTTP_NETWORK_OK !== res.status) {
        // store.dispatch(NotificationAction.setNotificationMsg({
        //     notificationMsg: 'Network error'
        // }));
        throw new Error('Network error')
    }
    if (res.status >= 400) {
        // console.log(">400")
        // store.dispatch(createMessage('error', {
        //     title: 'Request failed',
        //     subtitle: `${res.msg}`
        // }))
        return Promise.reject(res.data)
    }
    // if (Constants.HTTP_RESPNSE_OK !== res.data.retCode) {
    //     // store.dispatch(NotificationAction.setNotificationMsg({
    //     //     notificationMsg: res.data.msg
    //     // }));
    //     throw new Error(res.data.msg);
    // }
    return res;
};

export default instance;
