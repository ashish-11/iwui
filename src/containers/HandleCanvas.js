/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { connect } from 'react-redux';
import HandleCanvas from '../components/HandleCanvas';
import {createContentMenu, cleanContentMenu} from '../redux/modules/contentmenu'
import { updateChild,addChild,clearSelectTable, selectCell, deSelectCell,updateSplitCell,updateSplitCells,updateStatus,clearSplitCell,addTable,updateTable,selectTable, clearGteTables, clearTextTables } from '../redux/modules/table'
import { cleanOverflowMenu,createOverflowMenu } from '../redux/modules/overflowmenu';

const mapStateToProps = (state) => {
    return {
        ...state.table,
        ...state.setting,
        ...state.image,
    }
}

const mapDispathToProps = (dispath) => {
    return {
        addTable: (Table) => {
            dispath(addTable(Table))
        },
        selectTable: (Table) => {
            dispath(selectTable(Table))
        },
        updateTable: (Table)=>{
            dispath(updateTable(Table))
        },
        createContentMenu: (top,left, parameters)=>{
            dispath(createContentMenu(top,left, parameters))
        },
        cleanContentMenu: ()=>{
            dispath(cleanContentMenu())
        },
        updateChild:(data)=>{
            dispath(updateChild(data));
        },
        addChild:(data)=>{
            dispath(addChild(data));
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
        updateSplitCells:(cells) => {
            dispath(updateSplitCells(cells))
        },
        updateStatus:(data)=>{
            dispath(updateStatus(data))
        },
        clearSplitCell:()=>{
            dispath(clearSplitCell())
        },
        clearSelectTable:()=>{
            dispath(clearSelectTable())
        },
        clearGteTables:()=>{
            dispath(clearGteTables())
        },
        clearTextTables:()=>{
            dispath(clearTextTables())
        },
        cleanOverflowMenu:()=>{
            dispath(cleanOverflowMenu());
        },
        createOverflowMenu: (top,left, parameters)=>{
            dispath(createOverflowMenu(top,left, parameters))
        }
    }
}

export default connect(mapStateToProps, mapDispathToProps)(HandleCanvas);
