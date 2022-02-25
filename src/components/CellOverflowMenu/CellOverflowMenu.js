/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import {    Button,
    NumberInput,} from 'carbon-components-react';
import "./index.scss";
import * as _ from 'lodash';
import Konva from 'konva';
import TableUtil from "../core/util";
import { v4 as uuidv4 } from 'uuid';
import * as table from '../core';
import Tooltip from 'rc-tooltip';
export default class CellOverflowMenu extends Component {
    constructor(props) {
        super(props)
        this._mergeCells = this._mergeCells.bind(this);
        this._splitHorizontalCells = this._splitHorizontalCells.bind(this);
        this._splitVerticalCells = this._splitVerticalCells.bind(this);
        this._setHeader = this._setHeader.bind(this);
        this._clearHeader = this._clearHeader.bind(this);
        this._changeHorizontalNumber=this._changeHorizontalNumber.bind(this);
        this._changeVerticalNumber=this._changeVerticalNumber.bind(this);
        this.state = {
            horizontalNumber: 2,
            verticalNumber: 2,
        }
    }

    _changeHorizontalNumber(evt){
        this.setState({
            horizontalNumber:Number(evt.imaginaryTarget.value),
            verticalNumber:2,
        })
    }

    _changeVerticalNumber(evt){
        this.setState({
            horizontalNumber:2,
            verticalNumber:(evt.imaginaryTarget.value)
        })
    }

