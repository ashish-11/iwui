/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import { Group, Rect } from 'react-konva';
import Konva from 'konva';
import { connect } from 'react-redux';
import { store } from '../../index';



export function init(props, x1, y1, x2, y2, name, id, format) {
    function destroyAllCells(tableId) {
        const layer = props.getLayer();
        let cells = layer.find('.cell');
        cells.forEach(c => {
            if (c.attrs.tableID === tableId) {
                c.destroy();
            }
        })
        layer.draw();
    }
    let layer = props.getLayer();
    // x1 = x1 + image.x()
    // x2 = x2 + image.x()
    // y1 = y1 + image.y()
    // y2 = y2 + image.y()
    // console.log(x2,y2)
    const state = {
        color: "#FFB7FF80",
        width: 200,
        height: 100,
        strokeWidth: 1,
        opacity: 1,
        stroke: "#aaa",
    };
    let existedGroup = layer.findOne('#' + id)

    if (existedGroup) {
        existedGroup.destroy();
        destroyAllCells(id)
    }
    // Creat table area
    const group = new Konva.Group({
        x: x1,
        y: y1,
        // draggable: true,
        id: id,
        // zIndex:2
    });

    // console.log(x1, x2,y1,y2);


    // Create table area
    const table = new Konva.Rect({
        x: 0,
        y: 0,
        id: id + 'area',
        width: x2 - x1,
        height: y2 - y1,
        name: `group${name}`,
        opacity: 1,
        fill: state.color,
        strokeWidth: state.strokeWidth,
        stroke: state.stroke
    });

    group.add(table);
    let Labelgroup = null;
    // Create table lable and label overflow menu.
    if (name !== 0) {
        Labelgroup = new Konva.Group({
            x: x1,
            y: y1 - 36,
            draggable: false,
            id: id + '_LabelGroup',
            // zIndex:3
        });
        const Label = new Konva.Rect({
            x: 0,
            y: 0,
            id: id + '_Label',
            name: 'Label',
            width: 102,
            height: 32,
            fill: '#0F62FE'
        });
        if (format === "native") {
            // only show the overflow menu when it's table view
            const cirleGroup = new Konva.Group({
                x: 102,
                y: 0,
                draggable: false,
                id: id + '_CirleGroup',
            });
            const cirleLabel = new Konva.Rect({
                x: 0,
                y: 0,
                id: id + '_cirleLabel',
                name: 'Label',
                width: 32,
                height: 32,
                fill: '#0F62FE'
            });
            const circle1 = new Konva.Circle({
                x: 16,
                y: 12,
                radius: 1,
                fill: 'white',
            });
            const circle2 = new Konva.Circle({
                x: 16,
                y: 16,
                radius: 1,
                fill: 'white',
            });
            const circle3 = new Konva.Circle({
                x: 16,
                y: 20,
                radius: 1,
                fill: 'white',
            });
            cirleGroup.add(cirleLabel);
            cirleGroup.add(circle1);
            cirleGroup.add(circle2);
            cirleGroup.add(circle3);
            Labelgroup.add(cirleGroup);
            cirleGroup.on('mouseout', function () {
                document.body.style.cursor = 'default';
                let layer = props.getLayer();
                // table.fill(#0353e9)
                // table.opacity(1)
                // layer.draw();
                cirleLabel.fill('#0F62FE')
                layer.draw();
            })


            //events
            cirleGroup.on('mouseover', function () {
                document.body.style.cursor = 'pointer';
                let layer = props.getLayer();
                // table.fill(#0353e9)
                // table.opacity(1)
                // layer.draw();
                cirleLabel.fill('#0353e9')
                layer.draw();
            })

            //the overflow menu event will trigger.

            cirleGroup.on('click', function (e) {
                // console.log('CirleGroup Click')
                let { show } = store.getState().overflowmenu;
                if (show) {
                    let { cleanOverflowMenu } = props;
                    cleanOverflowMenu();
                } else {
                    let { createOverflowMenu } = props;
                    let stage = props.getStage();
                    var containerRect = stage.container().getBoundingClientRect();
                    createOverflowMenu(containerRect.top + Labelgroup.getClientRect().y + Labelgroup.getClientRect().height + 5,
                        containerRect.left + Labelgroup.getClientRect().x + Labelgroup.getClientRect().width + 5, { id: id });
                }
            })
        }

        Labelgroup.add(Label);

        // layer.add(Label);
        const convertCamelCase = (name) => {
            if (!isNaN(name)) {
                return name
            }
            let words = name.split('_')
            const res = []
            words.forEach(word => {
                res.push(word.charAt(0).toUpperCase() + word.slice(1))
            });
            return res.join(' ')
        }
        const complexText = new Konva.Text({
            x: 10,
            y: 10,
            id: id + '_Text',
            name: 'Text',
            text: convertCamelCase(name),
            fontSize: 12,
            fill: 'white',
            width: 104,
            align: 'left'
        });
        Labelgroup.add(complexText)
        layer.add(Labelgroup);
        Labelgroup.hide();



    }


    layer.draw();

    let { updateTable } = props;
    updateTable({ id: id, width: x2 - x1, height: y2 - y1, x2: x2, y2: y2 });



    // group.on('click', function (e) {
    //     let layer = props.getLayer();
    //     layer.find('Transformer').destroy();
    //     var tr = new Konva.Transformer(
    //         {
    //             rotateEnabled:false,
    //             keepRatio: false,
    //             ignoreStroke: true,
    //         }
    //     );
    //     layer.add(tr);

    //     let group = layer.findOne('#' + id);
    //     tr.attachTo(group);
    //     layer.draw();
    // })

    // when the table is mouse over.it will show the table label.
    group.on('mouseover', function () {
        let groups = layer.find('Group');
        if (groups) {
            groups.forEach(hidegroup => {
                if (hidegroup.attrs.id && hidegroup.attrs.id.indexOf('_LabelGroup') !== -1) {
                    hidegroup.hide();
                }
            })
        }
        if (Labelgroup) {
            Labelgroup.show();
            Labelgroup.moveToTop();
        }

        layer.draw();
    })

    // when the table is transformend.it will update the table info Redux(tableStore).
    group.on('transformend', function (e) {
        // console.log('table transform end');
        let { updateTable } = props;
        updateTable(e.target.attrs);
        let layer = props.getLayer();
        let label = layer.findOne('#' + id + '_LabelGroup');
        label.x(e.target.attrs.x);
        label.y(e.target.attrs.y - 36);
        layer.batchDraw();
        let { createContentMenu } = props;
        let stage = props.getStage();
        var containerRect = stage.container().getBoundingClientRect();
        // console.log(group.getClientRect())
        createContentMenu(containerRect.top + group.getClientRect().y + group.getClientRect().height + 5,
            containerRect.left + group.getClientRect().x + group.getClientRect().width - 368, { id: this.id(), operation: 'modify' });
    });

    // when the table is dragmove.it will update the table info Redux(tableStore).
    group.on('dragmove', function (e) {
        // console.log('table dragmove');
        let pos = this.getAbsolutePosition();
        let layer = props.getLayer();
        let label = layer.findOne('#' + id + '_LabelGroup');
        label.x(pos.x);
        label.y(pos.y - 36);
        // let complexText = layer.findOne('#' + id + '_Text');
        // complexText.x(pos.x);
        // complexText.y(pos.y-26);
        layer.batchDraw();
        let { updateTable } = props;
        updateTable({ id: id, x: pos.x, y: pos.y });
    })

    // when the table is dragend.it will update the table info Redux(tableStore).
    group.on('dragend', function (e) {
        let pos = this.getAbsolutePosition();
        let layer = props.getLayer();
        let label = layer.findOne('#' + id + '_LabelGroup');
        label.x(pos.x);
        label.y(pos.y - 36);
        // let complexText = layer.findOne('#' + id + '_Text');
        // complexText.x(pos.x);
        // complexText.y(pos.y-26);
        layer.batchDraw();
        let { updateTable } = props;
        updateTable({ id: id, x: pos.x, y: pos.y });
        let { createContentMenu } = props;
        let stage = props.getStage();
        var containerRect = stage.container().getBoundingClientRect();
        createContentMenu(containerRect.top + group.getClientRect().y + group.getClientRect().height + 5,
            containerRect.left + group.getClientRect().x + group.getClientRect().width - 368, { id: this.id(), operation: 'modify' });
    })

    group.on('dragstart', function () {
        let { cleanContentMenu } = props;
        cleanContentMenu();
    })

    group.on('transformstart', function () {
        let { cleanContentMenu } = props;
        cleanContentMenu();
    })

    group.on('contextmenu', function (e) {
        // prevent default behavior
        e.evt.preventDefault();
        // let { createContentMenu } = props;
        // let {tableStore} = store.getState().table;
        // const table = _.find(tableStore, { 'id': id });
        // console.log(table)
        // let stage = props.getStage();
        // var containerRect = stage.container().getBoundingClientRect();
        // createContentMenu(containerRect.top + table.y2, containerRect.left + table.x2 - 368,{id: this.id()});
    });

    layer.add(group);
    layer.draw();
    return group;
}
export class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: 'black'
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
                    zIndex={1}
                    draggable={true}
                />
            </Group>
        )
    }
}

const mapStateToProps = (state) => (state.setting)

export default connect(mapStateToProps)(Table);
