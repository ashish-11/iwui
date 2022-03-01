/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as loadash from "lodash";
import { connect } from "react-redux";
// import Dashboard from '../components/Dashboard';
import DashboardTable from "../components/DashboardTable";
import { createMessage } from "../redux/modules/message";
import { createModal } from "../redux/modules/modal";
import {
  filterByConfidence,
  filterByStatus,
  filterByVia,
  getFileDatas,
  uploadFile,
  getGeneralInfo,
  nameSort,
  timeSort,
  onPaginationChange,
  onBatchDeleteFile,
  batchDownloadFile,
  exportAll,
  getCategories,
  selectCategory,
  filterByDigiMethod,
  uploadRequest,
} from "../redux/modules/file";
import { _ } from "core-js";

class DashboardPageContainer extends Component {
  static propTypes = {
    messages: PropTypes.any,
    files: PropTypes.any,
    uploadingFiles: PropTypes.any,
    onCreateMessage: PropTypes.func,
    onFilterByConfidence: PropTypes.func,
    onFilterByStatus: PropTypes.func,
    onFilterByVia: PropTypes.func,
    isloading: PropTypes.bool,
    getFileDatas: PropTypes.func,
    currentConfidenceFilter: PropTypes.number,
    currentStatusFilter: PropTypes.string,
    currentViaFilter: PropTypes.string,
    currentDigiMethodFilter: PropTypes.string,
    generalInfo: PropTypes.any,
    nameSort: PropTypes.number,
    updateTimeSort: PropTypes.number,
    onTimeSortClick: PropTypes.func,
    onNameSortClick: PropTypes.func,
    searchKeyword: PropTypes.string,
    onBatchDeleteFile: PropTypes.func,
    batchDownloadFile: PropTypes.func,
    sockClients: PropTypes.any,
    // onPaginationChange: PropTypes.func,
  };

  handleCreateMessage(event, kind, message) {
    if (this.props.onCreateMessage) {
      this.props.onCreateMessage(kind, message);
    }
  }

  handleFilterByConfidence(target) {
    if (this.props.onFilterByConfidence) {
      this.props.onFilterByConfidence(target);
      this.props.getFileDatas(null);
    }
  }

  handleFilterByStatus(status) {
    if (this.props.onFilterByStatus) {
      this.props.onFilterByStatus(status);
      this.props.getFileDatas(null);
    }
  }

  handleFilterByVia(via) {
    if (this.props.onFilterByVia) {
      this.props.onFilterByVia(via);
      this.props.getFileDatas(null);
    }
  }

  handleFilterByDigiMethod(method) {
    console.log(method);
    this.props.onFilterByDigiMethod(method);
    this.props.getFileDatas(null);
  }

  onUploadFile(files) {
    // console.log(files)
    this.props.onUploadFile(files);
  }

  onUploadRequest() {
    this.props.onUploadRequest();
  }

  exportAll(rows) {
    this.props.exportAll(rows);
  }

  reportFileTypeError() {
    this.props.reportFileTypeError();
  }

  onDeleteFile(event) {
    console.log(event);
  }

  onPaginationChange(event) {
    // console.log(event);
    this.props.onPaginationChange({ page: event.page, size: event.pageSize });
  }

  //This method gets invoked on table row click and navigates to tablePage or EmailPage
  onEditDoc(file) {
    console.log(file);
    if (file.status === "Completed" && file.via === "Email") {
      this.props.history.push("emailForm/" + file.requestId);
    } else if (file.status === "Completed" || file.status === "Processed") {
      this.props.history.push({
        pathname: "tablePage/" + file.documentId,
        state: file
      });
    } else if (file.status === "Error") {
      this.props.onCreateMessage("warning", {
        title: "Can not show the tabe extraction output!",
        subtitle: "File status is error",
      });
    } else {
      this.props.onCreateMessage("warning", {
        title: "Can not show the tabe extraction output!",
        subtitle: "File still in progress",
      });
    }
  }

  toolBarSearch(value) {
    console.log(value);
  }

  componentDidMount() {
    // console.log("componentDidMount");
    // this.props.getGeneralInfo();
    // this.props.getCategories();
    // this.props.getGeneralInfo();
    this.props.getFileDatas(null);
  }

  onEditDocName(file) {
    console.log("edit file name");
  }

  confirmBatchDelete(rows) {
    console.log("confirm delete");
    this.props.createModal(
      {
        danger: true,
        heading: "Confirm Delete Documents",
        title: "Confirm",
        text: "Please confirm you want to delete selected documents",
        button: "Delete",
      },
      this.props.onBatchDeleteFile,
      rows
    );
  }

