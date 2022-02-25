
/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { REFRESH_TOKEN_KEY, ACCESS_TOKEN_KEY } from './constants';
import cookie from 'react-cookies'

export default class TokenUtil {

    static getRefreshToken() {
        // return localStorage.getItem(REFRESH_TOKEN_KEY);
        return cookie.load(REFRESH_TOKEN_KEY);
    }

    static getAccessToken() {
        // return localStorage.getItem(ACCESS_TOKEN_KEY);
        return cookie.load(ACCESS_TOKEN_KEY);
    }

    static setRefreshToken(value) {
        // localStorage.setItem(REFRESH_TOKEN_KEY, value);
        cookie.save(REFRESH_TOKEN_KEY, value, { path: '/', httpOnly: true });
    }

    static setAccessToken(value) {
        // localStorage.setItem(ACCESS_TOKEN_KEY, value);
        cookie.save(ACCESS_TOKEN_KEY, value, { path: '/', httpOnly: true });
    }

    static clearTokens() {
        // localStorage.removeItem(ACCESS_TOKEN_KEY);
        // localStorage.removeItem(REFRESH_TOKEN_KEY);
        cookie.remove(ACCESS_TOKEN_KEY, { path: '/' });
        cookie.remove(REFRESH_TOKEN_KEY, { path: '/' });
    }
};