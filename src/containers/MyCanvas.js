/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react'
import { Stage, Layer } from 'react-konva';
import TableTopBar from './TableTopBar';
import { connect } from 'react-redux';
import { Provider } from 'react-redux';
import LoadImage from './LoadImage';
import HandleCanvas from './HandleCanvas';
import ContentMenu from './ContentMenu';
import OverflowMenu from './OverflowMenu';
import CellOverflowMenu from './CellOverflowMenu';
import ConfirmMenu from './ConfirmMenu';
import TableLeftSlideBar from './TableLeftSlideBar';
import TableRightContent from './TableRightContent';
import TableBottomBar from './TableBottomBar';
import { store } from '../index'
import * as _ from 'lodash';
import { selectCell, deSelectCell } from '../redux/modules/table'
import { createCellOverflowMenu, cleanCellOverflowMenu } from '../redux/modules/cellOverflowMenu'
import { cleanOverflowMenu } from '../redux/modules/overflowmenu'
import { clearImage } from '../redux/modules/image'
import KonvaUtil from '../components/core/konvaUtil.js';

const konvaUtil = new KonvaUtil()

class MyCanvas extends Component {

    constructor(props) {
        super(props);

        // this.stage = React.createRef();
        // this.layer = React.createRef();
        this.state = {
            startX: null,
            startY: null,
            startTableID: null,
            deSelectTag: false,//this tag is used to deselect one single cell when only this cell is in the selectedCell.
            rightsideWidth: window.innerWidth / 3
        }
    }

    componentDidMount() {
        // clearImage()
        this.stage = this.refs.stage;
        this.layer = this.refs.layer;
    }

    _getStage() {
        return this.refs.stage;
    }

    _getLayer() {
        return this.refs.layer;
    }

    renderLayer() {
        let { imagefile } = this.props;
        // If got the imagefile from redux then render the image use url:large_image.
        if (imagefile) {
            return (
                <LoadImage
                    id={imagefile.id}
                    uniqId={imagefile.uniqId}
                    src={imagefile.large_image}
                    x={this.props.canvasWidth}
                    y={this.props.canvasHeight}
                    getLayer={() => this._getLayer()}
                    rightsideWidth={this.state.rightsideWidth}
                />

            )
        } else {
            return null;
        }

    }

    _clearTransformer(e) {
        e.evt.preventDefault();
        let layer = this.refs.layer
        if (e.target === e.target.getStage()) {

            layer.find('Transformer').destroy();
            layer.draw();
        }
        layer.draw();
    }

    _hasUnfinishedOperation() {
        let { splitCell, isCreateTable, mergeCell } = this.props;
        if ((splitCell && splitCell.length > 0) || isCreateTable || (mergeCell && mergeCell.length > 0)) {
            return true
        }
        return false
    }

    _handleClick(e) {
        let { createCellOverflowMenu, cleanCellOverflowMenu, overlayView, selectedCell, isOverlayShow, splitFlag } = this.props;
        e.evt.stopPropagation();
        if (e.evt.button === 2 && overlayView === 'table' && selectedCell.length >= 1 && isOverlayShow && !splitFlag) {
            // Pop up the right-click menu
            // Find the table using the coordinate
            createCellOverflowMenu(e.evt.y,
                e.evt.x, { id: "id" });
        }
    }

    _handleMouseDown(e) {
        if (e.evt.button === 2) {
            return;
        }
        let { cleanOverflowMenu, cleanCellOverflowMenu } = this.props;
        cleanOverflowMenu();
        cleanCellOverflowMenu();
        console.debug("mouse down")
        //Listening the layer's mousedown event, If have should got the mouse pointer position and store in loacal state.
        //In move mode(isPin), have unfinished operat, no table and overlayhide we don't need drag select so we don't record the position. 
        let { isPin, tableStore, isOverlayShow, cellSelectionEnabled } = this.props;
        if (!isPin && !this._hasUnfinishedOperation() && (tableStore && tableStore.length > 0) && isOverlayShow && cellSelectionEnabled) {
            // console.log('layer mousedown process')
            let stage = this.stage;
            let mousePos = stage.getPointerPosition(); // Got the current mouse position in konva.
            this.setState({
                startX: mousePos.x,
                startY: mousePos.y,
            })

            let layer = this.layer;
            let { deSelectCell, selectedCell } = this.props;

            if (selectedCell.length === 1) {
                this.setState({ deSelectTag: true });
            }

            if (!e.evt.ctrlKey) {
                deSelectCell();
                selectedCell.forEach(cell => {
                    let targetCell = layer.findOne('#' + cell.id);
                    if (targetCell) {
                        targetCell.stroke('#BE15E6');
                        targetCell.strokeWidth(1);
                        targetCell.fill(cell.label === 'header' ? '#3706BC4D' : null)
                    }


                });
                layer.draw();
            }
        }
    }

