/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React from 'react'
import * as PropTypes from 'prop-types';
import * as Constants from './service/constants';
import TokenUtil from './service/token';

export default function requireAuthentication(Component) {

 if (Component.AuthenticatedComponent) {
  return Component.AuthenticatedComponent
 }

 class AuthenticatedComponent extends React.Component {
  static contextTypes = {
   router: PropTypes.object.isRequired,
  }

  state = {
   login: false,
  }

  componentWillMount() {
   this.checkAuth();
  }

  componentWillReceiveProps(nextProps) {
   this.checkAuth();
  }

  checkAuth() {
    if (!TokenUtil.getAccessToken()) {
      this.login();
      return;
    }
    this.setState({login: true});
  }

   login() {
     window.location = (Constants.AUTH_URL
       + Constants.LOGIN
       + "?target="
       + encodeURIComponent(window.location.protocol
         + "//"
         + window.location.host
         + `/${Constants.HASH_SIGN}/`
         +
         (window.location.href.includes('/#/') ?
           window.location.href.replace(window.location.protocol + '//' + window.location.host + '/#/', '') :
           window.location.href.replace(window.location.protocol + '//' + window.location.host + '/', ''))
         // window.location.href
       ));
   }

  render() {
   if (this.state.login) {
    return <Component {...this.props}/>
   }
   return ''
  }
 }

 Component.AuthenticatedComponent = AuthenticatedComponent
 return Component.AuthenticatedComponent
}

