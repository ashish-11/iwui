/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/* eslint-disable no-else-return */
import React, { useState } from 'react';
import {
  Modal,
  Select,
  SelectItem
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone'
import "./_index.scss";
import * as _ from "lodash";
import { FileUploaderDropContainer } from "carbon-components-react";

function UploadDialogPage(props) {
  const [selectedFile, setSelectedFile] = useState([]);
  const { onCloseModal, onUploadFile, openUploadDialog, categories, selectCategory, selectedCategoryId } = props;
  const items = (clist) => {
    console.log("clist", _.isUndefined(clist));
    var res = [];
    if (!_.isUndefined(clist)) {
      for (var i = 0; i < clist.length; i++) {
        res.push(<SelectItem key={clist[i].id}
          text={clist[i].name}
          value={clist[i].id}
        />)
      }
    }
    return res
  }

  const _handleUploadFile = (e) => {
    if(selectedFile.length){
      onUploadFile(selectedFile);
    } else{
      console.log('No file selected')
    }
  }

  const _handleFileDropped = (e, addedFiles) => {
    let file = addedFiles.addedFiles;
    console.log(file, file.length, file[0]);
    if(file.length)
      setSelectedFile(file)
  }

  return (
    openUploadDialog ?
      <Modal
        danger={false}
        modalLabel={"Action"}
        modalHeading={"Upload an Invoice"}
        // primaryButtonText={<Dropzone
        //   onDrop={acceptedFiles => onUploadFile(acceptedFiles)}>
        //   {({ getRootProps, getInputProps }) => (
        //     <div className="upload_button" {...getRootProps()}>
        //       <input  {...getInputProps()}></input>
        //       <div>Confirm</div>
        //     </div>
        //   )}
        // </Dropzone>}
        primaryButtonText={'Upload'}
        onRequestSubmit={_handleUploadFile}
        open={openUploadDialog}
        secondaryButtonText={"Cancel"}
        onRequestClose={(event) => onCloseModal()}
        onSecondarySubmit={(event) => onCloseModal()}>
        
        <div className="drag-area">
        <div className=" icon upload_dialog_select_holder"><i className="fas fa-cloud-upload-alt"></i></div>
          <FileUploaderDropContainer
            accept={[]}
            name="filename"
            multiple={false}
            labelText={'Drag and drop or select the file to upload'}
            onAddFiles={_handleFileDropped}
            size={'lg'}
            style={{ minWidth: '100%', display: 'flex', justifyContent: 'center' }}
          />
          {selectedFile.length ? selectedFile[0].name : 'No file selected'}
        </div>
      </Modal>
      : null
  );
}

UploadDialogPage.propTypes = {
  onCloseModal: PropTypes.func,
  selectCategory: PropTypes.func,
  selectedCategoryId: PropTypes.string
};

export default UploadDialogPage;
