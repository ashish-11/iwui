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
// import store from '../../redux/store.js';
import { v4 as uuidv4 } from 'uuid';

export function init(props, bx, by,id, type,layer) {
    // let layer = props.getLayer();
    const state = {
        color: "blue",
        width: props.canvasWidth,
        height: props.canvasHeight,
        strokeWidth: 1,
        opacity:0.2,
        id : uuidv4()
    };

    var area = new Konva.Rect({
        x:bx,
        y:by,
        width:1,
        height:1,
        name: type,
        // zindex:'2',
        opacity:0.3,
        fill:state.color,
        id:id + 'temp'
        //draggable: true,
    });

    layer.add(area);
    layer.draw();

    area.on('dragstart', function () {
        let { cleanContentMenu } = props;
        cleanContentMenu();
    })

    area.on('transformstart', function () {
        let { cleanContentMenu } = props;
        cleanContentMenu();
    })

    // when the table is transformend.it will update the update the confirm menu.
    area.on('transformend', function(e) {
        // console.log('table transform end');
        let { createContentMenu } = props;
        let stage = props.getStage();
        var containerRect = stage.container().getBoundingClientRect();
        let left = area.scaleX() ? area.x()+ area.width() * area.scaleX() - 368 : area.x()+ area.width()
        let top = area.scaleY() ? containerRect.top + area.y() + area.height() * area.scaleY(): containerRect.top + area.y() + area.height();
        createContentMenu(top ,  left,{id: area.id()});
    });

    // when the table is dragend.it will update the update the confirm menu.
    area.on('dragend', function(e){
        // prevent default behavior
        e.evt.preventDefault();
        let { createContentMenu } = props;
        let stage = props.getStage();
        var containerRect = stage.container().getBoundingClientRect();
        let left = area.scaleX() ? area.x()+ area.width() * area.scaleX() - 368 : area.x()+ area.width()
        let top = area.scaleY() ? containerRect.top + area.y() + area.height() * area.scaleY(): containerRect.top + area.y() + area.height();
        createContentMenu(top ,  left,{id: area.id()});
    });

  

}
export class TempTable extends Component {
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

export default connect(mapStateToProps)(TempTable);
