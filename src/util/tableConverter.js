/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */


import * as _ from "lodash";
import { v4 as uuidv4 } from 'uuid';

export default class TableConverter {


    constructor(tableJson) {
        this.tableJson = tableJson
        this.cellStyleHeader = `style="vertical-align: middle; text-align: center;"`
        this.cellStyle = `style="vertical-align: middle;"`
    }

    convertRows(rows) {

    }

    // getColGroups(first) {
    //     const groups = []
    //     let currentHeader = first[0].name;
    //     let count = 1; 
    //     for (let i = 0; i < first.length; i++) {
    //         const e = first[i].name;
    //         if (e === currentHeader) {
    //             count += 1
    //         }else {
    //             groups.push({
    //                 name: currentHeader,
    //                 count: count
    //             })
    //             count = 1 
    //             currentHeader = e
    //         }
    //     }
    //     groups.push({
    //         name: currentHeader,
    //         count: count
    //     })
    //     return groups
    // }

    getColGroupsFromFirstLine(first) {
        // const groups = this.getColGroups(first)
        // console.debug(first)
        let html = ``
        first.forEach(g => {

            if (g.count === 1) {
                html = html + `<col >\n`
            } else {
                html = html + `<colgroup  span="${g.count}"></colgroup>\n`
            }
        })
        return html
    }

