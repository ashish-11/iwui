/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import {connect} from 'react-redux';
import TableTopBar from '../components/TableTopBar';
import { selectTable, addCell, deleteCell, selectCell, deSelectCell,clearSelectedCell,addSplitCell,updateSplitCell,updateSplitCells,updateCell,
    addMergeCell,
    updateIsCreateTable,
    updateOverlayShow,
    updateStatus,
    clearMergeCell,
    updateOverlayView,
    changeHSplitMode,
    changeVSplitMode,
    deactivateCellSelection,
    activateCellSelection,
    addUndoHistory,
    addRedoHistory,
    undo,
    redo,
    startTableEdit,
    finishTableEdit,
    startSplit,
    endSplit
} from '../redux/modules/table';
import {createContentMenu, cleanContentMenu} from '../redux/modules/contentmenu'
import { createMessage } from '../redux/modules/message';
import { cleanOverflowMenu } from '../redux/modules/overflowmenu';
import { setMidFullScreen, setExitMidFullScreen } from '../redux/modules/setting';
import { setScale,setPosition,setPin } from '../redux/modules/setting';
import { cleanConfirmMenu,createConfirmMenu } from '../redux/modules/confirmmenu';

const mapStateToProps = (state) =>{
    return {
        ...state.setting,
        ...state.table,
        ...state.image,
    }
}

const mapDispathToProps =(dispath)=>{
    return {
        selectTable:(table)=>{
            dispath(selectTable(table))
        },
        addCell:(id,cell)=>{
            dispath(addCell({id:id,cell:cell}))
        },
        deleteCell:(id)=>{
            dispath(deleteCell(id))
        },
        selectCell: (cell) =>{
            dispath(selectCell(cell))
        },
        deSelectCell:(id)=>{
            dispath(deSelectCell(id))
        },
        clearSelectedCell: () =>{
            dispath(clearSelectedCell())
        },
        addSplitCell:(cell) => {
            dispath(addSplitCell(cell))
        },
        addMergeCell:(cell) => {
            dispath(addMergeCell(cell))
        },
        updateSplitCell:(cell) => {
            dispath(updateSplitCell(cell))
        },
        updateSplitCells:(cells) => {
            dispath(updateSplitCells(cells))
        },
        updateCell:(cell) => {
            dispath(updateCell(cell))
        },
        createContentMenu: (top,left, parameters)=>{
            dispath(createContentMenu(top,left, parameters))
        },
        cleanContentMenu: ()=>{
            dispath(cleanContentMenu())
        },
        createConfirmMenu: (top,left, parameters)=>{
            dispath(createConfirmMenu(top,left, parameters))
        },
        cleanConfirmMenu: ()=>{
            dispath(cleanConfirmMenu())
        },
        createMessage: (kind,message) => {
            dispath(createMessage(kind,message));
        },
        cleanOverflowMenu:()=>{
            dispath(cleanOverflowMenu());
        },
        setMidFullScreen:()=>{
            dispath(setMidFullScreen());
        },
        setExitMidFullScreen:()=>{
            dispath(setExitMidFullScreen());
        },
        updateIsCreateTable:(data)=>{
            dispath(updateIsCreateTable(data));
        },
        updateOverlayShow:(data)=>{
            dispath(updateOverlayShow(data));
        },
        setScale:(data)=>{
            dispath(setScale(data))
        },
        setPosition:(data)=>{
            dispath(setPosition(data))
        },
        setPin:(value)=>{
            dispath(setPin(value))
        },
        updateStatus:(data)=>{
            dispath(updateStatus(data))
        },
        clearMergeCell:(data)=>{
            dispath(clearMergeCell(data))
        },
        updateOverlayView:(data)=>{
            dispath(updateOverlayView(data))
        },
        changeHSplitMode:(data)=>{
            dispath(changeHSplitMode(data))
        },
        changeVSplitMode:(data)=>{
            dispath(changeVSplitMode(data))
        },
        deactivateCellSelection: (data) => {
            dispath(deactivateCellSelection(data))
        },
        activateCellSelection: (data) => {
            dispath(activateCellSelection(data))
        },
        addUndoHistory:() => {
            dispath(addUndoHistory())
        },
        addRedodoHistory:() => {
            dispath(addRedoHistory())
        },
        undo:() => {
            dispath(undo())
        },
        redo:() => {
            dispath(redo())
        },
        startTableEdit:(tableId) => {
            dispath(startTableEdit(tableId))
        },
        finishTableEdit:(tableId) => {
            dispath(finishTableEdit(tableId))
        },
        startSplit:() => {
            dispath(startSplit())
        },
        endSplit:() => {
            dispath(endSplit())
        },
    }
}

export default connect(mapStateToProps,mapDispathToProps)(TableTopBar);