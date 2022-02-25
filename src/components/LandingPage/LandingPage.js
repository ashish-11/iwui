/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React from "react";
// import {
//     Button
//   } from 'carbon-components-react';

// import Add16 from '@carbon/icons-react/lib/add/16';
// import Files from "react-butterfiles";
import PropTypes from "prop-types";
import { Select, SelectItem } from "carbon-components-react";
// import Upload from "rc-upload";
// import Dropzone from 'react-dropzone'
import UploadButton from "../UploadButton/UploadButton";

const LandingPage = (props) => {
  const {
    createMessage,
    onUploadFile,
    categories,
    onSelectCategory,
    reportFileTypeError,
    onUploadRequest,
  } = props;
  const items = (clist) => {
    var res = [];
    for (var i = 0; i < clist.length; i++) {
      res.push(
        <SelectItem
          key={clist[i].id}
          text={clist[i].name}
          value={clist[i].id}
        />
      );
    }
    return res;
  };
  return (
    <div className="bx--grid bx--grid--full-width">
      <div className="bx--row">
        <div className="bx--col-md-4 bx--col-lg-7 landingPage__content">
          <img
            src="assets/Laptop Icon 2@3x.png"
            alt=""
            className="landingPage_laptopimg"
          />
          {/* <h1 className="landingPage__heading">
                        Hi Jim
                    </h1> */}
          <h2 className="landingPage__subheading">
            Welcome to Intelligent Workflow on Azure
          </h2>
          {/* <p className="landingPage__p1">
                        The Dashboard is where you will see a list of your documents,<br/>
                        review them and get information of your documents
                    </p> */}
          <div>
            {/* <p className="landingPage__p2">
                            Begin with selecting a document category for extracting content
                        </p>
                        {categories.length === 0 ? 
                            <div>
                                <p className="landingPage__p2">
                                No category existed in the system. Please contact the admin
                                </p>
                            </div> : 
                            <div className="landingPage__select_holder">
                                <Select 
                                    noLabel={false}
                                    size="xl"
                                    labelText="Select a category"
                                    id='page_select_leftslide'
                                    onChange={(event) => onSelectCategory(event.target.value)}
                                >
                                {
                                    items(categories)
                                }
                                </Select>
                            </div>
                        } */}
          </div>

          <div>
            <p className="landingPage__p2">
              Begin with selecting a document for extracting content
            </p>
            <p className="landingPage__p3">
              You can extract only .pdf, .tiff, .jpg, .jpeg and .png files upto
              40 mb in size
            </p>
            <div className="landingPage__button">
              {/* {categories.length === 1 ?
                                    <Dropzone
                                        onDrop={acceptedFiles => onUploadFile(acceptedFiles)}>
                                        {({ getRootProps, getInputProps }) => (

                                            <Button
                                                kind="primary"
                                                renderIcon={Add16}
                                                {...getRootProps()}
                                                className="dashboard__button"
                                            >
                                                New Document
                                                <input {...getInputProps()}></input>
                                            </Button>
                                        )}
                                    </Dropzone> :
                                    <Button
                                        kind="primary"
                                        renderIcon={Add16}
                                        className="dashboard__button"
                                        onClick={(event) => onUploadRequest()}
                                    >
                                        New Document
                                </Button>} */}
              <UploadButton
                categories={categories}
                onUploadRequest={onUploadRequest}
                onUploadFile={onUploadFile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LandingPage.propTypes = {
  createMessage: PropTypes.func,
  categories: PropTypes.any,
  onSelectCategory: PropTypes.func,
};

export default LandingPage;
