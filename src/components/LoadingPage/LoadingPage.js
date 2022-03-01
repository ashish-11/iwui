/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/* eslint-disable no-else-return */
import React from 'react';
import {
  Loading
} from 'carbon-components-react';
import PropTypes from 'prop-types';

function LoadingPage(props) {
  const { isLoading } = props;
  return (
        <Loading
          withOverlay={true} active ={isLoading}
        />
  );
}

LoadingPage.propTypes = {
  isLoading: PropTypes.any,
};

export default LoadingPage;