    getHeadersHtml(headers) {
        let html = ''
        // const groups = this.getColGroups(header)
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            html = html + `<tr ${this.cellStyleHeader}>`
            for (let j = 0; j < header.length; j++) {
                const element = header[j];
                let scope = element.count === 1 ? 'col' : 'colgroup'
                let colspan = element.count === 1 ? '' : `colspan="${element.count}"`
                let rowspan = element.rowCount === 1 ? '' : `rowspan="${element.rowCount}"`
                html = html + `<th ${this.cellStyleHeader} ${rowspan} scope=${scope} ${colspan}>${element.name}</th>\n`
            }
            html = html + '</tr>'
        }
        return `
        <thead>
                ${html}
        </thead>
        `
    }

    getRowsHtml(rows) {
        let html = ''
        rows.forEach(row => {
            html = html + '<tr>\n'
            row.forEach(cell => {
                let mark = cell.label === 'header' ? 'th' : 'td'
                let colspan = cell.count === 1 ? '' : `colspan="${cell.count}"`
                let rowspan = cell.rowCount === 1 ? '' : `rowspan="${cell.rowCount}"`
                let cellStyle = mark === 'th' ? this.cellStyleHeader : this.cellStyle
                html = html + `<${mark} ${cellStyle} ${rowspan} ${colspan} >${cell.name}</${mark}>\n`
            });
            html = html + '</tr>\n'
        });
        return `
        <tbody>
            ${html}
        </tbody>
        `
    }

    mergeRows(json) {
        // console.debug(json)
        let res = []
        // console.debug(res)
        if (json.length > 0) {
            for (let j = 0; j < json.length; j++) {
                let row = json[j];
                // console.debug("row " + j )
                if (row.length > 0) {
                    let currentCell = row[0];
                    let rowTmp = []
                    let count = 1;
                    for (let i = 1; i < row.length; i++) {
                        let element = row[i];
                        // console.debug("current")
                        // console.debug(currentCell.id)
                        // console.debug("next")
                        // console.debug(element.id)
                        if (element.id === currentCell.id) {
                            count = count + 1;
                        } else {
                            rowTmp.push({
                                id: currentCell.id,
                                name: currentCell.value,
                                count: count,
                                label: currentCell.label,
                                selected: false,
                                editFlag: false
                            })
                            currentCell = element;
                            count = 1;
                        }
                    }
                    rowTmp.push({
                        id: currentCell.id,
                        name: currentCell.value,
                        count: count,
                        label: currentCell.label,
                        selected: false,
                        editFlag: false
                    })
                    // console.debug(rowTmp)
                    res.push(rowTmp);
                    // console.debug(res.length)
                    // console.debug(res)
                }
            }
        }
        return res;
    }

    mergeSameIds(json) {
        let copy = _.cloneDeep(json)
        const mergedRows = this.mergeRows(copy);
        // console.debug(mergedRows[1])
        if (mergedRows.length > 0) {
            for (let i = 0; i < mergedRows.length - 1; i++) {
                const row = mergedRows[i];
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    let count = 1
                    // look for the cells down to see if any cells duplicated
                    for (let k = i + 1; k < mergedRows.length; k++) {
                        // console.debug(`k: ${k}, j: ${j}`)
                        // console.debug(`cell: ${cell.id}`)
                        if (_.remove(mergedRows[k], o => o.id === cell.id).length > 0) {
                            //remove this cell
                            count += 1
                        }
                    }
                    cell.rowCount = count;
                }
            }
        }
        return mergedRows;
    }

    convertTableToHtml(json) {
        console.debug('start converting')
        if (json.length === 0) {
            console.debug('No cell detected')
            return
        }
        // console.debug(json)
        let convertedJson = this.mergeSameIds(json)
        // console.debug('after merged:')
        // console.debug(convertedJson)
        return this.htmlFromConvertedJson(convertedJson)

    }

    allHeaders(row) {
        return row.length === _.filter(row, e =>
            e.label === 'header'
        ).length
    }

    splitHeaderRows(json) {
        let count = 0;
        // let all = json.length;
        for (let i = 0; i < json.length; i++) {
            const row = json[i];
            if (this.allHeaders(row)) {
                count += 1
            } else {
                break;
            }
        }
        return count
    }

    getHtml(convertedJson) {
        //split header and body. The lines with all headers are header rows
        const headersCount = this.splitHeaderRows(convertedJson)
        const headerHtml = this.getHeadersHtml(_.slice(convertedJson, 0, headersCount))
        const rowsHtml = this.getRowsHtml(_.slice(convertedJson, headersCount))
        return headerHtml + rowsHtml
    }

    htmlFromConvertedJson(convertedJson) {
        // console.debug(convertedJson)
        let colsHtml = this.getColGroupsFromFirstLine(convertedJson[0])
        // let headersHtmls = this.getHeadersHtml(convertedJson[0])
        // let rowsHtml = this.getRowsHtml(_.slice(convertedJson, 1))
        let bodyHtml = this.getHtml(convertedJson)

        let html = `
        <table style="font-size:12;">
            ${colsHtml}
            ${bodyHtml}
        </table>`

        // console.debug(html)
        return html
    }

    convertInitDataToTableCanvasData(indata, tableName) {
        let tabledata = {};
        if (indata.coordinate) {
            let coordinate
            if (indata.validated_data) {
                coordinate = indata.validated_data.coordinate
            } else {
                coordinate = indata.coordinate
            }
            tabledata = {
                id: uuidv4(),
                name: tableName,
                format: 'native',
                label: 'table',
                type: indata.type,
                x1: coordinate.x1,
                y1: coordinate.y1,
                x2: coordinate.x2,
                y2: coordinate.y2,
                scaleX: 1,
                scaleY: 1,
                scale: 1,
                rate: 1
            };
        }

        let celldata = indata.validated_data ? indata.validated_data.cells2d : indata.cells
        celldata = _.flattenDeep(celldata) //Let all the cell in one collection
        let newcells = [];
        celldata.forEach(cell => {
            newcells.push(_.pick(cell, ['id', 'label', 'value']))
        })
        newcells = _.uniqBy(newcells, 'id');
        newcells.forEach(cell => {

            let cellCollection = _.filter(celldata, { id: cell.id })
            cell.originalId = cell.id;
            cell.id = uuidv4();
            cell.tableID = tabledata.id
            cell.tableFormat = 'native'
            if (cellCollection.length === 1) {
                cell.x1 = cellCollection[0].x1;
                cell.x2 = cellCollection[0].x2;
                cell.y1 = cellCollection[0].y1;
                cell.y2 = cellCollection[0].y2;
            } else {
                cell.x1 = _.minBy(cellCollection, 'x1').x1;
                cell.x2 = _.maxBy(cellCollection, 'x2').x2;
                cell.y1 = _.minBy(cellCollection, 'y1').y1;
                cell.y2 = _.maxBy(cellCollection, 'y2').y2;
            }
        })
        tabledata.child = newcells
        return tabledata;
    }

    convertTableDataToParam(indata, x, y, operation) {
        let printTable = _.cloneDeep(indata)
        let rate = indata.rate;
        let returnData = {}
        returnData.coordinate = {
            x1: Math.round((printTable.x1 - x) * rate),
            y1: Math.round((printTable.y1 - y) * rate),
            x2: Math.round((printTable.x2 - x) * rate),
            y2: Math.round((printTable.y2 - y) * rate)
        }
        returnData.table_type = printTable.type;
        returnData.operation = operation !== '' ? 'define_table' : 'edit_table';
        if (printTable.child && printTable.child.length > 0) {
            let max = _.maxBy(_.filter(printTable.child, function (o) { return o.originalId; }), 'originalId')
            let maxId = 0;
            if (max) {
                maxId = max.originalId;
            }
            printTable.child.forEach((cell) => {
                cell.x1 = Math.round((cell.x1 - x) * rate);
                cell.y1 = Math.round((cell.y1 - y) * rate);
                cell.x2 = Math.round((cell.x2 - x) * rate);
                cell.y2 = Math.round((cell.y2 - y) * rate);
                if (cell.originalId || cell.originalId === 0) {
                    cell.id = cell.originalId
                } else {
                    maxId = maxId + 1
                    cell.originalId = maxId;
                    cell.id = cell.originalId
                }
                cell.id = cell.id
            })
            returnData.cells = printTable.child;
        }
        return returnData
    }

    convertTableEditDataToParam(indata, x, y) {
        let printTable = _.cloneDeep(indata)
        let rate = indata.rate;
        let returnData = {}
        returnData.border = {
            l: Math.round((printTable.x1 - x) * rate),
            t: Math.round((printTable.y1 - y) * rate),
            r: Math.round((printTable.x2 - x) * rate),
            b: Math.round((printTable.y2 - y) * rate)
        }
        returnData.covered = true;
        returnData.tableNum = indata.name
        return returnData;
    }

    convertGteDataToTableCanvasData(table, table_num) {
        let gteCells = table?.output_formats?.gte ?? null;
        if (!gteCells || gteCells.length === 0) {
            return null;
        }
        let tabledata = {};
        if (table.coordinate) {
            let coordinate
            if (table.validated_data) {
                coordinate = table.validated_data.coordinate
            } else {
                coordinate = table.coordinate
            }
            tabledata = {
                id: uuidv4(),
                name: table_num,
                format: 'gte',
                label: 'table',
                type: table.type,
                x1: coordinate.x1,
                y1: coordinate.y1,
                x2: coordinate.x2,
                y2: coordinate.y2,
                scaleX: 1,
                scaleY: 1,
                scale: 1,
                rate: 1
            };
            let cells = [];
            gteCells.forEach(gteCell => {
                let cell = {}
                cell.x1 = gteCell.bbox.l;
                cell.x2 = gteCell.bbox.r;
                cell.y1 = gteCell.bbox.t;
                cell.y2 = gteCell.bbox.b;
                cell.id = uuidv4();
                cell.label = 'value';
                cell.value = '';
                cell.tableID = tabledata.id;
                cell.tableFormat = 'gte'
                cells.push(cell);
            })
            tabledata.child = cells;
            return tabledata;
        }
    }

    convertOcrToTableCanvasData(table, table_num) {
        let tabledata = {};

        let coordinate = {
            x1: table.start_x,
            y1: table.start_y,
            x2: table.start_x + table.width,
            y2: table.start_y + table.height
        }
        tabledata = {
            id: uuidv4(),
            name: table_num,
            format: 'text',
            label: 'table',
            type: 'text',
            x1: coordinate.x1,
            y1: coordinate.y1,
            x2: coordinate.x2,
            y2: coordinate.y2,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
            rate: 1
        };
        let cells = [];
        table.lines.forEach(line => {
            line.words.forEach(word => {
                let cell = {}
                cell.x1 = word.start_x;
                cell.x2 = word.start_x + word.width;
                cell.y1 = word.start_y;
                cell.y2 = word.start_y + word.height;
                cell.id = uuidv4();
                cell.label = 'value';
                cell.value = word.value;
                cell.tableID = tabledata.id;
                cell.tableFormat = 'text'
                cells.push(cell);
            })
        })
        tabledata.child = cells;
        return tabledata;
    }

    convertTablesToTableStore(tables, imgdata) {

        if (tables && tables.length > 0) {
            let newTables = _.cloneDeep(tables)
            newTables.forEach(tabledata => {
                tabledata.scale = imgdata.scale;
                // For suit the page we use raito scale * 2.5 to compress the image. Also we need recalculate the table and cell's coords.
                let rate = imgdata.scale * 1;
                // table's coords equal image's position + table's coords
                tabledata.rate = rate;
                tabledata.x1 = tabledata.x1 / rate + imgdata.x;
                tabledata.y1 = tabledata.y1 / rate + imgdata.y;
                tabledata.x2 = tabledata.x2 / rate + imgdata.x;
                tabledata.y2 = tabledata.y2 / rate + imgdata.y;

                if (tabledata.child && tabledata.child.length > 0) {
                    tabledata.status = 'processed';
                    tabledata.child.forEach((cell) => {
                        // cells's coords equal image's position + table's coords
                        cell.x1 = cell.x1 / rate + imgdata.x;
                        cell.y1 = cell.y1 / rate + imgdata.y;
                        cell.x2 = cell.x2 / rate + imgdata.x;
                        cell.y2 = cell.y2 / rate + imgdata.y;

                    })
                }

            })
            return newTables;
        }
    }

}