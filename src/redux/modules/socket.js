/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from "redux-actions";
import * as _ from "lodash";
import { Client,  } from "@stomp/stompjs";
import {updateSingleFile} from './file'
import * as Constants from '../../service/constants';

const initialState = {
  clients: new Map()
};

const registerOneClient = (doc, dispatch) => {
  let url = Constants.BASE_URL + "/ws/documents/processing-status";
  url = url.replace('http://', 'ws://')
  url = url.replace('https://', 'wss://')
  // url = 'ws://9.3.7.32:9090/orchestrationAPI-0.0.3/greeting'
  // url = 'ws://9.3.7.32:9090/orchestrationAPI-0.0.3/documents/processing-status'
    const client = new Client({
        brokerURL: url,
        debug: function (str) {
          // console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });
      client.onConnect = function(frame) {
        // Do something, all subscribes must be done is this callback
        // This is needed because this will be executed after a (re)connect
        console.log("Websocket established for doc:" + doc.id)

        client.subscribe("/user/topic/return-status", (message) => {
          if (message.body) {
              // alert("got message with body " + message.body)
              dispatch(onStatusUpdate(message.body))
              // onEndProcessing(message.body)
              
            } else {
              console.log("got empty message");
            }
        });

        client.subscribe("/user/topic/end-processing", (message) => {
          if (message.body) {
              // alert("got message with body " + message.body)
              dispatch(onEndProcessing(message.body))
              client.deactivate()
            } else {
              console.log("got empty message");
            }
        });

        let body = {
          "type": "get-doc-status",
          "message": "get-doc-status",
          // "id" : "d44c8da31a88.pdf"
          "id" : doc.id
        }
        
        client.publish({destination: '/app/request-status', body: JSON.stringify(body)});


      };
      
      client.onStompError = function (frame) {
        // Will be invoked in case of error encountered at Broker
        // Bad login/passcode typically will cause an error
        // Complaint brokers will set `message` header with a brief message. Body may contain details.
        // Compliant brokers will terminate the connection after any error
        console.log('Broker reported error: ' + frame.headers['message']);
        console.log('Additional details: ' + frame.body);
      };
      
      client.activate();
      
      
      return client;
}

export const  openClients = createAction(
  "@@tf/file/openClients", (documents)=> (dispatch, getState, httpClient) => {
  // need to replace the doc with the ended one
  // const documents = getState().file.files
  // stop all clients before creating new ones
  console.log("open socket clients")
  dispatch(clear())
  const clients = new Map()
  if (documents && documents.length > 0) {
    documents.forEach(element => {
      if (element.final_status === "processing") {
        clients.set(element.id, {
          client: registerOneClient(element, dispatch),
          status: {
            percentage: 0,
            stage: "Retrieving status..."
          }
        })
      }
    });
  }
  return clients;
});

export const addOneClient = createAction(
  "@@tf/file/addOneClient", (document) => (dispatch, getState, httpClient) => {
  const clients = new Map()
  clients.set(document.id, {
    client: registerOneClient(document, dispatch),
    status: {
      percentage: 0,
      stage: "Retrieving status..."
    }
  })
  return clients
}
)

export const clear = createAction(
  "@@tf/file/clear",() => (dispatch, getState) => {
    
    const clients = getState().socket.clients;
    console.log("clear socket clients ")
    // console.log(clients)
    clients.forEach((v,k) => {
      v.client.deactivate()
      v.client.forceDisconnect()
    })

    return new Map()
})

export const  onStatusUpdate = createAction(
  "@@tf/file/onStatusUpdate", (data )=> (dispatch, getState, httpClient) => {
  // need to replace the doc with the ended one
  // console.log(data)
  const json = JSON.parse(data)
  // const clients = _.cloneDeep(getState().socket.clients)
  const clients = getState().socket.clients
  let doc;
  if (clients.has(json.id)) {
    doc = clients.get(json.id)
    doc.status = json
  }
  // console.log(clients)
  return {doc, id: json.id}
});

export const  onEndProcessing = createAction(
  "@@tf/file/onEndProcessing", (data )=> (dispatch, getState, httpClient) => {
  // need to replace the doc with the ended one
  // console.log(data)
  const json = JSON.parse(data)
  const clients = new Map(getState().socket.clients)
  if (clients.has(json.id)) {
    clients.delete(json.id)
  }
  // dispatch update doc info in files
  dispatch(updateSingleFile(json.id))
  return clients
});



export const filesReducer = handleActions(
  {
    [openClients]: (state, { payload: clients }) => {
      return {
        ...state,
        clients: clients,
      };
    },
    [addOneClient]: (state, { payload: clients }) => {
      // console.log(clients)
      return {
        ...state,
        clients: new Map([...state.clients, ...clients]),
      };
    },

    [clear]: (state, { payload: clients }) => {
      return {
        ...state,
        clients: clients,
      };
    },
    
    [onEndProcessing] : (state, {payload: clients}) => {
      return {
        ...state,
        clients: clients
      };
    },
    [onStatusUpdate] : (state, {payload: updatedItem}) => {
      // console.log(clients)
      let currentClients = state.clients
      let newClients = new Map(currentClients)
      newClients.set(updatedItem.id, updatedItem.doc)
      return {
        ...state,
        clients: newClients
      };
    }
  },
  initialState
);

export default filesReducer;
