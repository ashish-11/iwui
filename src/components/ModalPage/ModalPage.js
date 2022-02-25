/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/* eslint-disable no-else-return */
import React from 'react';
import {
  Modal
} from 'carbon-components-react';
import PropTypes from 'prop-types';

function MessagePage(props) {
  const { modal, onCloseModal, callback, data } = props;

  return (
    modal.enabled ? 
      <Modal
        danger={modal.danger}
        modalLabel={modal.label}
        modalHeading={modal.heading}
        primaryButtonText={modal.button}
        onRequestSubmit={(event) => callback(data)}
        open={modal.enabled}
        secondaryButtonText={"Cancel"}
        onRequestClose={(event) => onCloseModal()}
        onSecondarySubmit={(event) => onCloseModal()}
      >
        <p>{modal.text}</p>
      </Modal>
: null
  );
}

MessagePage.propTypes = {
  modal: PropTypes.any,
  onCloseModal: PropTypes.func,
  callback: PropTypes.func,
  data: PropTypes.any
};

export default MessagePage;
