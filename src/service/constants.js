/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
import {version} from '../../package.json';
export const VERSION = version;
/****************************** URL start********************************/
export const LOGIN = '/ibmoidc/sso';
/****************************** URL end********************************/
export const USER_PROFILE_BY_ID_URL = '/users/';
export const USER_PROFILE_CURRENT_URL = '/users/current';
/****************************** Resopnse code start********************************/
export const HTTP_NETWORK_OK = 200;
export const HTTP_RESPNSE_OK = 100;


/****************************** Resopnse code end********************************/
export const HTTP_TIMEOUT = 300000
export const REFRESH_TOKEN_KEY = 'cookie_ci_refresh_token';
export const ACCESS_TOKEN_KEY = 'cookie_ci_token';
export const COOKIE_USER = 'ci-user-id';
export const COOKIE_SAME_SITE = 'SameSite';

export const PRIVACY_VERSION = '1.0';

export const NOT_REQUIRED_THRESHOLD = 80;
export const CATEGORY_ID = process.env.REACT_APP_CATEGORY_ID; 
const originUrl = window.location.origin


// let authURL = process.env.REACT_APP_AUTH_URL;
let authURL = originUrl + '/api/auth';

// let baseURL = process.env.REACT_APP_API_URL
let baseURL = originUrl + '/api'
if (originUrl.includes("localhost")) {
  // authURL = 'https://localhost:9070'
  // baseURL = 'https://localhost:9090/api'
  baseURL = process.env.REACT_APP_API_URL
  authURL = baseURL + '/auth'
}
// let baseURL = 'https://sam-dev.marketplace-995851-aaccc439d1fb6618995a059adab3a8f2-0000.us-south.containers.appdomain.cloud';
// if (process.env.NODE_ENV !== 'development') {
//     baseURL = process.env.REACT_APP_API_URL;
//     authURL = process.env.REACT_APP_AUTH_URL;
// }

export const Minio_Bucket_Name = "docin"
export const Minio_Access_Key = "minio"
export const Minio_Secret_key = "changeme"

let data_base_url = 'https://data-engine.azurewebsites.net/api'

export const DATA_BASE_URL = data_base_url
export const BASE_URL = baseURL;
export const AUTH_URL = authURL
export const HASH_SIGN = "0a0c942167651c40"
export const AND_SIGN = "54f19ac2aa52aac5"
export const SUPPORTED_FILE_TYPES = [
    "application/pdf",
    "image/jpg",
    "image/jpeg",
    "image/tiff",
    "image/tif",
    "image/png",
  ]
export const SUPPORTED_EXTENSIONS = [
    "pdf",
    "jpg",
    "jpeg",
    "tiff",
    "tif",
    "png",
  ]
export const MAX_FILE_SIZE_MB = 40 
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
