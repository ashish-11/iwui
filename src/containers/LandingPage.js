/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LandingPage from '../components/LandingPage';
import { createMessage } from '../redux/modules/message';
import {uploadFile,getGeneralInfo,getCategories,selectCategory,uploadRequest} from '../redux/modules/file'
class LandingPageContainer extends Component {
    static propTypes = {
      messages: PropTypes.any,
      onCreateMessage: PropTypes.func,
      onUploadFile: PropTypes.func,
      categories: PropTypes.any,
      onUploadRequest: PropTypes.any,
      // generalInfo: PropTypes.any,
      // getGeneralInfo: PropTypes.func
    }

    handleCreateMessage(event, kind, message) {
      if (this.props.onCreateMessage) {
        this.props.onCreateMessage(kind,message);
      }
    }

    componentDidMount() {
      console.log('componentDidMount')
    //  this.props.getCategories();
      // this.props.getGeneralInfo();
    }

    static getDerivedStateFromProps(props, state) {
      console.log('getDerivedStateFromProps')
      if(props.generalInfo.total_count !== 0) {
        props.history.push('/dashboard')
      }
      return null
    }

    handleUploadFile(files) {
      this.props.onUploadFile(files)
      //jump to Dashboard
      this.props.history.push('/dashboard')
    }

    onSelectCategory(categoryId) {
      console.log("onselectcategory")
      this.props.selectCategory(categoryId)
      console.log("get general info")
      this.props.getGeneralInfo(categoryId)
    }
    reportFileTypeError() {
      this.props.reportFileTypeError()
    }
    render() {
      return (
        <LandingPage
          createMessage={this.handleCreateMessage.bind(this)}
          onUploadFile={this.handleUploadFile.bind(this)}
          categories={this.props.categories}
          reportFileTypeError={this.reportFileTypeError.bind(this)}
          onSelectCategory={this.onSelectCategory.bind(this)}
          onUploadRequest={this.props.onUploadRequest.bind(this)}
          />
      );
    }
}

const mapStateToProps = (state) => {
  return {
    messages: state.message.messages,
    generalInfo: state.file.generalInfo,
    categories: state.file.categories,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onCreateMessage: (kind,message) => {
      dispatch(createMessage(kind,message));
    },
    onUploadFile:(files) => {
      dispatch(uploadFile(files))
    },
    getGeneralInfo: (categoryId)=> {
      dispatch(getGeneralInfo(categoryId));
    },
    getCategories: () => {
      dispatch(getCategories())
    },
    selectCategory: (category) => {
      dispatch(selectCategory(category))
    },
    reportFileTypeError: () => {
      dispatch(createMessage('error',{
        subtitle: "File upload error: format not supported. We support PDF, jpeg, jpg, tif, tiff, png file formats",
        title: "Error"
      }))
    },
    onUploadRequest: () => {
      dispatch(uploadRequest())
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPageContainer);
