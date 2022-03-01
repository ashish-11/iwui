/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import { Group } from 'react-konva';
import * as table from '../core';
import * as _ from 'lodash'
export default class HandleCanvas extends Component {

    /*
        Based on BE's table data,Using konva.js to render tables and cells.
    */
    renderTable() {
        let { selectedTable, clearSelectTable, tableStore } = this.props;
        //Got the original table and cell data from redux(selectedTable)
        if (selectedTable && selectedTable.length > 0) {
            selectedTable.forEach(tabledata => {
                let myTable = _.find(tableStore, item => item.id === tabledata.id);
                // render the table in konva Layer.
                table.initTable(this.props, myTable.x1, myTable.y1,
                    myTable.x2, myTable.y2, myTable.name, myTable.id, myTable.format)

                if (myTable.child && myTable.child.length > 0) {
                    myTable.status = 'processed';
                    myTable.child.forEach((cell) => {
                        table.initCell(this.props, cell)
                    })
                }
            })
            // clear redux(selectedTable)
            clearSelectTable();
            return null;
        }
    }

    renderGteTable() {
        // console.log('render gte')
        let { gteTables, clearGteTables, tableStore } = this.props;
        if (gteTables && gteTables.length > 0) {
            gteTables.forEach(tabledata => {
                let myTable = _.find(tableStore, item => item.id === tabledata.id);
                // render the table in konva Layer.
                table.initTable(this.props, myTable.x1, myTable.y1,
                    myTable.x2, myTable.y2, myTable.name, myTable.id, myTable.format)
                if (myTable.child && myTable.child.length > 0) {
                    myTable.status = 'processed';
                    myTable.child.forEach((cell) => {
                        table.initCell(this.props, cell)
                    })
                }
            })
            // clear redux(selectedTable)
            clearGteTables();
            return null;
        }
    }

    renderTextView() {
        // console.log('render text')
        let { textTables, clearTextTables, tableStore } = this.props;
        // console.log(textTables)
        if (textTables && textTables.length > 0) {
            textTables.forEach(tabledata => {
                let myTable = _.find(tableStore, item => item.id === tabledata.id);
                // render the table in konva Layer.
                table.initTable(this.props, myTable.x1, myTable.y1,
                    myTable.x2, myTable.y2, myTable.name, myTable.id, myTable.format)
                if (myTable.child && myTable.child.length > 0) {
                    myTable.status = 'processed';
                    myTable.child.forEach((cell) => {
                        table.initCell(this.props, cell)
                    })
                }
            })
            // clear redux(selectedTable)
            clearTextTables();
            return null;
        }
    }


    render() {
        const { overlayView } = this.props;
        return (
            <Group ref="group">
                {
                    overlayView === 'table' ? this.renderTable() : overlayView === 'gte' ? this.renderGteTable() : this.renderTextView()
                }

            </Group>
        );
    }
}