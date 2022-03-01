/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingPage from '../components/LoadingPage';

class LoadingPageContainer extends Component {
    static propTypes = {
      isLoading: PropTypes.any,
    }

    render() {
      return (
        <LoadingPage
          isLoading={this.props.isLoading}/>
      );
    }
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.loading.isLoading
  };
};

export default connect(
  mapStateToProps
)(LoadingPageContainer);
