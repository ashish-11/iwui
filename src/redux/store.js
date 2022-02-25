
/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import Promise from 'bluebird';
import { createStore, compose, applyMiddleware } from 'redux';
import { createBrowserHistory as createHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
// import set from 'lodash/set';
import thunk from 'redux-thunk-fsa';
// import v4 from 'uuid/v4';
import promiseMiddleware from 'redux-promise';
import createRootReducer  from './modules';
import api from '../service/axios.wrapper'

export const history = createHistory();
const httpClient = api

const middleware = [
  // thunk.withExtraArgument(
  //   httpClient
  // ),
  thunk.withOpts({
    interrupt: true,
    next: true,
    extraArgument: httpClient
  }),
  promiseMiddleware,
  routerMiddleware(history)
];

const enhancers = [
];

if (
  process.env.NODE_ENV === 'development'
  || process.env.NODE_ENV === 'storybook'
) {
  const { devToolsExtension } = window;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

export default function configureStore(initialState = {}) {
  // eslint-disable-next-line no-unused-vars
  let done;
  const isReady = Promise.fromCallback(next => {
    done = next;
  });
  const store = createStore(createRootReducer(history), initialState, composedEnhancers);

  /**
   * Initiates success request interceptor
   * https://github.com/axios/axios#response-schema
   */
  // const pluckJWT = response => {
  //   if (response.headers['x-refresh-token']) {
  //     // update token
  //     store.dispatch(setToken(response.headers['x-refresh-token']));
  //   }

  //   return response;
  // };

  /**
       * Global HTTP 403 handler
       * Resets JWT token & passes error through
       */
  // const handleErrors = error => {
  //   if (error.response.status === 401) {
  //     // Bearer token is invalid -> reset
  //     store.dispatch(setToken(''));
  //     store.dispatch(setLogoutDialog('session timeout'));
  //     return Promise.reject(error);
  //   }

  //   return Promise.reject(error);
  // };

  /* generic interceptor for response */
  // httpClient.interceptors.response.use(pluckJWT, handleErrors);

  // httpClient.interceptors.request.use(config => {
  //   set(config, 'headers.x-trace-id', v4());
  //   return config;
  // });

  // httpClient.interceptors.request.use(config => {
  //   set(config, 'headers.Accept-Language', 'zh-cn,zh;q=0.5');
  //   return config;
  // });

  return {
    isReady,
    store
  };
}
