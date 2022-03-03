/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import "./index.scss";
import * as _ from 'lodash';
// import { v4 as uuidv4 } from 'uuid';
import {
    Button,
  } from 'carbon-components-react';
import TableConverter from '../../util/tableConverter';
const tableConverter = new TableConverter()
export default class ContentMenu extends Component {
    constructor(props) {
        super(props)
        this._cancelMenu = this._cancelMenu.bind(this);
        this._processMenu = this._processMenu.bind(this);
    }

    // there are four conditions to call this function.
    // 1. create a new table
    // 2. modify table 
    // 3. merge cells
    // 4. spilt cells
    _processMenu(){
        const { parameters, cleanContentMenu, updateStatus ,clearSplitCell,
                clearSelectedCell,clearMergeCell, imageList,
                updateIsCreateTable,updateDocumentDatas, addOrModifyTable} = this.props;
        const basetable = _.find(this.props.tableStore, { 'id': parameters.id });
        let Stage = this.props.getStage();
        let layer = this.props.getLayer();

        /*
            Finlly process of table edit.
            It will recaculate the table and cell's coords. and call the api to sent data to BE.
        */
        // Find the data in redux(tableStore) if have means table edit. If not means new table.
        if (basetable) {
            if (basetable.status === 'init') {
                layer.find('Transformer').destroy();
                layer.draw();
                updateStatus({id:parameters.id})
            } else {
                layer.find('Transformer').destroy();
                clearSelectedCell(); // clear redux(selectedCell)
                clearSplitCell(); // clear redux(splitCell)
                clearMergeCell(); // clear redux(mergeCell)
                let tempTable = layer.findOne('#' + parameters.id);
                tempTable.draggable(false);
                if(parameters.operation === 'modify') {
                    // modify table border
                    layer.find('Group').destroy();
                    layer.find('Rect').destroy();
                    layer.batchDraw();
                    let image = layer.findOne('Image');
                    // call api the parameters.operation means cell edit.
                    // updateDocumentDatas(parameters.id,image.x(),image.y(),parameters.operation,{})
                    let newTableData = tableConverter.convertTableEditDataToParam(basetable, image.x(),image.y())
                    addOrModifyTable(newTableData, parameters.op)
                } else {
                    // modify cell
                    layer.find('Group').destroy();
                    layer.find('Rect').destroy();
                    layer.batchDraw();

                    let image = layer.findOne('Image');
                    // call api the table modify
                    updateDocumentDatas(parameters.id,image.x(),image.y(),'',{},parameters.subOperation)
                }

            }
            // hide the finally save menu.
            cleanContentMenu();
        } else {
            // New table
            // Find the new table in konva layer.
            let newlayer = Stage.findOne('.maskLayer');
            let tempTable = newlayer.findOne('#' + parameters.id);
            let imgdata=_.find(imageList, { 'selected': true });
            let returnData = {}
            // Calculate the new table's coords.
            let rate = imgdata.scale * 2.5;
            let x1 = tempTable.x();
            let y1 = tempTable.y();
            let x2 = tempTable.scaleX() ? tempTable.x() + tempTable.width() * tempTable.scaleX() : tempTable.x() + tempTable.width();
            let y2 = tempTable.scaleY() ? tempTable.y() + tempTable.height() * tempTable.scaleY() : tempTable.y() + tempTable.height();
            // returnData.coordinate = {x1: Math.round((x1- image.x()) * rate),
            //     y1: Math.round((y1- image.y()) * rate),
            //     x2: Math.round((x2- image.x()) * rate),
            //     y2: Math.round((y2- image.y()) * rate)}
            // returnData.table_type = tempTable.name();
            // returnData.operation = 'define_table';
            // returnData.cells = [];
            returnData.border = {
                l: (x1- imgdata.x) * rate,
                r: (x2- imgdata.x) * rate,
                t: (y1- imgdata.y) * rate,
                b: (y2- imgdata.y) * rate
            };
            returnData.covered = false;
            
            // Got the new table's name.
            if (this.props.tableStore.length > 0) {
                const maxTableName = _.maxBy(this.props.tableStore, 'name').name;
                // returnData.id = (maxTableName + 1);
                // returnData.name = (maxTableName + 1);
                returnData.tableNum = maxTableName + 1;
            } else {
                // returnData.id = '1';
                // returnData.name = '1';
                returnData.tableNum = '1';
            }

            // destroy the temp new table in konva temp layer
            newlayer.find('Transformer').destroy();
            newlayer.find('.mask').destroy();
            document.body.style.cursor = 'default';
            tempTable.destroy();
            // destroy konva temp layer
            newlayer.destroy();
            layer.find('Group').destroy();
            layer.find('Rect').destroy();
            layer.batchDraw();
            cleanContentMenu();
            clearSplitCell();
            // call api the table create
            // updateDocumentDatas(parameters.id,image.x(),image.y(),'',returnData)
            addOrModifyTable(returnData, parameters.op)
            updateIsCreateTable(false);
        }

    }

        /*
            Finlly cancel of table edit.
            It will got the old data from store. and redrew the tables and cells.
        */
    _cancelMenu(){
        const { parameters, cleanContentMenu ,clearSplitCell,initExistData,imageList,updateIsCreateTable,resetUndoRedo,finishTableEdit } = this.props;
        const basetable = _.find(this.props.tableStore, { 'id': parameters.id });
        let Stage = this.props.getStage();
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        // Find the data in redux(tableStore) if have means we need redrew. else we just clear the temp table.
        if (basetable) {
            // destroy konva React in konva layer
            layer.find('Group').destroy();
            layer.find('Rect').destroy();
            layer.batchDraw();

            let imgdata=_.find(imageList, { 'selected': true });
            // Reload the old table data. It will redrew the table and cell
            initExistData(imgdata)
        } else {
            let newlayer = Stage.findOne('.maskLayer');
            if(newlayer) {
                // destroy the temp new table in konva temp layer
                let tempTable = newlayer.findOne('#' + parameters.id);
                newlayer.find('Transformer').destroy();
                newlayer.find('.mask').destroy();
                document.body.style.cursor = 'default';
                tempTable.destroy();
                newlayer.draw();
                // destroy konva temp layer
                newlayer.destroy();
            }
            
            // cleanContentMenu();
            clearSplitCell();
            updateIsCreateTable(false);
        }
        finishTableEdit(basetable.id);
        cleanContentMenu();
        resetUndoRedo();
        // finishTableEdit(basetable.id);
    }

    _mainContent = () => {
        if (this.props.show) {
          return (
            <div className="menu" style={{top: this.props.top, left:this.props.left}}>
                <div>
                    <Button kind='secondary' className="close-button" onClick={this._cancelMenu.bind(this)}>Cancel</Button>
                    <Button kind='primary'  className="normal-button" disabled={!this.props.undoEnabled && this.props.redoStack.length > 0} onClick={this._processMenu.bind(this)}>Extract</Button>
                    
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