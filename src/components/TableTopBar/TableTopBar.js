/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import {
    OverflowMenu,
    OverflowMenuItem,
    Button,
    NumberInput,
} from 'carbon-components-react';
import Undo32 from "@carbon/icons-react/lib/undo/32"
import Redo32 from "@carbon/icons-react/lib/redo/32"
import Tooltip from 'rc-tooltip';
import * as _ from 'lodash';
import * as table from '../core';
import { v4 as uuidv4 } from 'uuid';
import "./index.scss";
import 'rc-tooltip/assets/bootstrap.css';
import Konva from 'konva';
import { ReactComponent as NewTable } from '../../assets/NewTable.svg';
import { ReactComponent as MergeCell } from '../../assets/MergeCell.svg';
import { ReactComponent as DeleteCell } from '../../assets/DeleteCell.svg';
import { ReactComponent as SplitCells } from '../../assets/SplitCells.svg';
import { ReactComponent as SplitCellsVertical } from '../../assets/SplitCells-V.svg';
import { ReactComponent as Headers } from '../../assets/Headers.svg';
import { ReactComponent as OverLayHide } from '../../assets/OverLayHide.svg';
import { ReactComponent as OverLayShow } from '../../assets/OverLayShow.svg';
import { ReactComponent as HeadersClear } from '../../assets/Headers-Clear.svg';
import { ReactComponent as FullScreen } from '../../assets/maximize.svg';
import { ReactComponent as NormalScreen } from '../../assets/minimize.svg';
import { ReactComponent as MoreIcon } from '../../assets/more.svg';
import TableUtil from "../core/util";
import { startSplit } from '../../redux/modules/table';
const tableUtil = new TableUtil();

export default class TableTopBar extends Component {
    constructor(props) {
        super(props)
        this._createBorderedTable = this._createBorderedTable.bind(this);
        this._createBorderlessTable = this._createBorderlessTable.bind(this);
        this._mergeCells = this._mergeCells.bind(this);
        this._mergeRows = this._mergeRows.bind(this);
        this._mergeColumns = this._mergeColumns.bind(this);
        this._deleteColumns = this._deleteColumns.bind(this);
        this._deleteRowss = this._deleteRows.bind(this);
        this._splitVerticalCells = this._splitVerticalCells.bind(this);
        this._splitHorizontalCells = this._splitHorizontalCells.bind(this);
        this._setHeader = this._setHeader.bind(this);
        // this._setRowHeader = this._setRowHeader.bind(this);
        this._clearHeader = this._clearHeader.bind(this);
        this._undo = this._undo.bind(this);
        this._redo = this._redo.bind(this);
        this._modifyTable = this._modifyTable.bind(this);
        this._overlayOperation = this._overlayOperation.bind(this);
        this._changeHorizontalNumber = this._changeHorizontalNumber.bind(this);
        this._changeVerticalNumber = this._changeVerticalNumber.bind(this);
        this.state = {
            horizontalNumber: 2,
            verticalNumber: 2,
        }
        document.addEventListener('keydown', this.undoKeydown.bind(this));
        document.addEventListener('keydown', this.redoKeydown.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.undoKeydown);
        document.removeEventListener('keydown', this.redoKeydown);
    }

