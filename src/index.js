/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.trim";
import "core-js/modules/es.object.values";
import React from 'react';
import ReactDOM from 'react-dom';
import configureStore, { history } from './redux/store';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router'
import { HashRouter, Route,Switch } from 'react-router-dom' 
import './index.scss';
// custom ui & containers
import App from './App';
import TablePage from './containers/TablePage';
import EmailForm from './containers/EmailForm';
// import DocumentViewContainer from './containers/DocumentViewContainer';
import requireAuthentication from './RequireAuthentication';

const { store } = configureStore();

const target = document.getElementById('root');
const app = (
  <Provider store={store}>
    <ConnectedRouter  history={history}>
      {/* <Route path="/" component={App} />
       */}
       <HashRouter>
        <Switch>
            {/* <Route exact path="/" component={requireAuthentication(App)} />
            <Route exact path="/dashboard" component={requireAuthentication(App)} />
            <Route path="/tablepage/:id" component={requireAuthentication(TablePage)} />
            <Route path="/user-management" component={requireAuthentication(App)} /> */}
            <Route exact path="/" component={App} />
            <Route exact path="/dashboard" component={App} />
            <Route path="/tablepage/:id" component={TablePage} />
            <Route path="/emailform/:id" component={EmailForm} />
          </Switch>
       </HashRouter>
          
    </ConnectedRouter >
  </Provider>
);

export {store}

ReactDOM.render(app, target);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
