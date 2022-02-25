/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import {connect} from 'react-redux';
import TableLeftSlideBar from '../components/TableLeftSlideBar';
import {addImage} from '../redux/modules/image'
import { cleanContentMenu } from '../redux/modules/contentmenu';
import { updateimageList,clearSelectedCell,clearSplitCell,clearTableStore,updateOverlayShow,getPageData } from '../redux/modules/table'
import { cleanOverflowMenu } from '../redux/modules/overflowmenu';
import { changeleftbarShow } from '../redux/modules/setting';
import { createMessage } from '../redux/modules/message';

const mapStateToProps = (state) =>{
    return {
        ...state.setting,
        ...state.image,
        ...state.table,
        //neet to confirm the state.
        curPageData: state.table.curPageData,
    }
}

const mapDispathToProps =(dispath)=>{
    return {
        addImage:(image)=>{
            dispath(addImage(image))
        },
        updateimageList:(id) =>{
            dispath(updateimageList(id))
        },
        // initExistData:(imgdata) =>{
        //     dispath(initExistData(imgdata))
        // },
        clearSelectedCell:()=>{
            dispath(clearSelectedCell())
        },
        clearSplitCell:()=>{
            dispath(clearSplitCell())
        },
        clearTableStore:()=>{
            dispath(clearTableStore())
        },
        cleanContentMenu:()=>{
            dispath(cleanContentMenu());
        },
        cleanOverflowMenu:()=>{
            dispath(cleanOverflowMenu());
        },
        changeleftbarShow:()=>{
            dispath(changeleftbarShow());
        },
        updateOverlayShow:(data)=>{
            dispath(updateOverlayShow(data))
        },
        createMessage: (kind,message) => {
            dispath(createMessage(kind,message));
        },
        getPageData: (id) => {
            dispath(getPageData(id));
        },
        
    }
}

export default connect(mapStateToProps,mapDispathToProps)(TableLeftSlideBar);