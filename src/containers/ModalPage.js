/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ModalPage from '../components/ModalPage';
import { closeModal } from '../redux/modules/modal';

class ModalPageContainer extends Component {
    static propTypes = {
      modal: PropTypes.any,
      onCloseModal: PropTypes.func
    }

    handleCleanModal() {
      if (this.props.onCloseModal) {
        this.props.onCloseModal();
      }
    }

    render() {
      return (
        <ModalPage
          modal={this.props.modal}
          onCloseModal={this.handleCleanModal.bind(this)}
          callback={this.props.callback}
          data={this.props.data}
          />
      );
    }
}

const mapStateToProps = (state) => {
  return {
    modal: state.modal.modal,
    callback: state.modal.callback,
    data: state.modal.data
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onCloseModal: () => {
      dispatch(closeModal());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalPageContainer);
