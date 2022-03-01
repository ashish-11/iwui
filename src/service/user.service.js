/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import api from './axios.wrapper';
import * as Constants from './constants';

export default class UserService {

    static getUserProfile(id) {
        return api.get(Constants.USER_PROFILE_BY_ID_URL + id);
    }

    // static withdrawUserInfo(id) {
    //     return api.delete(Constants.USER_PROFILE_BY_ID_URL + id);
    // }

    static getCurrentUser() {
        return api.get(Constants.USER_PROFILE_CURRENT_URL);
    }
}



