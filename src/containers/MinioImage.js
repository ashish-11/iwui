/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React from 'react'
import { updImage } from '../redux/modules/image';
import { connect } from 'react-redux';
import { Img } from 'react-image';
import * as Constants from '../service/constants';
import { initializeMinioClient, getPresignedUrl } from '../service/minioClient';

class MinioImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            img: null,
        }
    }

    componentDidMount() {
        this.loadImage();
    }

    async loadImage() {
        let minioClient = initializeMinioClient();
        let response = await getPresignedUrl(
            minioClient,
            Constants.Minio_Bucket_Name,
            this.props.src
        );
        this.setState({ img: response });
    }


    render() {
        return (
            this.state.img ? (<Img className='image' src={this.state.img} />) : null
        );
    }
}

const mapStateToProps = (state) => {
    return {
        ...state.image,
        ...state.setting
    }
}


const mapDispathToProps = (dispath) => {
    return {
        updImage: (image) => {
            dispath(updImage(image))
        }
    }
}

export default connect(mapStateToProps, mapDispathToProps)(MinioImage);