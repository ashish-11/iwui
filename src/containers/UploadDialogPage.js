/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UploadDialog from '../components/UploadDialog';
import { closeModal } from '../redux/modules/modal';
import {uploadFile,clearUploadRequest,selectCategory} from '../redux/modules/file';

class UploadDialogPageContainer extends Component {
    static propTypes = {
      onUploadFile: PropTypes.func,
      openUploadDialog: PropTypes.bool,
      categories: PropTypes.any,
      selectedCategory: PropTypes.string,
      selectCategory: PropTypes.func,
      selectedCategoryId: PropTypes.string,
    }

    handleCleanModal() {
      if (this.props.onCloseModal) {
        this.props.onCloseModal();
      }
    }

    render() {
      return (
        <UploadDialog
          onCloseModal={this.props.clearUploadRequest.bind(this)}
          onUploadFile={this.props.onUploadFile.bind(this)}
          openUploadDialog={this.props.openUploadDialog}
          categories={this.props.categories}
          selectedCategoryId={this.props.selectedCategoryId}
          selectCategory={this.props.selectCategory.bind(this)}
          />
      );
    }
}

const mapStateToProps = (state) => {
  return {
    openUploadDialog: state.file.openUploadDialog,
    categories: state.file.categories,
    selectedCategoryId: state.file.selectedCategoryId
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onCloseModal: () => {
      dispatch(closeModal());
    },
    onUploadFile: (files) => {
      dispatch(uploadFile(files))
    },
    clearUploadRequest: ()=>{
      dispatch(clearUploadRequest())
    },
    selectCategory: (categoryId) => {
      dispatch(selectCategory(categoryId))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadDialogPageContainer);