    _clearHeader(){
        let { selectedCell, tableStore,clearSelectedCell,updateCell,updateStatus,addUndoHistory,startTableEdit, cleanCellOverflowMenu }  = this.props;
        if (!selectedCell || selectedCell.length ===0) {
            return;
        }
        
        addUndoHistory()
        let temptable = {};
        if(tableStore.length === 1){
          temptable = tableStore[0]
        } else {
          tableStore.forEach((table)=>{
            if(_.find(table.child, { 'id': selectedCell[0].id })) {
              temptable = table;
            }
          })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        selectedCell.forEach((sCell) =>{
            let newCell = layer.findOne('#' + sCell.id);
            newCell.fill(null);
            newCell.stroke("#BE15E6");//in konva layer Change the cell style to value cell
            sCell.label = 'value';
            updateCell(sCell)//update cell label to value in Redux(tableStore)
        })
        layer.draw();
        clearSelectedCell();
        updateStatus({id:temptable.id,status:'modify'});
        this._showContentMenu(temptable)
        cleanCellOverflowMenu()
    }

    _setHeader(){
        let { selectedCell, tableStore,clearSelectedCell,updateCell,updateStatus,addUndoHistory,startTableEdit,cleanCellOverflowMenu }  = this.props;
        if (!selectedCell || selectedCell.length ===0) {
            return;
        }
        addUndoHistory()
        let temptable = {};
        if(tableStore.length === 1){
          temptable = tableStore[0]
        } else {
          tableStore.forEach((table)=>{
            if(_.find(table.child, { 'id': selectedCell[0].id })) {
              temptable = table;
            }
          })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        selectedCell.forEach((sCell) =>{
            let newCell = layer.findOne('#' + sCell.id);
            newCell.fill('#3706BC4D');
            newCell.stroke("#BE15E6");//in konva layer Change the cell style to header cell
            sCell.label = 'header';
            updateCell(sCell)//update cell label to header in Redux(tableStore)
        })
        layer.draw();
        clearSelectedCell();
        updateStatus({id:temptable.id,status:'modify'});
        this._showContentMenu(temptable)
        cleanCellOverflowMenu()
    }

    _splitVerticalCells(){
        let { selectedCell, tableStore,createConfirmMenu,cleanContentMenu,addSplitCell, changeVSplitMode, addUndoHistory, startTableEdit, startSplit,cleanCellOverflowMenu }  = this.props;
        // addUndoHistory()
        if (!selectedCell || selectedCell.length ===0) {
            return;
        }
        cleanContentMenu()
        let originalCells = selectedCell;
        let temptable = {};
        if(tableStore.length === 1){
          temptable = tableStore[0]
        } else {
          tableStore.forEach((table)=>{
            if(_.find(table.child, { 'id': originalCells[0].id })) {
              temptable = table;
            }
          })
        }
        startTableEdit(temptable.id)
        startSplit()
        let orignalWidth = originalCells[0].x2-originalCells[0].x1
        let newCells = []
        let layer = this.props.getLayer();
        for (var num = 0;num<this.state.verticalNumber;num++){
            for (let cellNum = 0; cellNum < originalCells.length; cellNum++) {
                let originalCell = originalCells[cellNum];
                let cX1 =0
                let cX2 =0
                if(num === 0) {
                    cX1 = originalCell.x1
                } else {
                    cX1 = Math.round(originalCell.x1 + num * orignalWidth/this.state.verticalNumber);
                }
                if(num === this.state.verticalNumber -1) {
                    cX2 = originalCell.x2
                } else {
                    cX2 = Math.round(originalCell.x1 + (num + 1) * orignalWidth/this.state.verticalNumber)
                }
                let x1= cX1;
                let y1= originalCell.y1
                let x2= cX2;
                let y2 = originalCell.y2;
                let newCell = {x1:x1,y1:y1,x2:x2,y2:y2,id:uuidv4(),label:originalCell.label, tableID:originalCell.tableID, tableFormat: originalCell.tableFormat}
                table.initCell(this.props, newCell);//in konva layer drew the new cells
                
                let newCellLeftGroup = layer.findOne('#' + newCell.id);
                newCellLeftGroup.stroke('yellow')
                newCellLeftGroup.strokeWidth(2)
                addSplitCell(newCell);//add cell to Redux(splitCell)
                newCells.push(newCell)
            }
            layer.find('Transformer').destroy();
            layer.batchDraw();
        }
    
        selectedCell.forEach((sCell) =>{
            layer.findOne('#' + sCell.id).destroy();//in konva layer destroy the old cell
            layer.draw();
        })
        //active the confirm menu
        let stage = this.props.getStage();
        let containerRect = stage.container().getBoundingClientRect();
        let Targetcell = layer.findOne('#' + newCells[newCells.length-1].id);
        createConfirmMenu(containerRect.top + Targetcell.getClientRect().y + Targetcell.getClientRect().height, 
        containerRect.left + Targetcell.getClientRect().x + Targetcell.getClientRect().width - 48,{id: temptable.id});
        this.setState({
            horizontalNumber:2,
            verticalNumber:2
        })
        changeVSplitMode(true)
        cleanCellOverflowMenu()
    }

    _splitHorizontalCells(){
        let { selectedCell, tableStore,createConfirmMenu,cleanContentMenu,addSplitCell, changeHSplitMode, addUndoHistory,startTableEdit, startSplit,cleanCellOverflowMenu }  = this.props;
        if (!selectedCell || selectedCell.length ===0) {
            return;
        }
        // addUndoHistory()
        cleanContentMenu()
        let originalCells = selectedCell;
        let temptable = {};
        if(tableStore.length === 1){
          temptable = tableStore[0]
        } else {
          tableStore.forEach((table)=>{
            if(_.find(table.child, { 'id': originalCells[0].id })) {
              temptable = table;
            }
          })
        }
        startTableEdit(temptable.id)
        startSplit()
        let orignalHeight = originalCells[0].y2-originalCells[0].y1
        let newCells = []
        let layer = this.props.getLayer();
        for (var num = 0;num<this.state.horizontalNumber;num++){
            for (let cellNum = 0; cellNum < originalCells.length; cellNum++) {
                let originalCell = originalCells[cellNum];
                let cY1 =0
                let cY2 =0
                if(num === 0) {
                    cY1 = originalCell.y1
                } else {
                    cY1 = Math.round(originalCell.y1 + num * orignalHeight/this.state.horizontalNumber);
                }
                if(num === this.state.horizontalNumber -1) {
                    cY2 = originalCell.y2
                } else {
                    cY2 = Math.round(originalCell.y1 + (num + 1) * orignalHeight/this.state.horizontalNumber)
                }
                let x1= originalCell.x1;
                let y1= cY1;
                let x2= originalCell.x2;
                let y2 = cY2;
                let newCell = {x1:x1,y1:y1,x2:x2,y2:y2,id:uuidv4(),label:originalCell.label, tableID: originalCell.tableID, tableFormat: originalCell.tableFormat}
                table.initCell(this.props, newCell);//in konva layer drew the new cells

                let newCellLeftGroup = layer.findOne('#' + newCell.id);
                newCellLeftGroup.stroke('yellow')
                newCellLeftGroup.strokeWidth(2)
                addSplitCell(newCell);//add cell to Redux(splitCell)
                newCells.push(newCell)
            }
            layer.find('Transformer').destroy();
            layer.batchDraw();
        }
    
        selectedCell.forEach((sCell) =>{
            layer.findOne('#' + sCell.id).destroy();//in konva layer destroy the old cell
            layer.draw();
        })
        //active the confirm menu
        let stage = this.props.getStage();
        let containerRect = stage.container().getBoundingClientRect();
        let Targetcell = layer.findOne('#' + newCells[newCells.length-1].id);
        createConfirmMenu(containerRect.top + Targetcell.getClientRect().y + Targetcell.getClientRect().height, 
        containerRect.left + Targetcell.getClientRect().x + Targetcell.getClientRect().width - 48,{id: temptable.id});
        this.setState({
            horizontalNumber:2,
            verticalNumber:2
        })
        changeHSplitMode(true);
        cleanCellOverflowMenu()
    }

    _mergeCells(){
        if(this.props.selectedCell.length < 2) return null;
        let { selectedCell, tableStore, createMessage,
            cleanContentMenu, deleteCell, clearSelectedCell,
            addCell, clearMergeCell, updateStatus, addUndoHistory,startTableEdit,cleanCellOverflowMenu } = this.props;
        addUndoHistory();
        cleanContentMenu();
        let x1 = selectedCell.map(obj => {return obj.x1});
        let x2 = selectedCell.map(obj => {return obj.x2});
        let y1 = selectedCell.map(obj => {return obj.y1});
        let y2 = selectedCell.map(obj => {return obj.y2});
        let x = _.concat(x1,x2);
        let y = _.concat(y1,y2);
        let minX = _.min(x);
        let maxX = _.max(x);
        let minY = _.min(y);
        let maxY = _.max(y);

        //find current table
        let temptable = {};
        if(tableStore.length === 1){
          temptable = tableStore[0]
        } else {
          tableStore.forEach((table)=>{
            if(_.find(table.child, { 'id': selectedCell[0].id })) {
              temptable = table;
            }
          })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        let newCellArr = _.sortBy(selectedCell, ['x1','y1']);

        if (TableUtil.selectedIsRect(newCellArr, minX, maxX, minY, maxY)) {
            let cell = {
                x1: minX,
                y1: minY,
                x2: maxX,
                y2: maxY,
                id: uuidv4(),
                label: _.find(this.props.selectedCell, { 'label': 'value' }) ? 'value' : 'header',
                tableID: selectedCell[0].tableID,
                tableFormat: selectedCell[0].tableFormat }
            const { addMergeCell } = this.props;
            addMergeCell(cell);
            table.initCell(this.props, cell)//in konva layer drew the new cells
            selectedCell.forEach((sCell) =>{
                layer.findOne('#' + sCell.id).destroy();//in konva layer destroy the old cell
            })
            layer.draw();
            let Targetcell = layer.findOne('#' + cell.id);
            Targetcell.stroke('#BE15E6');
            Targetcell.strokeWidth(2);
            if (this.props.selectedCell) {
                this.props.selectedCell.forEach((cell) => {
                    //delte old cell in Redux(tableStore)
                    deleteCell(cell.id);
                })
            }
            addCell(temptable.id, cell); //add new cell to Redux(tableStore)
            updateStatus({
                id: temptable.id,
                status: 'modify'
            });
            clearSelectedCell();
            clearMergeCell();
            this._showContentMenu(temptable);
        }else{
            if(temptable.status === 'modify'){
                this._showContentMenu(temptable);
            }
            createMessage('error', {title:'Cells merge failed!',subtitle:'Can not merge selected cells,Please confirm'});
        }
        cleanCellOverflowMenu()
    }

       /*
        common function to active the finally save menu.
    */
        _showContentMenu(newtable){
            let { cleanContentMenu,createContentMenu,cleanOverflowMenu }  = this.props;
            cleanContentMenu();
            cleanOverflowMenu();
            let stage = this.props.getStage();
            let containerRect = stage.container().getBoundingClientRect();
            let layer = this.props.getLayer();
            let TableGroup = layer.findOne('#' + newtable.id);
            createContentMenu(containerRect.top + TableGroup.getClientRect().y + TableGroup.getClientRect().height + 5, 
                containerRect.left + TableGroup.getClientRect().x + TableGroup.getClientRect().width - 368,{id: newtable.id});
        }

    _mainContent = () => {
        let {legalHSplit, legalVSplit, isOverlayShow, selectedCell} = this.props;
        if (this.props.show) {
          return (
            <div className="overflowmenu" style={{top: this.props.top, left:this.props.left}}>
                <div>
                    {selectedCell.length > 1 ? <button className="select-button" onClick={this._mergeCells.bind(this)}>Merge</button>: null }
                    {legalHSplit ? <Tooltip
                        overlayClassName="spliteOverlay"
                        animation="zoom"
                        trigger="click"
                        placement="bottom"
                        overlay={
                            <React.Fragment>
                                <NumberInput
                                    // isMobile
                                    id="tj-input1"
                                    label="Split Into"
                                    invalidText="Number is not valid"
                                    max={100}
                                    min={2}
                                    value={2}
                                    onChange={this._changeHorizontalNumber.bind(this)}
                                    disabled={this.props.selectedCell.length === 0 || this.props.splitCell.length > 0|| !legalHSplit}
                                />
                                <span className="labeltext">
                                    Rows
                                </span>
                                <Button kind='ghost' 
                                    className="Splitb"
                                    onClick={this._splitHorizontalCells.bind(this)}
                                    disabled={this.state.horizontalNumber < 2 || this.state.horizontalNumber > 100 || !Number.isInteger(this.state.horizontalNumber)|| !legalHSplit}    
                                >
                                    Split
                                </Button>
                            </React.Fragment>
                            }
                        >
                            {/* <button className="select-button" onClick={this._splitHorizontalCells.bind(this)}>Split Horizontal</button> */}
                            <div className="select-button">Split Horizontal</div>
                    </Tooltip> : null}
                    
                    {legalVSplit ? <Tooltip
                        overlayClassName="spliteOverlay"
                        animation="zoom"
                        trigger="click"
                        placement="bottom"
                        overlay={
                            <React.Fragment>
                                <NumberInput
                                    // isMobile
                                    id="tj-input1"
                                    label="Split Into"
                                    invalidText="Number is not valid"
                                    max={100}
                                    min={2}
                                    value={2}
                                    onChange={this._changeVerticalNumber.bind(this)}
                                    disabled={this.props.selectedCell.length === 0 || this.props.splitCell.length > 0|| !legalVSplit}
                                />
                                <span className="labeltext">
                                    Columns
                                </span>
                                <Button kind='ghost' 
                                    className="Splitb"
                                    onClick={this._splitVerticalCells.bind(this)}
                                    disabled={this.state.horizontalNumber < 2 || this.state.horizontalNumber > 100 || !Number.isInteger(this.state.horizontalNumber)|| !legalVSplit}    
                                >
                                    Split
                                </Button>
                            </React.Fragment>
                            }
                        >
                            {/* <button className="select-button" onClick={this._splitHorizontalCells.bind(this)}>Split Horizontal</button> */}
                            <div className="select-button">Split Vertical</div>
                    </Tooltip> : null}
                    <button className="select-button" onClick={this._setHeader.bind(this)}>Set Headers</button>
                    <button className="select-button" onClick={this._clearHeader.bind(this)}>Clear Headers</button>
                </div>
            </div>
          );
        } 
        return null;
    };

    render() {
        return (
            this._mainContent()
        );
    }
}