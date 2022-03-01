/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import "./index.scss";
import * as _ from 'lodash';
import Konva from 'konva';
export default class OverflowMenu extends Component {
    constructor(props) {
        super(props)
        this._modifyTable = this._modifyTable.bind(this);
        this._hideTable = this._hideTable.bind(this);
        this._deleteTable = this._deleteTable.bind(this);
    }

    /*
        It will hide all the cells in table,let table draggable and add konva.transformer for table.
    */
    _modifyTable = () =>{
        const { parameters, tableStore, cleanOverflowMenu, cleanContentMenu } = this.props;
        const basetable = _.find(tableStore, { 'id': parameters.id });
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        layer.draw();
        if(basetable.child && basetable.child.length>0){
            basetable.child.forEach(cell=>{
                let newCell = layer.findOne('#' + cell.id); //hide all the cells in table
                newCell.hide();
            })
        }
        let table = layer.findOne('#' + basetable.id);
        table.draggable(true); //let table draggable
        // add konva.transformer for table let table resizeable.
        var tr = new Konva.Transformer(
            {
                rotateEnabled:false,
                keepRatio: false,
                ignoreStroke: true,
            }
        );
        layer.add(tr);
        tr.attachTo(table);
        layer.draw();
        cleanOverflowMenu();
        cleanContentMenu();
    }

    /*
        It will show all the cells in table,let table undraggable and clear konva.transformer for table.
    */
    _hideTable = () =>{
        const { parameters, tableStore, cleanOverflowMenu, cleanContentMenu } = this.props;
        const basetable = _.find(tableStore, { 'id': parameters.id });
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        layer.draw();
        if(basetable.child && basetable.child.length>0){
            basetable.child.forEach(cell=>{
                let newCell = layer.findOne('#' + cell.id);
                if (newCell.hide()){
                    newCell.show();
                }
            })
        }
        let table = layer.findOne('#' + basetable.id);
        table.draggable(false);
        layer.draw();
        cleanOverflowMenu();
        cleanContentMenu();
    }

    /*
        It will destroy all the cells and table in konva layer. Also call api to delete table in redux(tableStore)
    */
    _deleteTable = () =>{
        const { parameters, tableStore, cleanOverflowMenu, cleanContentMenu, deleteTableApi } = this.props;
        const basetable = _.find(tableStore, { 'id': parameters.id });
        let layer = this.props.getLayer();
        layer.find('Transformer').destroy();
        layer.draw();
        if (basetable) {
            layer.find('Group').destroy();
            layer.find('Rect').destroy();
            layer.batchDraw();
        }
        cleanOverflowMenu();
        cleanContentMenu();
        deleteTableApi(parameters.id);
    }

    _mainContent = () => {
        if (this.props.show) {
          return (
            <div className="overflowmenu" style={{top: this.props.top, left:this.props.left}}>
                <div>
                    <button className="select-button" onClick={this._modifyTable.bind(this)}>Modify</button>
                    {/* <button className="select-button" onClick={this._hideTable.bind(this)}>Hide</button> */}
                    <button className="select-button" onClick={this._deleteTable.bind(this)}>Delete</button>
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