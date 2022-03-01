/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import { Group,Rect } from 'react-konva';
import Konva from 'konva';
import { connect } from 'react-redux';
// import * as _ from 'lodash';
import * as tempTable from './tempTable';
// import store from '../../redux/store.js';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../../index';

export function init(props, bx, by, type) {
    // let layer = props.getLayer();
    let stage = props.getStage();

    //Create a new konva layer on konva stage
    let layer = new Konva.Layer({
        name:'maskLayer'
    });

    stage.add(layer);
    const state = {
        color: "black",
        width: props.canvasWidth,
        height: props.canvasHeight,
        strokeWidth: 1,
        opacity:0.2,
        id : uuidv4()
    };
    // Creat table area
    const group = new Konva.Group({
        x: bx,
        y: by,
        draggable: false,
        id: state.id,
        name: 'mask'
    });
    // Create area
    //Create a mask on the new konva layer
    const mask = new Konva.Rect({
        x:0,
		y:0,
        width: state.width,
        height: state.height,
		fill:state.color,
        opacity:state.opacity,

    });

    group.add(mask);

    var complexText = new Konva.Text({
        x: state.width/2 - 300,
        y: 5,
        text:
          "Click and Drag to Select the area you want",
        fontSize: 18,
        fontFamily: 'Calibri',
        fill: '#555',
        width: 600,
        padding: 20,
        align: 'center'
    });

    group.add(complexText);
    layer.add(group);

    layer.draw();

    // group.zIndex(2);
    layer.draw();

    // When the mouse down on the mask will create a new temp table area.
    group.on('mousedown', function (e) {
        let {scale} = store.getState().setting;
        let mousePos = stage.getPointerPosition();
        var mousePoint = {
            x: (mousePos.x - stage.x()) / scale,
            y: (mousePos.y - stage.y()) / scale,
          };

		let Existarea = layer.findOne('#' + state.id + 'temp');
		let Existarea2 = layer.findOne('#' + state.id + 'area');
		if (!Existarea && !Existarea2) {
            tempTable.init(props,mousePoint.x, mousePoint.y, state.id, type, layer)
		}
    });
    
    // When the mouse move on the mask will change temp table's size.
	group.on('mousemove', function (e) {
		let {scale} = store.getState().setting;
        let mousePos = stage.getPointerPosition();
        var mousePoint = {
            x: (mousePos.x - stage.x()) / scale,
            y: (mousePos.y - stage.y()) / scale,
          };
		document.body.style.cursor = 'crosshair';	  
		let area = layer.findOne('#' + state.id + 'temp');
		if(area) {
            area.width(mousePoint.x-area.x());
            area.height(mousePoint.y-area.y());
            layer.batchDraw();
		}
    });
    
    // When the mouse up on the mask will change temp table's size  and also add a transformer for the table.
    group.on('mouseup', function (e) {
		let {scale} = store.getState().setting;
        let mousePos = stage.getPointerPosition();
        var mousePoint = {
            x: (mousePos.x - stage.x()) / scale,
            y: (mousePos.y - stage.y()) / scale,
          };
        let area = layer.findOne('#' + state.id + 'temp');
        document.body.style.cursor = 'default';
		if(area) {
			area.width(mousePoint.x-area.x());
			area.height(mousePoint.y-area.y());
			if(area.width() <10 || area.height() < 10) {
				area.destroy();
			} else {
				layer.batchDraw();
				var tr = new Konva.Transformer(
                    {
                        rotateEnabled:false,
                        keepRatio: false,
                        ignoreStroke: true,
                    }
                );
                layer.add(tr);

                tr.attachTo(area);

                area.draggable(true);
                area.id(state.id + 'area');
                complexText.destroy();
                layer.batchDraw();
                document.body.style.cursor = 'default';
                let stage = props.getStage();
                let { createContentMenu } = props;
                var containerRect = stage.container().getBoundingClientRect();
                let left = containerRect.left + area.getClientRect().x + area.getClientRect().width - 368
                let top = containerRect.top + area.getClientRect().y + area.getClientRect().height  + 5;
                createContentMenu(top,  left, {id: state.id + 'area'});
			}
		}
	  });

    return group;
}
export class Mask extends Component {
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
                    x={150}
                    y={50}
                    width={100}
                    height={100}
                    opacity={0.5}
                    fill={this.state.color}
                    zIndex = {1}
                    draggable = {true}
              />
            </Group>
        )
    }
}

const mapStateToProps = (state) => (state.setting)

export default connect(mapStateToProps)(Mask);
