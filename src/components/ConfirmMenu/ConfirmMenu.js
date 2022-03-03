/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import "./index.scss";
import * as table from '../core';
import * as _ from 'lodash';
// import { v4 as uuidv4 } from 'uuid';
import {
    Button,
  } from 'carbon-components-react';
import { store } from '../../index';
import Close20 from '@carbon/icons-react/lib/close/20';
import Checkmark20 from '@carbon/icons-react/lib/checkmark/20';
import { endSplit } from '../../redux/modules/table';

export default class ConfirmMenu extends Component {
    constructor(props) {
        super(props)
        this._cancelMenu = this._cancelMenu.bind(this);
        this._processMenu = this._processMenu.bind(this);
    }

    _processMenu(){
        const { parameters, cleanConfirmMenu,createContentMenu, updateStatus ,clearSplitCell,
             addCell,deleteCell,clearSelectedCell, addUndoHistory,endSplit } = this.props;
        addUndoHistory()
        const basetable = _.find(this.props.tableStore, { 'id': parameters.id });
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        let tempTable = layer.findOne('#' + parameters.id);
        tempTable.draggable(false);
        if(this.props.splitCell && this.props.splitCell.length > 0) {
            if(this.props.selectedCell) {
                this.props.selectedCell.forEach((cell) => {
                    deleteCell(cell.id) //delete the old cell in redux(tableStore)
                })
            }
            clearSelectedCell() //clear redux(selectedTable)

            this.props.splitCell.forEach((cell) => {
                addCell(basetable.id,cell) //add the new cell to redux(tableStore)
            })
            clearSplitCell(); //clear redux(splitCell)
        }

        let { tableStore } = store.getState().table;
        let worktable = _.find(tableStore, { 'id': parameters.id });

        //set all the konva cell to normal style.
        if(worktable.child) {
            worktable.child.forEach((cell) => {
                let newCell = layer.findOne('#' + cell.id);
                if(newCell.hide()) {
                    newCell.show();
                }
                newCell.stroke('#BE15E6')
                newCell.strokeWidth(1)
            })
        }

        //set redux(tableStore) table's status to 'modify'
        updateStatus({id:parameters.id,status:'modify'});
        cleanConfirmMenu();
        let stage = this.props.getStage();
        let containerRect = stage.container().getBoundingClientRect();
        let TableGroup = layer.findOne('#' + parameters.id);
        //Set finally confirm menu active.
        createContentMenu(containerRect.top + TableGroup.getClientRect().y + TableGroup.getClientRect().height + 5, 
            containerRect.left + TableGroup.getClientRect().x + TableGroup.getClientRect().width - 368,{id: parameters.id, subOperation: parameters.subOperation});
        endSplit();
        
    }


    _cancelMenu(){
        const { parameters, cleanConfirmMenu,createContentMenu ,clearSplitCell,clearSelectedCell,clearMergeCell,checkTableEdit,endSplit } = this.props;
        const basetable = _.find(this.props.tableStore, { 'id': parameters.id });
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        if(this.props.splitCell && this.props.splitCell.length > 0) {
            if(this.props.selectedCell) {
                this.props.selectedCell.forEach((cell) => {
                    table.initCell(this.props, cell) //redrew the old cell
                })
            }
            clearSelectedCell() //clear redux(selectedTable)

            this.props.splitCell.forEach((cell) => {
                layer.findOne('#' + cell.id).destroy(); //destroy the new cell
                layer.draw(); 
            })
            clearSplitCell(); //clear redux(splitCell)
        }

        if(this.props.mergeCell && this.props.mergeCell.length > 0) {
            if(this.props.selectedCell) {
                this.props.selectedCell.forEach((cell) => {
                    table.initCell(this.props, cell)
                })
            }
            clearSelectedCell()

            this.props.mergeCell.forEach((cell) => {
                layer.findOne('#' + cell.id).destroy();
                layer.draw();
            })
            clearMergeCell();
        }
        //set all the konva cell to normal style.
        let { tableStore } = store.getState().table;
        let worktable = _.find(tableStore, { 'id': parameters.id });
        if(worktable.child) {
            worktable.child.forEach((cell) => {
                let newCell = layer.findOne('#' + cell.id);
                newCell.stroke('#BE15E6')
                newCell.strokeWidth(1)
            })
        }
        layer.batchDraw();
        cleanConfirmMenu()
        checkTableEdit()
        //if have unfinished operation of table.Set finally confirm menu active.
        if(basetable.status === 'modify'){
            let stage = this.props.getStage();
            let containerRect = stage.container().getBoundingClientRect();
            let TableGroup = layer.findOne('#' + parameters.id);
            createContentMenu(containerRect.top + TableGroup.getClientRect().y + TableGroup.getClientRect().height + 5, 
                containerRect.left + TableGroup.getClientRect().x + TableGroup.getClientRect().width - 368,{id: parameters.id, subOperation: parameters.subOperation});
        }
        endSplit();
    }

    _mainContent = () => {
        if (this.props.show) {
          return (
            <div className="confirmmenu" style={{top: this.props.top, left:this.props.left}}>
                <div>
                    <Button kind='secondary' size='small'
                        className="confirmbutton"
                        hasIconOnly
                        renderIcon={Close20}
                        tooltipAlignment="center"
                        tooltipPosition="bottom"
                        iconDescription="Cancel"
                        onClick={this._cancelMenu.bind(this)}
                    />
                    <Button kind='primary' size='small'
                        className="confirmbutton"
                        hasIconOnly
                        renderIcon={Checkmark20}
                        tooltipAlignment="center"
                        tooltipPosition="bottom"
                        iconDescription="Confirm"
                        onClick={this._processMenu.bind(this)}
                    />
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