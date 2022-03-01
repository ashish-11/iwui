#### Constants ####

This is used for managing constants throughout the application where each constant has to be properly exported from constants.js. For example:

# Usage
export const DATA_BASE_URL = 'https://<backend-url>/api'

This constant file can be imported in the component or container based on the usage and constants can be accessed.

import * as Constants from '<path>/service/constants';

# The constant can be directly accesssed using Constants.<name>
Constants.DATA_BASE_URL


#### MinioClient.js ####

This is used to initialize minio-client and access static images and files which needs to be displayed on the tablePgae.js. On table page load, the minio-client gets initialized and each time when image needs to be displayed from Minio, the client object needs to be passed in the minio-operation.

const initializeMinioClient = () => {
    try {
        minioClient = new Client({
            endPoint: <End-point>,
            port: <port>,
            useSSL: false,
            accessKey: <access-key>,
            secretKey: <secret-key>
        });
        return minioClient
    } catch (err) {
        console.log(err);
        return null;
    }
}

# Also sample function for generating presigned url for any image or file

const getPresignedUrl = async (minioClient, bucketName, objectName) => {
    let response = await minioClient.presignedUrl('GET', bucketName, objectName, 24 * 60 * 60);
    return response;
}

Here minioClient is the client connection object which was initialized earlier, bucketName and objectname refers to the image/file to be downloaded from the minio bucket, and last entry decides the expiry of the presigned url.

# USAGE
import { initializeMinioClient, getPresignedUrl } from '../service/minioClient';

let presigned-url = await getPresignedUrl(
    <minio-client-connection>,
    <bucket-name>,
    <object-path>
);


