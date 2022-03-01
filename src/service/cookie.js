
// /*
//  * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
//  * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
//  * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
//  */

// import cookie from 'react-cookies'
// import {COOKIE_USER, COOKIE_SAME_SITE} from './constants'
// import { v4 as uuidv4 } from 'uuid';

// export default class CookieUtil {

//     static initUser() {
//         console.log(this.getUser())
//         if (!this.getUser()) {
//             console.log("setting cookie")
//             this.setUser(uuidv4())
//         }
//         this.setSameSite('None; Secure')
//     }

//     static setSameSite(value) {
//         cookie.save(COOKIE_SAME_SITE, value, { path: '/' });
//     }

//     static getUser() {
//         return cookie.load(COOKIE_USER);
//     }

//     static setUser(value) {
//         cookie.save(COOKIE_USER, value, { path: '/' });
//     }

//     static clearUser() {
//         cookie.remove(COOKIE_USER, { path: '/' });
//     }
// };
