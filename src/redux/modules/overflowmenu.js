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

  export const cleanOverflowMenu = createAction('@@tf/overflowmenu/cleanOverflowMenu');
  export const createOverflowMenu = createAction('@@tf/overflowmenu/createOverflowMenu',
  (top,left, parameters) => ({ top,left, parameters }));

  // Actions

export const overflowmenuReducer = handleActions(
    {
      [createOverflowMenu]: (state, { payload: overflowmenus }) => {
        return {
          ...state,
          show: true,
          top: overflowmenus.top + 'px',
          left: overflowmenus.left + 'px',
          parameters: overflowmenus.parameters
        };
      },
      [cleanOverflowMenu]: (state) => {
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

  export default overflowmenuReducer