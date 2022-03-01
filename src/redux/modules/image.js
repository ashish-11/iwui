/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from 'redux-actions';
import { initExistData, getPageData } from './table.js';
import { createMessage } from "./message";
import * as _ from 'lodash';
// import { tableImage } from './data/tableImage.js';

const initialState = {
    //Calling json data
    imagefile: {},
}

export const addImage = createAction('@@tf/image/addImage');
export const updImage = createAction('@@tf/image/updImage',

    (image) => (dispatch, getState) => {
        // dispatch(initExistData(image));
        // return;
        const pages = getState().table.documentDatas.pages;
        // find the page id
        let curPageID = null;
        let page = null;
        let index = 0;
        if (pages && pages.length > 0) {
            for (index = 0; index < pages.length; index++) {
                page = pages[index];
                if (parseInt(page.page_num) === image.id) {
                    curPageID = page.id;
                    break;
                }
            }
        }

        if (page && !page.table) {
            let d = dispatch(getPageData(curPageID, index))
            if (!_.isUndefined(d)) {
                dispatch(initExistData(image));
            } else {
                dispatch(createMessage('error', {
                    subtitle: "Get page data error when updating image.",
                    title: "Error"
                }))
            }
            // dispatch(getPageData(curPageID, index))
            //     .then((res) => {
            //         dispatch(initExistData(image));
            //     })
            //     .catch((err) => {
            //         if (err) {
            //             dispatch(createMessage('error', {
            //                 subtitle: "Get page data error when updating image.",
            //                 title: "Error"
            //             }))
            //         }
            //     });
        } else {
            dispatch(initExistData(image));
        }
        return image;
    }
);
export const clearImage = createAction('@@tf/image/clearImage');

export const ImageReducer = handleActions(
    {
        [addImage]: (state, { payload: image }) => {
            return {
                ...state,
                imagefile: image
            }
        },
        [updImage]: (state, { payload: image }) => {
            let oldimage = state.imagefile;
            oldimage.scale = image.scale;
            oldimage.orignalWidth = image.orignalWidth;
            oldimage.orignalHeight = image.orignalHeight;
            oldimage.showWidth = image.showWidth;
            oldimage.showHeight = image.showHeight;
            oldimage.x = image.x;
            oldimage.y = image.y;
            return {
                ...state,
                imagefile: oldimage
            }
        },
        [clearImage]: (state) => {
            console.log("clearing the image")
            return {
                ...state,
                imagefile: {}
            }
        }
    },
    initialState
)

export default ImageReducer