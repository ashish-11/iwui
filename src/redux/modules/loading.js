/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from 'redux-actions';
// import * as _ from 'lodash';
// import uuid from 'uuid/v1';

const initialState = {
  
  isLoading: false,
};

export const closeLoading = createAction('@@tf/loading/closeLoading');

export const createLoading  = createAction('@@tf/loading/createLoading');


// Actions

export const loadingReducer = handleActions(
  {
    [createLoading]: state => {
      return {
        ...state,
        isLoading: true
      };
    },
    [closeLoading]: state => {
      return {
        ...state,
        isLoading: false
      };
    },
  },
  initialState
);

export default loadingReducer;
