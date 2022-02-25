/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from 'redux-actions';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';

const initialState = {
  messages: []
};

export const MESSAGE_DURATION = 5000;

export const cleanMessages = createAction('@@tf/message/cleanMessages');

export const cleanMessage = createAction('@@tf/message/cleanMessage');

export const createMessage = createAction(
  '@@tf/message/createMessage',
  (kind, message) => {
    return ({
      id: uuid(),
      kind: kind,
      subtitle: message.subtitle,
      title:message.title,
      timestamp: Date.now()
    });
  }
);

export const createhttpMessage = createAction(
  '@@tf/message/createhttpMessage',
  (res, message) => (dispatch) => {
    let msg = message;
    if (res !== '') {
      if (res.status === 200) {
        dispatch(createMessage('success', msg));
      }else if (res.status !== 401) {
        msg = `${message} : ${res.data.message}`;
        dispatch(createMessage('error', msg));
      }
    } else {
      dispatch(createMessage('error', msg));
    }
  });
// Actions

export const messagesReducer = handleActions(
  {
    [createMessage]: (state, { payload: message }) => {
      return {
        ...state,
        messages: [...state.messages, message]
      };
    },
    [cleanMessages]: state => {
      const expiry = Date.now() - (MESSAGE_DURATION + 500);
      return {
        ...state,
        messages: _.reject(state.messages, function (o) { return o.timestamp < expiry; })
      };
    },
    [cleanMessage]: (state, { payload: id }) => {
      return {
        ...state,
        messages: _.reject(state.messages, function (o) { return o.id === id; })
      };
    }
  },
  initialState
);

export default messagesReducer;
