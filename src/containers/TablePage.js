/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TablePage from '../components/TablePage';
import { getDocumentDatas, initTableData, initImageList, toggleMarkForReview } from '../redux/modules/table';
import { cleanContentMenu } from '../redux/modules/contentmenu';
import { cleanOverflowMenu } from '../redux/modules/overflowmenu';
import { cleanConfirmMenu } from '../redux/modules/confirmmenu'
import { singalDownloadFile } from '../redux/modules/file';
import { clear } from '../redux/modules/socket';
import * as Constants from '../service/constants';
import { initializeMinioClient, downloadObject, getPresignedUrl } from '../service/minioClient';

class TablePageContainer extends Component {
  static propTypes = {
    getDocumentDatas: PropTypes.func,
    documentDatas: PropTypes.object,
    documentMetadata: PropTypes.object,
    initTableData: PropTypes.func,
    cleanOverflowMenu: PropTypes.func,
    cleanContentMenu: PropTypes.func,
    cleanConfirmMenu: PropTypes.func,
    singalDownloadFile: PropTypes.func,
  }

  componentDidMount = () => {
    // console.log(this.props.match.params.id)
    this.props.clearSocketClients();
    this.props.getDocumentDatas(this.props.match.params.id);
    // this.props.getDocumentDatas('Invoice139_202202091059456160.pdf');
    // this.props.getDocumentDatas('17ab6640-a6bb-4544-9ecd-5546ddee2222');
    
    // setTimeout(() => {
    //   this.props.getDocumentDatas(this.props.match.params.id);
    //   // this.props.initImageList(this.props.match.params.id);
    // }, 500);
    this._watchScreen();
  }

  _watchScreen = () => {
    window.addEventListener("resize",
      function () {
        window.location.reload()
        console.log("resize");
      })
  };

  // UNSAFE_componentWillMount() {
  //   // console.log('componentWillMount')
  //   // console.log(this.props.match.params.id)
  //   console.log(this.props.match.params.id)
  //   this.props.clearSocketClients();
  //   setTimeout(() => {
  //     this.props.getDocumentDatas(this.props.match.params.id);
  //     // this.props.initImageList(this.props.match.params.id);
  //   }, 500);
  //   this._watchScreen();

  // }

  onRedirectDashboard(file) {
    this.props.initTableData();
    this.props.cleanOverflowMenu();
    this.props.cleanContentMenu();
    this.props.cleanConfirmMenu();
    this.props.history.push('/dashboard');
  }

  async onSingalDownloadFile() {
    this.props.singalDownloadFile(this.props.match.params.id);
    // let {documentDatas} = this.props;
    // console.log(documentDatas)
    // if(documentDatas && documentDatas.document_name != null && documentDatas.document_original_name != ""){

    //   let minioClient = initializeMinioClient();
    //   let presignedUrl = await getPresignedUrl(
    //     minioClient,
    //     Constants.Minio_Bucket_Name,
    //     `${documentDatas.document_name}/${documentDatas.document_original_name}.pdf`,
    //   );

    //   if(presignedUrl == "" && presignedUrl == null){
    //     cr
    //   }
    //   console.log(presignedUrl);
    //   let iframe = document.createElement("iframe");
    //   iframe.src = presignedUrl;
    //   iframe.style.display = "none";
    //   document.body.appendChild(iframe);
    // }
  }

  render() {
    return (
      <TablePage
        documentDatas={this.props.documentDatas}
        documentMetadata={this.props.documentMetadata}
        onRedirectDashboard={this.onRedirectDashboard.bind(this)}
        onSingalDownloadFile={this.onSingalDownloadFile.bind(this)}
        markedForReview={this.props.markedForReview}
        toggleMarkForReview={this.props.toggleMarkForReview.bind(this)}
        files={this.props.files}
        selectedId={this.props.match.params.id}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    documentDatas: state.table.documentDatas,
    documentMetadata: state.table.documentMetadata,
    markedForReview: state.table.markedForReview,
    files: state.file.files
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getDocumentDatas: (id) => {
      dispatch(getDocumentDatas(id));
    },
    initTableData: () => {
      dispatch(initTableData());
    },
    // initImageList: (id) => {
    //   dispatch(initImageList(id));
    // },
    cleanContentMenu: () => {
      dispatch(cleanContentMenu());
    },
    cleanOverflowMenu: () => {
      dispatch(cleanOverflowMenu());
    },
    cleanConfirmMenu: () => {
      dispatch(cleanConfirmMenu());
    },
    singalDownloadFile: (id) => {
      dispatch(singalDownloadFile(id))
    },
    toggleMarkForReview: () => {
      dispatch(toggleMarkForReview())
    },
    clearSocketClients: () => {
      dispatch(clear())
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TablePageContainer);