    _mouseOperation(props, e, operations) {
        let { isPin, tableStore, isOverlayShow, cellSelectionEnabled } = this.props;
        //This is a common function to process the mouse move and mouse up event.
        // 1.When mouse move we need change the current selected cell's stroke.
        // 2.When mouse up we need store the select cells to redux(selectedCell).
        if (!isPin && !this._hasUnfinishedOperation() && (tableStore && tableStore.length > 0) && isOverlayShow && cellSelectionEnabled) {
            // console.log('handleMouse' + operations)
            let stage = this.refs.stage;
            let mousePos = stage.getPointerPosition(); // Got the current mouse position in konva.
            let layer = this.refs.layer
            let cells = layer.find('.cell'); //Use konva method, got all the cells in layer by name is 'cell'.
            let sCells = [];
            let { tableStore, selectCell, deSelectCell, selectedCell } = this.props;
            let tableEditFlag = false;
            let editingTable = null;
            tableStore.forEach((table) => {
                // if any table is being edited
                if (table.tableEditFlag) {
                    // console.log("table " + table.id + " is being edited")
                    tableEditFlag = true;
                    editingTable = table;
                }
            })
            if (cells && cells.length > 0 && this.state.startX && this.state.startY) {
                cells.forEach(cell => {
                    if (cell.attrs.tableFormat !== 'native') {
                        return;
                    }
                    // loop all the konva cell and check if intersect with mouse drag area.
                    if (konvaUtil.haveIntersection(cell.getClientRect(), { x1: this.state.startX, y1: this.state.startY, x2: mousePos.x, y2: mousePos.y })
                    ) {
                        // if cell intersect with mouse drag area then store in temp.
                        if (selectedCell.length > 0) {
                            if (cell.attrs.tableID === selectedCell[0].tableID) {
                                sCells.push({ id: cell.attrs.id });

                            }
                        } else {
                            // first time to select
                            if (cell.attrs.tableID === this.state.startTableID) {
                                sCells.push({ id: cell.attrs.id });
                            }
                            // changed Id to table ID by Priyanka
                            if (this.state.startTableID === null) {
                                sCells.push({
                                    id: cell.attrs.id,
                                    tableID: cell.attrs.tableID,
                                    tableFormat: cell.attrs.tableFormat,
                                    x: cell.attrs.x,
                                    y: cell.attrs.y,
                                    width: cell.attrs.width,
                                    height: cell.attrs.height,
                                });
                            }
                        }
                    }
                })
            }


            // when users choose multiply cells at the same time
            // find closest cell and its table
            if (sCells && sCells.length > 0) {
                if (this.state.startTableID === null && operations === 'move') {
                    // this function will be called only one time
                    // so don't need to care about the effiency
                    // first time to select, find the table
                    let closestCell = {};
                    let dis = Infinity;
                    let x = this.state.startX;
                    let y = this.state.startY;
                    sCells.forEach(cell => {
                        let cellPointList = [
                            { x: cell.x, y: cell.y },                            //left-up point of the cell
                            { x: cell.x, y: cell.y + cell.height },              //left-down point of the cell
                            { x: cell.x + cell.width, y: cell.y },               //right-up point of the cell
                            { x: cell.x + cell.width, y: cell.y + cell.height }  //right-down point of the cell
                        ];

                        cellPointList.forEach(point => {
                            let curDis = konvaUtil.getDistanceSqua(point.x, point.y, x, y);
                            if (curDis < dis) {
                                closestCell = cell;
                                dis = curDis;
                            }
                        });
                    });
                    this.setState({ startTableID: closestCell.tableID });
                }

                if (!!this.state.startTableID) {
                    // check if the selected cell belong to some being edited table
                    if (tableEditFlag && editingTable.id !== this.state.startTableID) {
                        // Other table is being edited. return
                        // console.log("Other table " + editingTable.id + "is being edited")
                        if (operations === 'up' && this.state.startTableID != null) {
                            this.setState({ startTableID: null });
                        }
                        return;
                    }
                }





                // if only select one cell and this cell is selected before.
                // then deselect this cell.
                // this is no longer needed, because deselect will be performed when mouse down.
                // if (sCells.length===1 && operations === 'up') {
                //     // if have intersected cell and also is mouse up.
                //     let workCell = _.find(selectedCell, { 'id': sCells[0].id })
                //     // if already store this data in redux(selectedCell), Then deslect it.
                //     // 1.delete if from redux(selectedCell)
                //     // 2.let konva cell's style like other normal cell.
                //     if (workCell && (selectedCell.length === 1 || (e.evt && e.evt.ctrlKey))) {
                //         deSelectCell(workCell.id)
                //         let targetCell = layer.findOne('#' + workCell.id);
                //         targetCell.stroke('#BE15E6');
                //         targetCell.strokeWidth(1);
                //         targetCell.fill(workCell.label === 'header' ? '#3706BC4D' : null)
                //         layer.draw();
                //         sCells = [];
                //     }
                // }

                if (this.state.deSelectTag) {
                    this.setState({ deSelectTag: false });
                    return;
                }

                // if have intersected cell
                if (sCells && sCells.length > 0) {
                    // if user hold the ctrl key then add selected cell to the intersected cell list
                    if (e.evt && e.evt.ctrlKey) {
                        if (selectedCell && selectedCell.length > 0) {
                            sCells = _.concat(sCells, selectedCell);
                        }
                    }
                    // clear all the Konva cell's style. 
                    // Because we need use type so will find the cell's info from redux. 
                    if (operations === 'up') {
                        deSelectCell()
                    }
                    cells.forEach(cell => {
                        let workCell = null;
                        tableStore.forEach((table) => {
                            let tempCell = _.find(table.child, { 'id': cell.attrs.id })
                            if (tempCell) {
                                workCell = tempCell
                            }
                        })

                        cell.stroke('#BE15E6');
                        cell.strokeWidth(1);
                        if (!workCell) {

                            console.log("Work Cell not found")
                            console.log(cell)
                        }
                        cell.fill(workCell.label === 'header' ? '#3706BC4D' : null)
                    })
                    let cellSelected = []
                    // Loop all the intersected cell
                    sCells.forEach(sCell => {
                        // if some table is being edited and not the selected cell's table, skip it
                        // if(tableEditFlag && editingTable.id !== sCell.tableID) {
                        //     return;
                        // }
                        // Change konva cell's style to selected cell's style.
                        if (!_.isUndefined(layer.find('#' + sCell.id))) {
                            let targetCell = layer.find('#' + sCell.id);
                            targetCell.stroke("#000000")
                            targetCell.strokeWidth(2);
                        }

                        let workCell = null;
                        // In redux(selectedCell) we need store the cell's usefull info so will find the cell in redux(tableStore).
                        tableStore.forEach((table) => {
                            let tempCell = _.find(table.child, { 'id': sCell.id })

                            if (tempCell) {
                                workCell = tempCell
                            }
                        })
                        cellSelected.push(workCell);

                    })
                    layer.draw();
                    // when mouse up store the cell info to redux(selectedCell).
                    if (operations === 'up') {
                        selectCell(cellSelected);

                    }
                }
            }
            if (operations === 'up' && this.state.startTableID != null) {
                this.setState({ startTableID: null });
            }
        }

    }

