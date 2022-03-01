/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from 'redux-actions';
const initialState = {
    show: false,
    top: 0,
    left: 0,
  };

  export const cleanConfirmMenu = createAction('@@tf/confirmmenu/cleanConfirmMenu');
  export const createConfirmMenu = createAction('@@tf/confirmmenu/createConfirmMenu',
  (top,left, parameters) => ({ top,left, parameters }));

  // Actions

export const confirmmenuReducer = handleActions(
    {
      [createConfirmMenu]: (state, { payload: contentmenus }) => {
        return {
          ...state,
          show: true,
          top: contentmenus.top + 'px',
          left: contentmenus.left + 'px',
          parameters: contentmenus.parameters
        };
      },
      [cleanConfirmMenu]: (state) => {
        return {
          ...state,
          show: false,
          top: 0,
          left: 0,
          parameters: {}
        };
      }
    },
    initialState
  );

  export default confirmmenuReducer