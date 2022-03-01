/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { connect } from 'react-redux';
import TableRightContent from '../components/TableRightContent';
import { addImage } from '../redux/modules/image'
import { cleanContentMenu } from '../redux/modules/contentmenu';
import { updateimageList, clearSelectedCell, clearSplitCell, clearTableStore, updateOverlayShow, getPageData, updateReviewComment, updateKvpData } from '../redux/modules/table'
import { cleanOverflowMenu } from '../redux/modules/overflowmenu';
import { changeRightbarSize } from '../redux/modules/setting';
import { setRightFullScreen, setExitRightFullScreen } from '../redux/modules/setting';

const mapStateToProps = (state) => {
    return {
        ...state.setting,
        ...state.table,
        ...state.file.files,
        ...state.image
    }
}

const mapDispathToProps = (dispath) => {
    return {
        clearTableStore: () => {
            dispath(clearTableStore())
        },
        changeRightbarSize: (value) => {
            dispath(changeRightbarSize(value))
        },
        setRightFullScreen: () => {
            dispath(setRightFullScreen());
        },
        setExitRightFullScreen: () => {
            dispath(setExitRightFullScreen());
        },
        clearSelectedCell: () => {
            dispath(clearSelectedCell())
        },
        clearSplitCell: () => {
            dispath(clearSplitCell())
        },
        clearTableStore: () => {
            dispath(clearTableStore())
        },
        cleanContentMenu: () => {
            dispath(cleanContentMenu());
        },
        cleanOverflowMenu: () => {
            dispath(cleanOverflowMenu());
        },
        updateOverlayShow: (data) => {
            dispath(updateOverlayShow(data))
        },
        addImage: (image) => {
            dispath(addImage(image))
        },
        updateimageList: (id) => {
            dispath(updateimageList(id))
        },
        updateKvpData: (data) => {
            dispath(updateKvpData(data))
        },
        updateReviewComment: (data) => {
            dispath(updateReviewComment(data))
        }
    }
}

export default connect(mapStateToProps, mapDispathToProps)(TableRightContent);