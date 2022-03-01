/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from 'redux-actions';
// import * as _ from 'lodash';
// import uuid from 'uuid/v1';

const initialState = {
  modal: {
    title: '',
    label: '',
    heading: '',
    text: '',
    button: '',
    danger: false,
    enabled: false,
  },
  callback: null,
  data: null
};

export const closeModal = createAction('@@tf/modal/closeModal');

export const createModal = createAction(
  '@@tf/modal/createModal',
  (params, callback, data) => { 
    // console.log(params)
    return {
      modal: {...params, enabled:true},
      callback: callback,
      data: data
    }
  }
);


// Actions

export const modalsReducer = handleActions(
  {
    [createModal]: (state, { payload }) => {
      return payload;
    },
    [closeModal]: state => {
      return {
        ...state,
        modal: initialState
      };
    },
  },
  initialState
);

export default modalsReducer;
