/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MessagePage from '../components/MessagePage';
import { cleanMessage } from '../redux/modules/message';

class MessagePageContainer extends Component {
    static propTypes = {
      messages: PropTypes.any,
      oncleanMessage: PropTypes.func
    }

    handleCleanMessage(event, id) {
      if (this.props.oncleanMessage) {
        this.props.oncleanMessage(id);
      }
    }

    render() {
      return (
        <MessagePage
          messages={this.props.messages}
          messgaeDuration={5000}
          cleanMessage={this.handleCleanMessage.bind(this)}/>
      );
    }
}

const mapStateToProps = (state) => {
  return {
    messages: state.message.messages
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    oncleanMessage: (id) => {
      dispatch(cleanMessage(id));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagePageContainer);
