/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import {connect} from 'react-redux';
import ContentMenu from '../components/ContentMenu';
import { cleanContentMenu,createContentMenu } from '../redux/modules/contentmenu';
import { updateChild, selectCell, deSelectCell,updateSplitCell,updateStatus,clearSplitCell,addTable,updateTable, addCell,
     deleteCell, clearSelectedCell, clearMergeCell,updateIsCreateTable, updateDocumentDatas, initExistData, addOrModifyTable,resetUndoRedo,finishTableEdit } from '../redux/modules/table'
import { cleanOverflowMenu,createOverflowMenu } from '../redux/modules/overflowmenu';

const mapStateToProps = (state) =>{
    return {
        ...state.contentmenu,
        ...state.table,
        ...state.setting
    }
}

const mapDispathToProps =(dispath)=>{
    return {
        cleanContentMenu:()=>{
            dispath(cleanContentMenu());
        },
        updateChild:(data)=>{
            dispath(updateChild(data));
        },
        selectCell: (cell) =>{
            dispath(selectCell(cell))
        },
        deSelectCell:(id)=>{
            dispath(deSelectCell(id))
        },        
        updateSplitCell:(cell) => {
            dispath(updateSplitCell(cell))
        },
        updateStatus:(data)=>{
            dispath(updateStatus(data))
        },
        clearSplitCell:()=>{
            dispath(clearSplitCell())
        },
        addTable:(table)=>{
            dispath(addTable(table))
        },
        updateTable: (Table)=>{
            dispath(updateTable(Table))
        },
        createContentMenu: (top,left, parameters)=>{
            dispath(createContentMenu(top,left, parameters))
        },
        addCell:(id,cell)=>{
            dispath(addCell({id:id,cell:cell}))
        },
        deleteCell:(id)=>{
            dispath(deleteCell(id))
        },
        clearSelectedCell: () =>{
            dispath(clearSelectedCell())
        },
        clearMergeCell: () =>{
            dispath(clearMergeCell())
        },
        cleanOverflowMenu:()=>{
            dispath(cleanOverflowMenu());
        },
        createOverflowMenu: (top,left, parameters)=>{
            dispath(createOverflowMenu(top,left, parameters))
        },
        updateIsCreateTable:(data)=>{
            dispath(updateIsCreateTable(data));
        },
        updateDocumentDatas:(tId,imageX,imageY,operation,newtableData)=>{
            dispath(updateDocumentDatas(tId,imageX,imageY,operation,newtableData));
        },
        initExistData:(imgdata)=>{
            dispath(initExistData(imgdata));
        },
        addOrModifyTable: (newTableData)=> {
            dispath(addOrModifyTable(newTableData));
        },
        resetUndoRedo:()=>{
            dispath(resetUndoRedo());
        },
        finishTableEdit:(tableId)=>{
            dispath(finishTableEdit(tableId));
        },
    }
}

export default connect(mapStateToProps,mapDispathToProps)(ContentMenu);
