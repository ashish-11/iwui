/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import './App.scss';
import { Content } from "carbon-components-react/es/components/UIShell";
import AppHeader from "./components/Header";
import LandingPage from "./containers/LandingPage";
import MessagePage from './containers/MessagePage';
import DashboardPage from './containers/DashboardPage';
import UserManagementPage from './containers/UserManagementPage';
import TablePage from './components/TablePage';
import ModalPage from './containers/ModalPage';
import UploadDialogPage from './containers/UploadDialogPage';
import { Route, Switch } from 'react-router-dom';
import LoadingPage from './containers/LoadingPage';
import requireAuthentication from './RequireAuthentication';
import { connect } from 'react-redux';
import {getVersions} from './redux/modules/file';
import {getCurrentUser} from './redux/modules/user';
import PropTypes from 'prop-types';
class App extends Component {

  static propTypes= {
    versions: PropTypes.any
  }

  componentDidMount() {
    // this.props.getVersions();
  }
  
  render () {
    return <div className="App">
      
        <AppHeader 
          history = {this.props.history}
          versions = {this.props.versions}
          getCurrentUser={this.props.getCurrentUser.bind(this)}
          currentUser={this.props.currentUser}
        />
        <Content className="content">
        {/* // calling directly Tablepage component   */}
        {/* <div><TablePage /></div> */}
           
            <Switch>
              {/* <Route exact path="/" component={requireAuthentication(LandingPage)} />
              <Route path="/dashboard" component={requireAuthentication(DashboardPage)} />
              <Route path="/user-management" component={requireAuthentication(UserManagementPage)} /> */}
            
              <Route exact path="/" component={LandingPage} />
              <Route path="/dashboard" component={DashboardPage} /> 
              <Route path="/tablepage/:id" component={TablePage} />
            </Switch>
        </Content>
        <MessagePage className="messagepage"/>
        <ModalPage className="modalpage"/>
        <UploadDialogPage className="upload_dialog_page"/>
        <LoadingPage/>
    
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    versions: state.file.versions,
    currentUser: state.user.currentUser
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    
    getVersions: ()=> {
      dispatch(getVersions());
    },
    getCurrentUser: ()=> {
      dispatch(getCurrentUser());
    }
    
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