    _handleMouseMove(e) {
        this._mouseOperation(this.props, e, 'move')
        // console.log('handleMouseMove',e.target)
    }

    _handleMouseUp(e) {
        // console.log('layer mouseup')
        this._mouseOperation(this.props, e, 'up')
        // console.log('handleMouseUp',e.target)
        this.setState({
            startX: null,
            startY: null
        })
    }

    updateSlider(size) {
        this.setState({ rightsideWidth: size.width })
    }

    render() {
        const { canvasWidth, canvasHeight, isMidFullScreen, isRightFullScreen } = this.props;
        /*
            1.Add left part component to render image list:TableLeftSlideBar.
            2.Add right part component to rebuild the table to html:TableRightContent.
            3.Add the finally subbmit component to submit/cancel all the changes of table to BE: ContentMenu.
            4.Add the splite confirm component to confirm/cancel all the changes of cell split but it not finally save: ConfirmMenu.
            5.Add the table overflow menu component : OverflowMenu.
            6.Add the top toolbar compomemt: TableTopBar.
            7.Add the bottom toolbar compomemt: TableBottomBar.
            8.Render Konva.Stage
            9.Render Konva.Layer
            *The canvas have the full size,So the 1-7's css index is so big to make sure there are on the top.
        */
        return (
            <div style={{ backgroundColor: '#F4F4F4', width: canvasWidth, height: canvasHeight }}>
                {(isMidFullScreen || isRightFullScreen) ? null : (<TableLeftSlideBar
                    getStage={() => this._getStage()}
                    getLayer={() => this._getLayer()}
                //imageList={Invoice3}
                />)}
                {isMidFullScreen ? null : (<TableRightContent
                    rightsideWidth={this.state.rightsideWidth}
                    onSlider={this.updateSlider.bind(this)}
                    getStage={() => this._getStage()}
                    getLayer={() => this._getLayer()}
                    files={this.props.files}
                    selectedId={this.props.selectedId}
                />)}
                <div id='fullTag' style={{ backgroundColor: '#F4F4F4' }}>
                    <ContentMenu getStage={() => this._getStage()}
                        getLayer={() => this._getLayer()} />
                    <ConfirmMenu getStage={() => this._getStage()}
                        getLayer={() => this._getLayer()} />
                    <OverflowMenu getStage={() => this._getStage()}
                        getLayer={() => this._getLayer()} />
                    <CellOverflowMenu getStage={() => this._getStage()}
                        getLayer={() => this._getLayer()} />
                    <TableTopBar
                        rightsideWidth={this.state.rightsideWidth}
                        getStage={() => this._getStage()}
                        getLayer={() => this._getLayer()}
                    />
                    <TableBottomBar
                        rightsideWidth={this.state.rightsideWidth}
                        getStage={() => this._getStage()}
                        getLayer={() => this._getLayer()}
                    />

                    <Stage
                        ref="stage"
                        width={canvasWidth}
                        height={canvasHeight}
                        onClick={(e) => this._clearTransformer(e)}
                    >
                        <Provider store={store}>
                            <Layer ref="layer" id={'layer0'}
                                onMouseDown={(e) => this._handleMouseDown(e)}
                                onMouseMove={(e) => this._handleMouseMove(e)}
                                onMouseUp={(e) => this._handleMouseUp(e)}
                                onClick={(e) => this._handleClick(e)}
                            >
                                {this.renderLayer()}
                                {this.props.imagefile ? (<HandleCanvas
                                    getStage={() => this._getStage()}
                                    getLayer={() => this._getLayer()}
                                />) : null}

                            </Layer>
                            {/* <Layer ref="layer1" id={'layer1'} zindex>
                                    {this.renderLayer()}    
                            </Layer> */}
                        </Provider>
                    </Stage>
                </div>
            </div>
        );

    }
}

const mapStateToProps = (state) => ({
    ...state.setting,
    ...state.image,
    ...state.table,
    ...state.cellOverflowMenu,
})
const mapDispathToProps = (dispath) => {
    return {
        selectCell: (cell) => {
            dispath(selectCell(cell))
        },
        deSelectCell: () => {
            dispath(deSelectCell())
        },
        createCellOverflowMenu: (top, left, params) => {
            dispath(createCellOverflowMenu(top, left, params))
        },
        cleanCellOverflowMenu: () => {
            dispath(cleanCellOverflowMenu())
        },
        cleanOverflowMenu: () => {
            dispath(cleanOverflowMenu())
        },
    }
}

export default connect(mapStateToProps, mapDispathToProps)(MyCanvas);