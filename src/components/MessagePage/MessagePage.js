/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/* eslint-disable no-else-return */
import React from 'react';
import {
  ToastNotification
} from 'carbon-components-react';
import PropTypes from 'prop-types';

function MessagePage(props) {
  const { messages, cleanMessage,messgaeDuration } = props;

  return (
    messages ? messages.length>0 ? messages.map((message) => (
      <ToastNotification
        key = {message.id}
        kind={message.kind}
        lowContrast
        iconDescription="describes the close button"
        subtitle={message.subtitle}
        title={message.title}
        onCloseButtonClick={event => cleanMessage(event, message.id)}
        caption={null}
        className="notification"
        timeout={messgaeDuration}
      />
    )) : null : null
  );
}

MessagePage.propTypes = {
  messages: PropTypes.any,
  cleanMessage: PropTypes.func,
  messgaeDuration: PropTypes.any,
};

export default MessagePage;
