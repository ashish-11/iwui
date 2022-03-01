/*!
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */



import React, { Component } from "react";
import "./index.scss";
// import { Button } from 'carbon-components-react';
// import Files from "react-butterfiles";
import {
    Button
} from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types';



class UploadButton extends Component {


    static propTypes = {
        categories: PropTypes.any,
        onUploadFile: PropTypes.func,
        onUploadRequest: PropTypes.func,
    };
    

    render() {

        const { onUploadFile, categories, onUploadRequest } = this.props;
        
        return (
            /* <Files
            multiple={true} 
            maxSize="40mb"
            // multipleMaxSize="40mb"
            // multipleMaxCount={3}
            accept={["application/pdf","image/jpg","image/jpeg","image/tiff","image/png"]}
            onSuccess={(files) => onUploadFile(files)}
            onError={(errors,event) => createMessage(event, 'error', {title:'File size more than 40mb',subtitle:'You can upload only .pdf, .tiff, .jpg, .jpeg and .png files upto 40 mb in size'})}
            >
            {({ browseFiles }) => (
                <>
                    <Button kind='primary' renderIcon={Add16} onClick={browseFiles}>New Document</Button>
                </>
            )}
            </Files>*/
            /* <Upload
            multiple={true}
            // accept={"application/pdf, image/jpg"}
            customRequest={(info) => onUploadFile([info.file])}
            onSuccess={(info) => console.log(info)}
            onError={(errors) => reportFileTypeError(errors)}
            >
            {
                
                <Button
                    kind="primary"
                    renderIcon={Add16}
                    
                    className="dashboard__button"
                >
                    New Document
                </Button>
                
                }
            </Upload> */
            categories!=undefined && categories.length === 1 ?
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
                </Dropzone>
                : <Button
                    kind="primary"
                    renderIcon={Add16}
                    className="dashboard__button"
                    onClick={(event) => onUploadRequest()}
                >
                    New Document
            </Button>

        );
    }
}

export default UploadButton;