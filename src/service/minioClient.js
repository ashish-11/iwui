// var Minio = require('minio')
import { Client } from 'minio';
import fs from 'fs';
import Constants from './constants';
var minioClient = null;

const initializeMinioClient = () => {
    try {
        minioClient = new Client({
            endPoint: '52.151.203.8',
            port: 9000,
            useSSL: false,
            accessKey: 'minio',
            secretKey: 'changeme'
        });
        return minioClient
    } catch (err) {
        console.log(err);
        return null;
    }
}

const bucketExists = (minioClient, bucketName) => {
    minioClient.bucketExists(bucketName, function (err, exists) {
        if (err) {
            console.log(err)
            return false;
        }
        if (exists) {
            return true
        }
    })
}

const getObject = async (minioClient, bucketName, objectName) => {
    let size = 0;
    let buff = []
    return new Promise((resolve, reject) => {
        minioClient.getObject(bucketName, objectName, function (err, dataStream) {
            if (err) {
                return console.log(err)
            }
            dataStream.on('data', function (chunk) {
                size += chunk.length;
                buff.push(chunk);
            })
            dataStream.on('end', function () {
                // let src = URL.createObjectURL(
                //     new Blob([buff.toString()], { type: 'image/png' } /* (1) */)
                // );
                var b64encoded = btoa(String.fromCharCode.apply(null, buff[0]));
                console.log(objectName);
                console.log('b64encoded', b64encoded);
                let src = `data:image/png;base64,${b64encoded}`
                resolve(src);
            })
            dataStream.on('error', function (err) {
                console.log(err)
                reject(err)
            })
        })
    })
}

const getPresignedUrl = async (minioClient, bucketName, objectName) => {
    let response = await minioClient.presignedUrl('GET', bucketName, objectName, 24 * 60 * 60);
    return response;
}

const downloadObject = (minioClient, bucketName, objectName, downladPath) => {
    console.log(downladPath);
    return minioClient.fGetObject(bucketName, objectName, downladPath, function(err){
        if(err) {
            console.log(err);
            return err;
        }

        console.log('success');
        return 'success'
    });
}

export {
    initializeMinioClient,
    bucketExists,
    getObject,
    getPresignedUrl,
    downloadObject
}