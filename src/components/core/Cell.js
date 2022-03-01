/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import { Group,Rect } from 'react-konva';
import Konva from 'konva';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { store } from '../../index';

export function init(props, cell) {
    const state = {
        color: "#BE15E6",
        strokeWidth: 1,
        opacity:0.5,
        HeaderColor:'#3706BC4D',
    };
    // cell = _.cloneDeep(cell);
    const layer = props.getLayer();
    // let image = layer.findOne('Image');
    // cell.x1 = cell.x1 + image.x()
    // cell.x2 = cell.x2 + image.x()
    // cell.y1 = cell.y1 + image.y()
    // cell.y2 = cell.y2 + image.y()
    // console.log('cellinit');
    // console.log(cell);

    // const newgroup = new Konva.Group({
    //     x: cell.x1,
    //     y: cell.y1,
    //     draggable: false,
    //     id: cell.id,
    //     zIndex:1
    // });

    // Create area
    const tableCell = new Konva.Rect({
        x: cell.x1,
        y: cell.y1,
        draggable: false,
        id: cell.id,
        name:'cell',
        // zIndex:2,
        width: cell.x2 - cell.x1 ,
        height: cell.y2 - cell.y1 ,
        stroke: state.color,
        strokeWidth: state.strokeWidth,
        fill: cell.label === 'header' ? state.HeaderColor : null,
        tableID: cell.tableID,
        tableFormat: cell.tableFormat,
    });

    // newgroup.add(table);
    layer.add(tableCell)
    layer.draw();

    tableCell.on('mouseover', function () {
        let groups = layer.find('Group');
        if(groups){
            groups.forEach(hidegroup => {
                if(hidegroup.attrs.id && hidegroup.attrs.id.indexOf('_LabelGroup') !== -1){
                    hidegroup.hide();
                }
            })
        }
        let {tableStore} = store.getState().table;
        let targetTable = null;
        tableStore.forEach((table)=>{
            if(_.find(table.child, { 'id': cell.id })) {
                targetTable = table
            }
        })

        // To show the table label
        if(targetTable){
            let Labelgroup = layer.findOne('#' + targetTable.id + '_LabelGroup');
            if (Labelgroup) {
                Labelgroup.show();
                Labelgroup.moveToTop()
            }
            layer.draw();
        }

        // If this is the splited cell it will add a transformer for this cell.
        let { splitCell, vSplitMode, hSplitMode } = store.getState().table;
        if(splitCell && splitCell.length > 0){
            
            let sortedSplitCells = _.sortBy(splitCell, ['x2','y2'])
            let sortedSplitCellIds = sortedSplitCells.map(s=>s.id);
            let baseCell = _.find(sortedSplitCells, { 'id': cell.id });
            let minCellIds
            if(vSplitMode) {
                minCellIds = _.filter(sortedSplitCells, cell=>cell.x2 === sortedSplitCells[0].x2).map(obj => obj.id);
            }
            if(hSplitMode) {
                minCellIds = _.filter(sortedSplitCells, cell=>cell.y2 === sortedSplitCells[0].y2).map(obj => obj.id);
            }
             
            if(baseCell){
                if(!minCellIds.includes(cell.id)){
                    let targetTransformer = layer.find('Transformer');
                    // console.log(targetTransformer)
                    if(targetTransformer && targetTransformer.length > 0) {
                        // To prevent performance issue. So if this cell already have transformer it will not add again.
                        let nodeId = targetTransformer[0].nodes()[0].id();
                        // console.log(nodeId)
                        if(nodeId !== cell.id) {
                            layer.find('Transformer').destroy();
                            // for thr vertical splite it just allow move vertical
                            // if (_.uniq(y1).length === 1 && _.uniq(y2).length === 1){
                            if (vSplitMode){
                                let trV = new Konva.Transformer(
                                    {
                                        rotateEnabled:false,
                                        ignoreStroke: true,
                                        enabledAnchors: ['middle-left'],
                                        borderStrokeWidth:2,
                                        borderStroke:'yellow',
                                        anchorStroke:'yellow',
                                        anchorStrokeWidth:2,
                                        nodes:[tableCell]
                                    }
                                );
                                layer.add(trV);
                                layer.draw();
                            // for thr horizontal splite it just allow move horizontal
                            // } else if (_.uniq(x1).length === 1 && _.uniq(x2).length === 1){
                            } else if (hSplitMode){
                                let trH = new Konva.Transformer(
                                    {
                                        rotateEnabled:false,
                                        ignoreStroke: true,
                                        enabledAnchors: ['top-center'],
                                        borderStrokeWidth:2,
                                        borderStroke:'yellow',
                                        anchorStroke:'yellow',
                                        anchorStrokeWidth:2,
                                        nodes:[tableCell]
                                    }
                                );
                                layer.add(trH);
                                layer.draw();
                            }
                        }
                    // For the first cell it will add transformer to the second one.
                    } else {
                        layer.find('Transformer').destroy();
                        if (vSplitMode){
                            let trV = new Konva.Transformer(
                                {
                                    rotateEnabled:false,
                                    ignoreStroke: true,
                                    enabledAnchors: ['middle-left'],
                                    borderStrokeWidth:2,
                                    borderStroke:'yellow',
                                    anchorStroke:'yellow',
                                    anchorStrokeWidth:2,
                                    nodes:[tableCell]
                                }
                            );
                            layer.add(trV);
                            layer.draw();
                        } else if (hSplitMode){
                            let trH = new Konva.Transformer(
                                {
                                    rotateEnabled:false,
                                    ignoreStroke: true,
                                    enabledAnchors: ['top-center'],
                                    borderStrokeWidth:2,
                                    borderStroke:'yellow',
                                    anchorStroke:'yellow',
                                    anchorStrokeWidth:2,
                                    nodes:[tableCell]
                                }
                            );
                            layer.add(trH);
                            layer.draw();
                        }
                    }
                    
                    
                } else {
                    let index = _.indexOf(sortedSplitCellIds, cell.id);
                    let newbaseCell
                    if(vSplitMode) {
                        newbaseCell = layer.findOne('#' + sortedSplitCellIds[index + minCellIds.length]);
                    }
                    if (hSplitMode) {
                        newbaseCell = layer.findOne('#' + sortedSplitCellIds[index + 1]);
                    }
                    newbaseCell.fire('mouseover')
                }
            }
        }
    })


    // For the select mode use cell click to select cell and ctrl+click to select multiple cells.
    tableCell.on('click',(e)=>{
        e.evt.preventDefault();
        let {selectedCell,splitCell,isCreateTable,mergeCell} = store.getState().table;
        let {isPin} = store.getState().setting;
        if(isPin && (!((splitCell && splitCell.length > 0) || isCreateTable || (mergeCell && mergeCell.length > 0)))) {
            let tempcell = _.find(selectedCell, function(o) { return o.id === cell.id; });
            let { selectCell, deSelectCell } = props;
            let layer = props.getLayer();
            if(tempcell && (selectedCell.length === 1 || (e.evt && e.evt.ctrlKey))) {
                deSelectCell()
                tableCell.stroke(state.color);
                tableCell.strokeWidth(1);
                tableCell.fill(cell.label === 'header' ? state.HeaderColor : null)
                layer.draw();
            } else {
                if(e.evt && e.evt.ctrlKey) {
                    selectCell([...selectedCell, cell])
                    tableCell.stroke("#000000");
                    // table.fill(cell.label === 'header' ? '#3706BC4D' : "#FFB7FF4D");
                    tableCell.strokeWidth(2);
                    layer.draw();
                } else {
                    deSelectCell()
                    selectedCell.forEach((sCell) => {
                        let targetCell = layer.findOne('#' + sCell.id);
                        targetCell.stroke(state.color)
                        targetCell.fill(sCell.label === 'header' ? state.HeaderColor : null)
                        
                    })
                    selectCell([cell])
                    tableCell.stroke("#000000");
                    // table.fill(cell.label === 'header' ? '#3706BC4D' : "#FFB7FF4D");
                    tableCell.strokeWidth(2);
                    layer.draw();
                }
    
            }
        }  
    })

    // When the cell is transform it will change the cell size on the konva layer.
    // Also add a limitation of size change.
    tableCell.on('transform', function(e) {
        // console.log('cell transform');
        let { splitCell, vSplitMode, hSplitMode } = store.getState().table;
        let { updateSplitCell,updateSplitCells } = props;
        let baseCell = _.find(splitCell, { 'id': cell.id });
        if (vSplitMode){//row
            //targetCell is left to the base cell
            let targetCells = _.filter(splitCell,{ 'x2': baseCell.x1 });
            let neighbors = _.filter(splitCell, {'x2': baseCell.x2})
            // newbaseCell is the cell on the image
            let newbaseCell = layer.findOne('#' + baseCell.id);
            
            if(newbaseCell.x() > (baseCell.x2-5)){
                layer.find('Transformer').stopTransform();
                newbaseCell.x(baseCell.x2-5)
            }
            
            targetCells.forEach(targetCell => {
                let newtargetCell = layer.findOne('#' + targetCell.id);
                if(newbaseCell.x() < (targetCell.x1+5)){
                    layer.find('Transformer').stopTransform();
                    newbaseCell.x(targetCell.x1+5)
                }
                targetCell.x2 = newbaseCell.x();
                newtargetCell.width(targetCell.x2 - targetCell.x1);
            });
            baseCell.x1 = newbaseCell.x();
            
            newbaseCell.width(baseCell.x2 - baseCell.x1);
            newbaseCell.scaleX(1);
            newbaseCell.scaleY(1);
            neighbors.forEach(neighbor => {
                let neighborDisplay = layer.findOne('#' + neighbor.id);
                neighbor.x1 = baseCell.x1;
                neighborDisplay.x(baseCell.x1)
                neighborDisplay.width(newbaseCell.width())
                neighborDisplay.scaleX(1)
                neighborDisplay.scaleY(1)
            })
            layer.draw();
 
            updateSplitCell(baseCell);
            updateSplitCells(_.concat(targetCells, neighbors))

            
        } else if (hSplitMode){//col
            //targetCell is up to the base cell
            let targetCells = _.filter(splitCell,{ 'y2': baseCell.y1 });
            let neighbors = _.filter(splitCell, {'y2': baseCell.y2})
            let newbaseCell = layer.findOne('#' + baseCell.id);

            if(newbaseCell.y() > (baseCell.y2-5)){
                layer.find('Transformer').stopTransform();
                newbaseCell.y(baseCell.y2-5)
            }

            targetCells.forEach(targetCell => {
                let newtargetCell = layer.findOne('#' + targetCell.id);
                if(newbaseCell.y() < (targetCell.y1+5)){
                    layer.find('Transformer').stopTransform();
                    newbaseCell.y(targetCell.y1+5)
                }
                targetCell.y2 = newbaseCell.y();
                newtargetCell.height(targetCell.y2 - targetCell.y1);
            });
            baseCell.y1 = newbaseCell.y();

            newbaseCell.height(baseCell.y2 - baseCell.y1)
            newbaseCell.scaleX(1);
            newbaseCell.scaleY(1);
            neighbors.forEach(neighbor => {
                let neighborDisplay = layer.findOne('#' + neighbor.id);
                neighbor.y1 = baseCell.y1;
                neighborDisplay.y(baseCell.y1)
                neighborDisplay.height(newbaseCell.height())
                neighborDisplay.scaleX(1)
                neighborDisplay.scaleY(1)
            })
            layer.draw();

            updateSplitCell(baseCell);
            updateSplitCells(_.concat(targetCells, neighbors))
        }
    });

    tableCell.on('transformstart', function(e) {
        let { cleanConfirmMenu } = props;
        cleanConfirmMenu();
        
    })

    // When the cell is transform end will popup the confirm menu.
    tableCell.on('transformend', function(e) {
        let {tableStore,selectedCell,splitCell} = store.getState().table;
        let orignalCell = selectedCell[0];
        let temptable = {};
        if(tableStore.length === 1){
          temptable = tableStore[0]
        } else {
          tableStore.forEach((table)=>{
            if(_.find(table.child, { 'id': orignalCell.id })) {
              temptable = table;
            }
          })
        }

        let { cleanConfirmMenu,createConfirmMenu }  = props;
        cleanConfirmMenu();
        let stage = props.getStage();
        let sortedSplitCells = _.sortBy(splitCell, ['x2','y2'])
        let Targetcell = layer.findOne('#' + sortedSplitCells[sortedSplitCells.length-1].id);
        let containerRect = stage.container().getBoundingClientRect();
        createConfirmMenu(containerRect.top + Targetcell.getClientRect().y + Targetcell.getClientRect().height, 
            containerRect.left + Targetcell.getClientRect().x + Targetcell.getClientRect().width - 48,{id: temptable.id})
    })

    tableCell.on('contextmenu', function(e){
        // prevent default behavior
        e.evt.preventDefault();
    });

    return tableCell;
}

export class Cell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: 'blue'
        }
    }
    render() {
        return (
            <Group>
               <Rect
                    x={0}
                    y={0}
              />
            </Group>
        )
    }
}

const mapStateToProps = (state) => (state.setting)

export default connect(mapStateToProps)(Cell);