    undoKeydown(event) {
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
            this._undo()
        }
    }

    redoKeydown(event) {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') {
            this._redo()
        }
    }

    _fullscreen() {
        const { setMidFullScreen, setExitMidFullScreen } = this.props;
        if (!this.props.isMidFullScreen) {
            setMidFullScreen();
        } else {
            setExitMidFullScreen();
            tableUtil.zoomAction("Reset", this.props);
            tableUtil.pinRest("Reset", this.props);
        }
    }

    _changeHorizontalNumber(evt) {
        this.setState({
            horizontalNumber: Number(evt.imaginaryTarget.value),
            verticalNumber: 2,
        })
    }

    _changeVerticalNumber(evt) {
        this.setState({
            horizontalNumber: 2,
            verticalNumber: (evt.imaginaryTarget.value)
        })
    }

    _createBorderedTable() {
        const { updateIsCreateTable, isCreateTable } = this.props;
        // selectTable(table);
        if (!isCreateTable) {
            updateIsCreateTable(true)
            table.initMask(this.props, 0, 0, 'bordered')
        }
        // let layer = this.props.getLayer();
        // layer.listening(false);
    }

    _createBorderlessTable() {
        const { updateIsCreateTable, isCreateTable } = this.props;
        // selectTable(table);
        if (!isCreateTable) {
            updateIsCreateTable(true)
            table.initMask(this.props, 0, 0, 'borderless')
        }
        // let layer = this.props.getLayer();
        // layer.listening(false);
    }

    _undo() {
        let { undo, undoEnabled } = this.props;
        if (undoEnabled) {
            undo()
        }
    }

    _redo() {
        let { redo, redoEnabled } = this.props;
        if (redoEnabled) {
            redo()
        }
    }

    _clearHeader() {
        let { selectedCell, tableStore, clearSelectedCell, updateCell, updateStatus, addUndoHistory, startTableEdit } = this.props;
        if (!selectedCell || selectedCell.length === 0) {
            return;
        }

        addUndoHistory()
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': selectedCell[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        selectedCell.forEach((sCell) => {
            let newCell = layer.findOne('#' + sCell.id);
            newCell.fill(null);
            newCell.stroke("#BE15E6");//in konva layer Change the cell style to value cell
            sCell.label = 'value';
            updateCell(sCell)//update cell label to value in Redux(tableStore)
        })
        layer.draw();
        clearSelectedCell();
        updateStatus({ id: temptable.id, status: 'modify' });
        this._showContentMenu(temptable, 'clear_header')
    }

    _setHeader() {
        let { selectedCell, tableStore, clearSelectedCell, updateCell, updateStatus, addUndoHistory, startTableEdit } = this.props;
        if (!selectedCell || selectedCell.length === 0) {
            return;
        }
        addUndoHistory()
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': selectedCell[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        selectedCell.forEach((sCell) => {
            let newCell = layer.findOne('#' + sCell.id);
            newCell.fill('#3706BC4D');
            newCell.stroke("#BE15E6");//in konva layer Change the cell style to header cell
            sCell.label = 'header';
            updateCell(sCell)//update cell label to header in Redux(tableStore)
        })
        layer.draw();
        clearSelectedCell();
        updateStatus({ id: temptable.id, status: 'modify' });
        this._showContentMenu(temptable, 'set_header')
    }

    _splitVerticalCells() {
        let { selectedCell, tableStore, createConfirmMenu, cleanContentMenu, addSplitCell, changeVSplitMode, addUndoHistory, startTableEdit, startSplit } = this.props;
        // addUndoHistory()
        if (!selectedCell || selectedCell.length === 0) {
            return;
        }
        cleanContentMenu()
        let originalCells = selectedCell;
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': originalCells[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        startSplit()
        let orignalWidth = originalCells[0].x2 - originalCells[0].x1
        let newCells = []
        let layer = this.props.getLayer();
        for (var num = 0; num < this.state.verticalNumber; num++) {
            for (let cellNum = 0; cellNum < originalCells.length; cellNum++) {
                let originalCell = originalCells[cellNum];
                let cX1 = 0
                let cX2 = 0
                if (num === 0) {
                    cX1 = originalCell.x1
                } else {
                    cX1 = Math.round(originalCell.x1 + num * orignalWidth / this.state.verticalNumber);
                }
                if (num === this.state.verticalNumber - 1) {
                    cX2 = originalCell.x2
                } else {
                    cX2 = Math.round(originalCell.x1 + (num + 1) * orignalWidth / this.state.verticalNumber)
                }
                let x1 = cX1;
                let y1 = originalCell.y1
                let x2 = cX2;
                let y2 = originalCell.y2;
                let newCell = { x1: x1, y1: y1, x2: x2, y2: y2, id: uuidv4(), label: originalCell.label, tableID: originalCell.tableID, tableFormat: originalCell.tableFormat }
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

        selectedCell.forEach((sCell) => {
            if (!_.isUndefined(layer.findOne('#' + sCell.id))) {
                layer.findOne('#' + sCell.id).destroy();//in konva layer destroy the old cell
                layer.draw();
            }
        })
        //active the confirm menu
        let stage = this.props.getStage();
        let containerRect = stage.container().getBoundingClientRect();
        let Targetcell = layer.findOne('#' + newCells[newCells.length - 1].id);
        createConfirmMenu(containerRect.top + Targetcell.getClientRect().y + Targetcell.getClientRect().height,
            containerRect.left + Targetcell.getClientRect().x + Targetcell.getClientRect().width - 48, { id: temptable.id, subOperation: 'split_vertical' });
        this.setState({
            horizontalNumber: 2,
            verticalNumber: 2
        })
        changeVSplitMode(true)
    }

    _splitHorizontalCells() {
        let { selectedCell, tableStore, createConfirmMenu, cleanContentMenu, addSplitCell, changeHSplitMode, addUndoHistory, startTableEdit, startSplit } = this.props;
        if (!selectedCell || selectedCell.length === 0) {
            return;
        }
        // addUndoHistory()
        cleanContentMenu()
        let originalCells = selectedCell;
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': originalCells[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        startSplit()
        let orignalHeight = originalCells[0].y2 - originalCells[0].y1
        let newCells = []
        let layer = this.props.getLayer();
        for (var num = 0; num < this.state.horizontalNumber; num++) {
            for (let cellNum = 0; cellNum < originalCells.length; cellNum++) {
                let originalCell = originalCells[cellNum];
                let cY1 = 0
                let cY2 = 0
                if (num === 0) {
                    cY1 = originalCell.y1
                } else {
                    cY1 = Math.round(originalCell.y1 + num * orignalHeight / this.state.horizontalNumber);
                }
                if (num === this.state.horizontalNumber - 1) {
                    cY2 = originalCell.y2
                } else {
                    cY2 = Math.round(originalCell.y1 + (num + 1) * orignalHeight / this.state.horizontalNumber)
                }
                let x1 = originalCell.x1;
                let y1 = cY1;
                let x2 = originalCell.x2;
                let y2 = cY2;
                let newCell = { x1: x1, y1: y1, x2: x2, y2: y2, id: uuidv4(), label: originalCell.label, tableID: originalCell.tableID, tableFormat: originalCell.tableFormat }
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

        selectedCell.forEach((sCell) => {
            layer.findOne('#' + sCell.id).destroy();//in konva layer destroy the old cell
            layer.draw();
        })
        //active the confirm menu
        let stage = this.props.getStage();
        let containerRect = stage.container().getBoundingClientRect();
        let Targetcell = layer.findOne('#' + newCells[newCells.length - 1].id);
        console.log(containerRect.top, Targetcell.getClientRect().y, Targetcell.getClientRect().height)
        console.log(containerRect.left, Targetcell.getClientRect().x, Targetcell.getClientRect().width - 48)
        createConfirmMenu(containerRect.top + Targetcell.getClientRect().y + Targetcell.getClientRect().height,
            containerRect.left + Targetcell.getClientRect().x + Targetcell.getClientRect().width - 48, { id: temptable.id, subOperation: 'split_horizontal' });
        this.setState({
            horizontalNumber: 2,
            verticalNumber: 2
        })
        changeHSplitMode(true);
    }

    _mergeCells() {
        if (this.props.selectedCell.length < 2) return null;
        let { selectedCell, tableStore, createMessage,
            cleanContentMenu, deleteCell, clearSelectedCell,
            addCell, clearMergeCell, updateStatus, addUndoHistory, startTableEdit } = this.props;
        addUndoHistory();
        cleanContentMenu();
        let x1 = selectedCell.map(obj => { return obj.x1 });
        let x2 = selectedCell.map(obj => { return obj.x2 });
        let y1 = selectedCell.map(obj => { return obj.y1 });
        let y2 = selectedCell.map(obj => { return obj.y2 });
        let x = _.concat(x1, x2);
        let y = _.concat(y1, y2);
        let minX = _.min(x);
        let maxX = _.max(x);
        let minY = _.min(y);
        let maxY = _.max(y);

        //find current table
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': selectedCell[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        let newCellArr = _.sortBy(selectedCell, ['x1', 'y1']);
        if (TableUtil.selectedIsRect(newCellArr, minX, maxX, minY, maxY)) {
            let cell = {
                x1: minX,
                y1: minY,
                x2: maxX,
                y2: maxY,
                id: uuidv4(),
                label: _.find(this.props.selectedCell, { 'label': 'value' }) ? 'value' : 'header',
                tableID: selectedCell[0].tableID,
                tableFormat: selectedCell[0].tableFormat
            }
            const { addMergeCell } = this.props;
            addMergeCell(cell);
            table.initCell(this.props, cell)//in konva layer drew the new cells
            selectedCell.forEach((sCell) => {
                if (!_.isUndefined(layer.findOne('#' + sCell.id)))
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
            this._showContentMenu(temptable, 'merge_cells');
        } else {
            if (temptable.status === 'modify') {
                this._showContentMenu(temptable, 'merge_cells');
            }
            createMessage('error', { title: 'Cells merge failed!', subtitle: 'Can not merge selected cells,Please confirm' });
        }

    }


    _mergeRows() {
        if (this.props.selectedCell.length < 2) return null;
        let { selectedCell, tableStore, createMessage,
            cleanContentMenu, deleteCell, clearSelectedCell,
            addCell, clearMergeCell, updateStatus, addUndoHistory, startTableEdit } = this.props;
        addUndoHistory();
        cleanContentMenu();
        let x1 = selectedCell.map(obj => { return obj.x1 });
        let x2 = selectedCell.map(obj => { return obj.x2 });
        let y1 = selectedCell.map(obj => { return obj.y1 });
        let y2 = selectedCell.map(obj => { return obj.y2 });
        let x = _.concat(x1, x2);
        let y = _.concat(y1, y2);
        let minX = _.min(x);
        let maxX = _.max(x);
        let minY = _.min(y);
        let maxY = _.max(y);

        //find current table
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': selectedCell[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        let newCellArr = _.sortBy(selectedCell, ['x1', 'y1']);
        if (TableUtil.selectedIsRect(newCellArr, minX, maxX, minY, maxY)) {
            let cell = {
                x1: minX,
                y1: minY,
                x2: maxX,
                y2: maxY,
                id: uuidv4(),
                label: _.find(this.props.selectedCell, { 'label': 'value' }) ? 'value' : 'header',
                tableID: selectedCell[0].tableID,
                tableFormat: selectedCell[0].tableFormat
            }
            const { addMergeCell } = this.props;
            addMergeCell(cell);
            table.initCell(this.props, cell)//in konva layer drew the new cells
            selectedCell.forEach((sCell) => {
                if (!_.isUndefined(layer.findOne('#' + sCell.id)))
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
            this._showContentMenu(temptable, 'merge_rows');
        } else {
            if (temptable.status === 'modify') {
                this._showContentMenu(temptable, 'merge_rows');
            }
            createMessage('error', { title: 'Rows merge failed!', subtitle: 'Can not merge selected rows,Please confirm' });
        }

    }
    _mergeColumns() {
        if (this.props.selectedCell.length < 2) return null;
        let { selectedCell, tableStore, createMessage,
            cleanContentMenu, deleteCell, clearSelectedCell,
            addCell, clearMergeCell, updateStatus, addUndoHistory, startTableEdit } = this.props;
        addUndoHistory();
        cleanContentMenu();
        let x1 = selectedCell.map(obj => { return obj.x1 });
        let x2 = selectedCell.map(obj => { return obj.x2 });
        let y1 = selectedCell.map(obj => { return obj.y1 });
        let y2 = selectedCell.map(obj => { return obj.y2 });
        let x = _.concat(x1, x2);
        let y = _.concat(y1, y2);
        let minX = _.min(x);
        let maxX = _.max(x);
        let minY = _.min(y);
        let maxY = _.max(y);

        //find current table
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': selectedCell[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        let newCellArr = _.sortBy(selectedCell, ['x1', 'y1']);
        if (TableUtil.selectedIsRect(newCellArr, minX, maxX, minY, maxY)) {
            let cell = {
                x1: minX,
                y1: minY,
                x2: maxX,
                y2: maxY,
                id: uuidv4(),
                label: _.find(this.props.selectedCell, { 'label': 'value' }) ? 'value' : 'header',
                tableID: selectedCell[0].tableID,
                tableFormat: selectedCell[0].tableFormat
            }
            const { addMergeCell } = this.props;
            addMergeCell(cell);
            table.initCell(this.props, cell)//in konva layer drew the new cells
            selectedCell.forEach((sCell) => {
                if (!_.isUndefined(layer.findOne('#' + sCell.id)))
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
            this._showContentMenu(temptable, 'merge_columns');
        } else {
            if (temptable.status === 'modify') {
                this._showContentMenu(temptable, 'merge_columns');
            }
            createMessage('error', { title: 'Columns merge failed!', subtitle: 'Can not merge selected columns,Please confirm' });
        }

    }

    _deleteColumns() {
        if (this.props.selectedCell.length < 1) return null;
        let { selectedCell, tableStore, createMessage,
            cleanContentMenu, deleteCell, clearSelectedCell,
            addCell, clearMergeCell, updateStatus, addUndoHistory, startTableEdit } = this.props;
        addUndoHistory();
        cleanContentMenu();
        let x1 = selectedCell.map(obj => { return obj.x1 });
        let x2 = selectedCell.map(obj => { return obj.x2 });
        let y1 = selectedCell.map(obj => { return obj.y1 });
        let y2 = selectedCell.map(obj => { return obj.y2 });
        let x = _.concat(x1, x2);
        let y = _.concat(y1, y2);
        let minX = _.min(x);
        let maxX = _.max(x);
        let minY = _.min(y);
        let maxY = _.max(y);

        //find current table
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': selectedCell[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        let newCellArr = _.sortBy(selectedCell, ['x1', 'y1']);
        if (TableUtil.selectedIsRect(newCellArr, minX, maxX, minY, maxY)) {
            let cell = {
                x1: minX,
                y1: minY,
                x2: maxX,
                y2: maxY,
                id: uuidv4(),
                label: _.find(this.props.selectedCell, { 'label': 'value' }) ? 'value' : 'header',
                tableID: selectedCell[0].tableID,
                tableFormat: selectedCell[0].tableFormat
            }
            const { addMergeCell } = this.props;
            addMergeCell(cell);
            table.initCell(this.props, cell)//in konva layer drew the new cells
            selectedCell.forEach((sCell) => {
                if (!_.isUndefined(layer.findOne('#' + sCell.id)))
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
            this._showContentMenu(temptable, 'delete_columns');
        } else {
            if (temptable.status === 'modify') {
                this._showContentMenu(temptable, 'delete_columns');
            }
            createMessage('error', { title: 'Delete columns failed!', subtitle: 'Can not delete selected cells,Please confirm' });
        }

    }

    _deleteRows() {
        if (this.props.selectedCell.length < 1) return null;
        let { selectedCell, tableStore, createMessage,
            cleanContentMenu, deleteCell, clearSelectedCell,
            addCell, clearMergeCell, updateStatus, addUndoHistory, startTableEdit } = this.props;
        addUndoHistory();
        cleanContentMenu();
        let x1 = selectedCell.map(obj => { return obj.x1 });
        let x2 = selectedCell.map(obj => { return obj.x2 });
        let y1 = selectedCell.map(obj => { return obj.y1 });
        let y2 = selectedCell.map(obj => { return obj.y2 });
        let x = _.concat(x1, x2);
        let y = _.concat(y1, y2);
        let minX = _.min(x);
        let maxX = _.max(x);
        let minY = _.min(y);
        let maxY = _.max(y);

        //find current table
        let temptable = {};
        if (tableStore.length === 1) {
            temptable = tableStore[0]
        } else {
            tableStore.forEach((table) => {
                if (_.find(table.child, { 'id': selectedCell[0].id })) {
                    temptable = table;
                }
            })
        }
        startTableEdit(temptable.id)
        let layer = this.props.getLayer();
        let newCellArr = _.sortBy(selectedCell, ['x1', 'y1']);
        if (TableUtil.selectedIsRect(newCellArr, minX, maxX, minY, maxY)) {
            let cell = {
                x1: minX,
                y1: minY,
                x2: maxX,
                y2: maxY,
                id: uuidv4(),
                label: _.find(this.props.selectedCell, { 'label': 'value' }) ? 'value' : 'header',
                tableID: selectedCell[0].tableID,
                tableFormat: selectedCell[0].tableFormat
            }
            const { addMergeCell } = this.props;
            addMergeCell(cell);
            table.initCell(this.props, cell)//in konva layer drew the new cells
            selectedCell.forEach((sCell) => {
                if (!_.isUndefined(layer.findOne('#' + sCell.id)))
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
            this._showContentMenu(temptable, 'delete_rows');
        } else {
            if (temptable.status === 'modify') {
                this._showContentMenu(temptable, 'delete_rows');
            }
            createMessage('error', { title: 'Delete rows failed!', subtitle: 'Can not delete selected cells,Please confirm' });
        }

    }


    /*
        common function to active the finally save menu.
    */
    _showContentMenu(newtable, subOperation) {
        let { cleanContentMenu, createContentMenu, cleanOverflowMenu } = this.props;
        cleanContentMenu();
        cleanOverflowMenu();
        let stage = this.props.getStage();
        let containerRect = stage.container().getBoundingClientRect();
        let layer = this.props.getLayer();
        let TableGroup = layer.findOne('#' + newtable.id);
        createContentMenu(containerRect.top + TableGroup.getClientRect().y + TableGroup.getClientRect().height + 5,
            containerRect.left + TableGroup.getClientRect().x + TableGroup.getClientRect().width - 368, { id: newtable.id, subOperation: subOperation });

    }

    _modifyTable = () => {
        const { tableStore, cleanOverflowMenu, cleanContentMenu, startTableEdit } = this.props;
        if (tableStore && tableStore.length > 0) {
            const basetable = tableStore[0];
            let layer = this.props.getLayer();
            layer.find('Transformer').destroy();
            layer.draw();
            if (basetable.child && basetable.child.length > 0) {
                basetable.child.forEach(cell => {
                    let newCell = layer.findOne('#' + cell.id);
                    newCell.hide();//in konva layer hide all the cells
                })
            }
            let table = layer.findOne('#' + basetable.id);
            table.draggable(true);//in konva layer add  draggable to the table
            var tr = new Konva.Transformer(
                {
                    rotateEnabled: false,
                    keepRatio: false,
                    ignoreStroke: true,
                }
            );
            layer.add(tr);
            tr.attachTo(table);//in konva layer add  Transformer to the table
            layer.draw();
            cleanOverflowMenu();
            cleanContentMenu();
            startTableEdit(basetable.id);
        }
    }

    _showCells(layer, format) {
        const { tableStore } = this.props;
        if (tableStore && tableStore.length > 0) {
            tableStore.forEach((table) => {
                if (table.format === format) {
                    let tableTarget = layer.findOne('#' + table.id);
                    tableTarget.show();//in konva layer show all tables
                    if (table.child && table.child.length > 0) {
                        table.child.forEach(cell => {
                            let newCell = layer.findOne('#' + cell.id);
                            newCell.show(); //in konva show hide all the cells
                        })
                    }
                }
            })
        }
    }

    _hideCells(layer, format) {
        const { tableStore } = this.props;
        if (tableStore && tableStore.length > 0) {
            tableStore.forEach((table) => {
                if (table.format === format) {
                    let tableTarget = layer.findOne('#' + table.id);
                    if (!tableTarget) {
                        return;
                    }
                    tableTarget.hide();//in konva layer hide all tables
                    let tableTargetLabelGroup = layer.findOne('#' + table.id + '_LabelGroup');
                    if (tableTargetLabelGroup) {
                        tableTargetLabelGroup.hide();
                    }
                    if (table.child && table.child.length > 0) {
                        table.child.forEach(cell => {
                            let newCell = layer.findOne('#' + cell.id);
                            newCell.hide(); //in konva layer hide all the cells
                        })
                    }
                }
            })
        }
    }

    _showTableView() {
        const { cleanOverflowMenu, cleanContentMenu, updateOverlayView, deSelectCell, activateCellSelection } = this.props;
        let layer = this.props.getLayer();
        // recover cell selection
        let cells = layer.find('.cell');
        cells.forEach(cell => {
            cell.stroke('#BE15E6');
            cell.strokeWidth(1);
        })
        updateOverlayView('table');
        activateCellSelection();
        cleanOverflowMenu();
        cleanContentMenu();
        deSelectCell();
        layer.find('Transformer').destroy();
        this._hideCells(layer, 'gte');
        this._hideCells(layer, 'text');
        this._showCells(layer, 'native');
        layer.draw();
    }

    _showGteView() {
        const { cleanOverflowMenu, cleanContentMenu, updateOverlayView, deSelectCell, deactivateCellSelection } = this.props;
        updateOverlayView('gte');
        deactivateCellSelection();
        cleanOverflowMenu();
        cleanContentMenu();
        deSelectCell();
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        this._hideCells(layer, 'native');
        this._hideCells(layer, 'text');
        this._showCells(layer, 'gte');
        layer.draw();

    }

    _showTextView() {
        const { cleanOverflowMenu, cleanContentMenu, updateOverlayView, deSelectCell, deactivateCellSelection } = this.props;
        updateOverlayView('text');
        deactivateCellSelection();
        cleanOverflowMenu();
        cleanContentMenu();
        deSelectCell();
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        this._hideCells(layer, 'native');
        this._hideCells(layer, 'gte');
        this._showCells(layer, 'text');
        layer.draw();

    }

    _overlayOperation() {
        const { tableStore, isOverlayShow, cleanOverflowMenu, cleanContentMenu, updateOverlayShow, overlayView } = this.props;
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        layer.draw();
        if (isOverlayShow) {
            this._hideCells(layer, 'native');
            this._hideCells(layer, 'gte');
            this._hideCells(layer, 'text');
            updateOverlayShow(false);
        } else {
            if (overlayView === 'table') {
                this._showCells(layer, 'native');
            } else if (overlayView === 'gte') {
                this._showCells(layer, 'gte');
            } else if (overlayView === 'text') {
                this._showCells(layer, 'text');
            }
            updateOverlayShow(true);
        }
        layer.draw();
        cleanOverflowMenu();
        cleanContentMenu();
    }

    _modifyTable = () => {
        const { selectedCell } = this.props;
        if (selectedCell.length > 0) {
            if (_.find(this.props.selectedCell, { 'label': 'value' }) && _.find(this.props.selectedCell, { 'label': 'header' })) {
                return 'mix'
            } else if (_.find(this.props.selectedCell, { 'label': 'value' })) {
                return 'value'
            } else {
                return 'header'
            }
        } else {
            return 'disable'
        }
    }

    _calWidth = () => {
        return this.props.isMidFullScreen ? this.props.canvasWidth :
            (this.props.leftbarShow ? this.props.canvasWidth - 176 - this.props.rightsideWidth : this.props.canvasWidth - this.props.rightsideWidth - 16);
    }

    _showLess = () => {
        return (
            <React.Fragment>
                <Tooltip
                    overlayClassName="showOverlay"
                    animation="zoom"
                    trigger="click"
                    placement="bottom"
                    overlay={
                        this._showNormal()
                    }
                >
                    <div className="tool_icon">
                        <MoreIcon />
                        <div className="tool_text">
                            More Options
                        </div>
                    </div>
                </Tooltip>
            </React.Fragment>
        );
    }

    _showNormal = () => {
        // check if the engine is GTE
        let { documentDatas } = this.props;
        let { legalHSplit, legalVSplit, isOverlayShow } = this.props;
        let tableEngine = documentDatas?.category?.config?.pipeline_setting?.data_extraction?.table?.params?.engine;
        return (
            <React.Fragment>

                <div className={(this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}>
                    {(this.props.selectedCell.length === 0) ?
                        (<div>
                            <MergeCell />
                            <div className="tool_text">
                                Merge Operations
                            </div>
                        </div>)
                        :
                        (
                            <div className={(this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}>
                                <OverflowMenu
                                    renderIcon={() =>
                                    (
                                        <Tooltip
                                            placement="bottom"
                                            trigger="hover"
                                            overlayClassName="newtableOverlay"
                                            overlay={"Perform Merge operations like Merge Column/ Merge Row."}
                                        >
                                            <div className="tool_icon">
                                                <MergeCell />
                                                <div className="tool_text">
                                                    Merge Operations
                                                </div>
                                            </div>
                                        </Tooltip>
                                    )
                                    }
                                >
                                    <OverflowMenuItem
                                        itemText={'Merge Cell'}
                                        onClick={this._mergeCells.bind(this)}
                                        disabled={this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow}
                                    />
                                    <OverflowMenuItem
                                        itemText={'Merge Row'}
                                        onClick={this._mergeRows.bind(this)}
                                        disabled={this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow}
                                    />
                                    <OverflowMenuItem
                                        itemText={'Merge Column'}
                                        onClick={this._mergeColumns.bind(this)}
                                        disabled={this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow}
                                    />
                                </OverflowMenu>

                            </div>
                        )
                    }
                </div>

                <span className='divider' />



                <div className={(this.props.overlayView !== 'table' || this.props.selectedCell.length < 1 || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}>
                    {(this.props.selectedCell.length === 0) ?
                        (
                            <div>
                                <DeleteCell />
                                <div className="tool_text">
                                    Delete Operations
                                </div>
                            </div>
                        )
                        :
                        (
                            <div className={(this.props.overlayView !== 'table' || this.props.selectedCell.length < 1 || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}>
                                <OverflowMenu
                                    renderIcon={() =>
                                    (
                                        <Tooltip
                                            placement="bottom"
                                            trigger="hover"
                                            overlayClassName="newtableOverlay"
                                            overlay={"Perform Delete operations like Delete Column/ Delete Row."}
                                        >
                                            <div className="tool_icon">
                                                <DeleteCell />
                                                <div className="tool_text">
                                                    Delete Operations
                                                </div>
                                            </div>
                                        </Tooltip>
                                    )
                                    }>
                                    <OverflowMenuItem
                                        itemText={'Delete Row'}
                                        onClick={this._deleteRows.bind(this)}
                                        disabled={this.props.overlayView !== 'table' || this.props.selectedCell.length < 1 || this.props.splitFlag || !isOverlayShow}
                                    />
                                    <OverflowMenuItem
                                        itemText={'Delete Column'}
                                        onClick={this._deleteColumns.bind(this)}
                                        disabled={this.props.overlayView !== 'table' || this.props.selectedCell.length < 1 || this.props.splitFlag || !isOverlayShow}
                                    />
                                </OverflowMenu>

                            </div>
                        )
                    }
                </div>


                {/*<div className={this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow ? "tool_icon_disable" : "tool_icon"}
                    onClick={this._mergeCells.bind(this)}>

                    <MergeCell />

                    <div className="tool_text">
                        Merge Cells
                    </div>
                </div>
                <div className={this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow ? "tool_icon_disable" : "tool_icon"}
                    onClick={this._mergeRows.bind(this)}>

                    <MergeCell />

                    <div className="tool_text">
                        Merge Rows
                    </div>
                </div>
                <div className={this.props.overlayView !== 'table' || this.props.selectedCell.length < 2 || this.props.splitFlag || !isOverlayShow ? "tool_icon_disable" : "tool_icon"}
                    onClick={this._mergeColumns.bind(this)}>

                    <MergeCell />

                    <div className="tool_text">
                        Merge Columns
                    </div>
                </div>
                <div className={this.props.overlayView !== 'table' || this.props.selectedCell.length < 1 || this.props.splitFlag || !isOverlayShow ? "tool_icon_disable" : "tool_icon"}
                    onClick={this._deleteColumns.bind(this)}>

                    <MergeCell />

                    <div className="tool_text">
                        Delete Column(s)
                    </div>
                </div>
                <div className={this.props.overlayView !== 'table' || this.props.selectedCell.length < 1 || this.props.splitFlag || !isOverlayShow ? "tool_icon_disable" : "tool_icon"}
                    onClick={this._deleteRows.bind(this)}>

                    <MergeCell />

                    <div className="tool_text">
                        Delete Row(s)
                    </div>
                </div> */}

                <span className='divider' />
                <div className={(this.props.overlayView !== 'table' || this.props.selectedCell.length === 0 || this.props.splitCell.length > 0 || !legalHSplit || !isOverlayShow) ? "tool_icon_withmenu_disable" : "tool_icon_withmenu"}>
                    {(this.props.selectedCell.length === 0 || this.props.splitCell.length > 0 || !legalHSplit) ?
                        (<div>
                            <SplitCells />
                            <div className="tool_text">
                                Split Horizontal
                            </div>
                        </div>)
                        :
                        (<Tooltip
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
                                        disabled={this.props.selectedCell.length === 0 || this.props.splitCell.length > 0 || !legalHSplit}
                                    />
                                    <span className="labeltext">
                                        Rows
                                    </span>
                                    <Button kind='ghost'
                                        className="Splitb"
                                        onClick={this._splitHorizontalCells.bind(this)}
                                        disabled={this.state.horizontalNumber < 2 || this.state.horizontalNumber > 100 || !Number.isInteger(this.state.horizontalNumber) || !legalHSplit}
                                    >
                                        Split
                                    </Button>
                                </React.Fragment>
                            }
                        >
                            <div>
                                <SplitCells />
                                <div className="tool_text">
                                    Split Horizontal
                                </div>
                            </div>
                        </Tooltip>
                        )
                    }
                </div>
                <div className={(this.props.overlayView !== 'table' || this.props.selectedCell.length === 0 || this.props.splitCell.length > 0 || !legalVSplit || !isOverlayShow) ? "tool_icon_withmenu_disable" : "tool_icon_withmenu"}>
                    {(this.props.selectedCell.length === 0 || this.props.splitCell.length > 0 || !legalVSplit) ?
                        (<div>
                            <SplitCellsVertical />
                            <div className="tool_text">
                                Split Vertical
                            </div>
                        </div>)
                        :
                        (<Tooltip
                            animation="zoom"
                            trigger="click"
                            placement="bottom"
                            overlayClassName="spliteOverlay"
                            overlay={
                                <React.Fragment>
                                    <NumberInput
                                        id="tj-input2"
                                        label="Split Into"
                                        invalidText="Number is not valid"
                                        max={100}
                                        min={2}
                                        value={2}
                                        onChange={this._changeVerticalNumber.bind(this)}
                                        disabled={this.props.selectedCell.length === 0 || this.props.splitCell.length > 0 || !legalVSplit}
                                    />
                                    <span className="labeltext">
                                        Columns
                                    </span>
                                    <Button kind='ghost'
                                        className="Splitb"
                                        onClick={this._splitVerticalCells.bind(this)}
                                        disabled={this.props.selectedCell.length === 0 || this.props.splitCell.length > 0 || !legalVSplit}
                                    >
                                        Split
                                    </Button>
                                </React.Fragment>
                            }
                        >
                            <div>
                                <SplitCellsVertical />
                                <div className="tool_text">
                                    Split Vertical
                                </div>
                            </div>
                        </Tooltip>
                        )
                    }
                </div>
                <span className='divider' />
                {this.props.isOverlayShow ?
                    (
                        <div className={(this.props.splitCell.length > 0 || this.props.mergeCell.length > 0 || this.props.tableEditFlag) ? "tool_icon_disable" : "tool_icon"}
                            onClick={(this._overlayOperation.bind(this))}>

                            <OverLayHide />

                            <div className="tool_text">
                                Hide Overlay
                            </div>
                        </div>
                    ) :
                    (
                        <div className={(this.props.splitCell.length > 0 || this.props.mergeCell.length > 0 || this.props.tableEditFlag) ? "tool_icon_disable" : "tool_icon"}
                            onClick={this._overlayOperation.bind(this)}>

                            <OverLayShow />

                            <div className="tool_text">
                                Show Overlay
                            </div>
                        </div>
                    )
                }
                {this.props.isOverlayShow && tableEngine?.toLowerCase().includes('azure') ? (
                    <div className={this.props.overlayView === 'table' ? "tool_icon tool_icon_selected" : "tool_icon"}
                        onClick={this._showTableView.bind(this)}>
                        <OverLayShow />
                        <div className="tool_text">
                            Table View
                        </div>
                    </div>

                ) : null}
                {this.props.isOverlayShow && tableEngine?.toLowerCase().includes('gte') && this.props.gteEnabled ? (

                    <div className={this.props.tableEditFlag ? "tool_icon_disable" : this.props.overlayView === 'gte' ? "tool_icon tool_icon_selected" : "tool_icon"}
                        onClick={this._showGteView.bind(this)}>
                        <OverLayShow />
                        <div className="tool_text">
                            GTE View
                        </div>
                    </div>
                ) : null}
                {this.props.isOverlayShow ? (

                    <div className={this.props.tableEditFlag ? "tool_icon_disable" : this.props.overlayView === 'text' ? "tool_icon tool_icon_selected" : "tool_icon"}
                        onClick={this._showTextView.bind(this)}>
                        <OverLayShow />
                        <div className="tool_text">
                            Text View
                        </div>
                    </div>
                ) : null}
            </React.Fragment>
        )
    }

    render() {
        let { isOverlayShow } = this.props;
        return (
            <div className="topbar" style={{
                width: this._calWidth(),
                left: this.props.isMidFullScreen ? 0 :
                    (this.props.leftbarShow ? '176px' : '16px'),
                display: this.props.isRightFullScreen ? 'none' : null
            }}
            >
                <div className="bx--grid bx--grid--full-width tool_bar">
                    <div className="bx--row banner" >
                        {/* <Tooltip
                            placement="right"
                            trigger="hover"
                            overlayClassName="newtableOverlay"
                            overlay={"Click on New table and select table type, Then drag your mouse over a table to select it."}
                        > */}
                        <div className={(this.props.overlayView !== 'table' || this.props.isCreateTable || !this.props.isOverlayShow || this.props.tableEditFlag || this.props.splitFlag) ? "tool_icon_withmenu_disable" : "tool_icon_withmenu"}>
                            {/* <NewTable/> */}
                            {/* <OverflowMenu
                                    renderIcon={() =>
                                    (<div className="tool_icon">
                                        <NewTable />
                                        <div className="tool_text_tooltips">
                                            New Table
                                        </div>
                                    </div>)
                                    }
                                > */}
                            {/* <OverflowMenuItem
                                        itemText={'Bordered Table'}
                                        onClick={this._createBorderedTable.bind(this)}
                                        disabled={this.props.isCreateTable || !this.props.isOverlayShow}
                                    />
                                    <OverflowMenuItem
                                        itemText={'Borderless Table'}
                                        onClick={this._createBorderlessTable.bind(this)}
                                        disabled={this.props.isCreateTable || !this.props.isOverlayShow}
                                    /> */}
                            {/* </OverflowMenu> */}

                        </div>
                        {/* </Tooltip> */}
                        {/* <div className={(!(this.props.tableStore.length > 0) ||  this.props.tableStore.length > 1 || !this.props.isOverlayShow)? "tool_icon_disable" : "tool_icon"}
                                onClick={this._modifyTable.bind(this)}>
                                
                                    <Modify/>
                                
                                <div className="tool_text">
                                    Modify Table
                                </div>
                            </div> */}
                        {/* <span className='divider' /> */}
                        <div className={(this.props.overlayView === 'gte' || !this.props.undoEnabled || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}
                            onClick={this._undo.bind(this)}>

                            <Undo32 />

                            <div className="tool_text">
                                Undo
                            </div>
                        </div>
                        <div className={(this.props.overlayView === 'gte' || !this.props.redoEnabled || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}
                            onClick={this._redo.bind(this)}>

                            <Redo32 />

                            <div className="tool_text">
                                Redo
                            </div>
                        </div>
                        <span className='divider' />
                        <div className={(this.props.overlayView === 'gte' || this._modifyTable() === 'disable' || this._modifyTable() === 'header' || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}
                            onClick={this._setHeader.bind(this)}>

                            <Headers />

                            <div className="tool_text">
                                Set Headers
                            </div>
                        </div>
                        <div className={(this.props.overlayView === 'gte' || this._modifyTable() === 'disable' || this._modifyTable() === 'value' || this.props.splitFlag || !isOverlayShow) ? "tool_icon_disable" : "tool_icon"}
                            onClick={this._clearHeader.bind(this)}>

                            <HeadersClear />

                            <div className="tool_text">
                                Clear Headers
                            </div>
                        </div>
                        <span className='divider' />
                        {this._calWidth() >= 600 ? this._showNormal() : this._showLess()}
                        <div className="tool_icon_full"
                            onClick={this._fullscreen.bind(this)}>

                            {this.props.isMidFullScreen ? <NormalScreen /> : <FullScreen />}

                            <div className="tool_text">
                                {this.props.isMidFullScreen ? 'Restore' : 'Maximise'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
