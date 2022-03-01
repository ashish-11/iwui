/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import message from './message';
import file from './file';
import setting from './setting';
import table from './table';
import image from './image';
import contentmenu from './contentmenu';
import modal from './modal';
import socket from './socket';
import overflowmenu  from './overflowmenu';
import cellOverflowMenu  from './cellOverflowMenu';
import loading from './loading';
import confirmmenu from './confirmmenu';
import user from './user';



const rootReducer =(history) => combineReducers({
  message,
  file,
  setting,
  table,
  image,
  contentmenu,
  overflowmenu,
  cellOverflowMenu,
  confirmmenu,
  modal,
  socket,
  loading,
  user,
  router: connectRouter(history),
});

export default rootReducer