  render() {
    // console.log(this.props.categories)
    return (
      // <Dashboard
      //   files={this.props.files}
      //   createMessage={this.handleCreateMessage.bind(this)}/>
      <DashboardTable
        files={this.props.files}
        uploadingFiles={this.props.uploadingFiles}
        createMessage={this.handleCreateMessage.bind(this)}
        filterByConfidence={this.handleFilterByConfidence.bind(this)}
        filterByStatus={this.handleFilterByStatus.bind(this)}
        filterByVia={this.handleFilterByVia.bind(this)}
        filterByDigiMethod={this.handleFilterByDigiMethod.bind(this)}
        onUploadFile={this.onUploadFile.bind(this)}
        onUploadRequest={this.onUploadRequest.bind(this)}
        exportAll={this.exportAll.bind(this)}
        reportFileTypeError={this.reportFileTypeError.bind(this)}
        onBatchDeleteFile={this.confirmBatchDelete.bind(this)}
        onBatchDownloadFile={this.props.batchDownloadFile.bind(this)}
        onDeleteFile={this.onDeleteFile.bind(this)}
        onPaginationChange={this.onPaginationChange.bind(this)}
        onEditDoc={this.onEditDoc.bind(this)}
        toolBarSearch={this.toolBarSearch.bind(this)}
        currentConfidenceFilter={this.props.currentConfidenceFilter}
        currentStatusFilter={this.props.currentStatusFilter}
        currentViaFilter={this.props.currentViaFilter}
        currentDigiMethodFilter={this.props.currentDigiMethodFilter}
        pagination={this.props.pagination}
        generalInfo={this.props.generalInfo}
        nameSort={this.props.nameSort}
        updateTimeSort={this.props.updateTimeSort}
        onTimeSortClick={this.props.onTimeSortClick}
        onNameSortClick={this.props.onNameSortClick}
        searchKeyword={this.props.searchKeyword}
        onEditDocName={this.onEditDocName.bind(this)}
        socketClients={this.props.sockClients}
        categories={this.props.categories}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    messages: state.message.messages,
    files: state.file.files,
    isloading: state.file.isloading,
    uploadingFiles: state.file.uploadingFiles,
    currentConfidenceFilter: state.file.currentConfidenceFilter,
    currentStatusFilter: state.file.currentStatusFilter,
    currentViaFilter: state.file.currentViaFilter,
    currentDigiMethodFilter: state.file.currentDigiMethodFilter,
    pagination: state.file.pagination,
    generalInfo: state.file.generalInfo,
    nameSort: state.file.nameSort,
    updateTimeSort: state.file.updateTimeSort,
    searchKeyword: state.file.searchKeyword,
    sockClients: state.socket.clients,
    categories: state.file.categories,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onCreateMessage: (kind, message) => {
      dispatch(createMessage(kind, message));
    },
    onFilterByConfidence: (low, high) => {
      dispatch(filterByConfidence(low, high));
    },
    onFilterByStatus: (status) => {
      dispatch(filterByStatus(status));
    },
    onFilterByVia: (via) => {
      dispatch(filterByVia(via));
    },
    onFilterByDigiMethod: (method) => {
      dispatch(filterByDigiMethod(method));
    },
    getFileDatas: (params) => {
      dispatch(getFileDatas(params));
    },
    getGeneralInfo: (categoryId) => {
      dispatch(getGeneralInfo(categoryId));
    },
    onUploadFile: (files) => {
      dispatch(uploadFile(files));
    },
    onUploadRequest: () => {
      dispatch(uploadRequest());
    },
    exportAll: (rows) => {
      dispatch(exportAll(rows));
    },
    reportFileTypeError: () => {
      dispatch(
        createMessage("error", {
          subtitle:
            "File upload error: format not supported. We support PDF, jpeg, jpg, tif, tiff, png file formats",
          title: "Error",
        })
      );
    },
    onTimeSortClick: () => {
      // console.log("time-sort")
      dispatch(timeSort());
    },
    onNameSortClick: () => {
      // console.log("name-sort")
      dispatch(nameSort());
    },
    onPaginationChange: (p) => {
      dispatch(onPaginationChange(p));
    },
    onBatchDeleteFile: (rows) => {
      dispatch(onBatchDeleteFile(rows));
    },
    batchDownloadFile: (rows) => {
      dispatch(batchDownloadFile(rows));
    },
    createModal: (modal, callback, data) => {
      dispatch(createModal(modal, callback, data));
    },
    getCategories: () => {
      dispatch(getCategories());
    },
    selectCategory: (category) => {
      dispatch(selectCategory(category));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardPageContainer);
