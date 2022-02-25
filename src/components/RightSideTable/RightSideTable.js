/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from "react";
import "./index.scss";
import {
  OverflowMenu,
  OverflowMenuItem,
} from 'carbon-components-react';
import OverflowMenuVertical16 from "@carbon/icons-react/lib/overflow-menu--vertical/16"
import * as _ from "lodash";
import TableConverter from "../../util/tableConverter";
import RightSideTableCell from "../../containers/RightSideTableCell";
import Tooltip from "rc-tooltip";

export default class RightSideTable extends Component {

  constructor(props) {
    super(props)
    this.tableConverter = new TableConverter()
    this.cellStyleHeader = { verticalAlign: "middle", textAlign: "center" }
    this.cellStyle = { verticalAlign: "middle" }
  }

  generateMultipleCols(count) {
    return Array.from(Array(count)).map((a, idx) => {
      return <col key={`col_${idx}`}></col>
    })
  }

  renderSingleCol(count, index) {
    if (count === 1) {
      return <colgroup key={`colgroup_${index}`}><col></col></colgroup>
    } else {
      return <colgroup key={`colgroup_${index}`} span={count}>
        {this.generateMultipleCols(count)}
      </colgroup>
    }
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

  renderTableCols() {
    //get the first line
    let { tableJson, tableName } = this.props
    let firstLine = tableJson.get(tableName) ? tableJson.get(tableName)[0] : [];
    // console.log(firstLine)
    // const render = firstLine.map((cell,index) => {
    //   return this.renderSingleCol(cell.count, index)
    // });

    return <React.Fragment>
      {firstLine ? firstLine.map((cell, index) => {
        return this.renderSingleCol(cell.count, index)
      }) : null}
    </React.Fragment>
  }

  mapHeaderCell(cell) {
    let scope = cell.count === 1 ? 'col' : 'colgroup'
    return <th key={cell.id} style={this.cellStyleHeader} rowSpan={cell.rowCount} colSpan={cell.count} scope={scope}>
      {cell.name}
    </th>
  }

  mapHeader(header, index) {
    const render = header.map((cell) => {
      return this.mapHeaderCell(cell)
    })
    return <tr key={"header_row_" + index} style={this.cellStyleHeader}>
      {render}
    </tr>
  }

  renderTableHeaders(headers) {
    const render = headers.map((header, index) => {
      return this.mapHeader(header, index)
    })
    return <React.Fragment>
      {render}
    </React.Fragment>
  }

  mapRowCell(cell) {
    // if (cell.label === 'header') {
    //   return <th key={cell.id} style={this.cellStyleHeader} rowSpan={cell.rowCount} colSpan={cell.count}>
    //     {cell.name}
    //   </th>
    // }else {
    //   return <td key={cell.id} style={this.cellStyle} rowSpan={cell.rowCount} colSpan={cell.count}>
    //     {cell.name}
    //   </td>
    // }
    return <RightSideTableCell
      key={cell.id}
      cell={cell}
      tableName={this.props.tableName}
      getLayer={this.props.getLayer}
    >
    </RightSideTableCell>
  }

  mapRow(row, index) {
    const render = row.map((cell) => {
      return this.mapRowCell(cell)
    })
    return <tr key={"table_row_" + index}>
      {render}
    </tr>
  }

  renderTableBody(data) {
    const render = data?.map((header, index) => {
      return this.mapRow(header, index)
    })
    return <React.Fragment>
      {render}
    </React.Fragment>
  }

  convertFromCamel(name) {
    return name.replace("_", " ")
  }

  downloadHtmlTable(event) {
    const { tableJson, tableName, documentId, imagefile } = this.props
    const element = document.createElement("a");
    const file = new Blob([document.getElementById(`table_${tableName}`).outerHTML], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `document_${documentId}_page_${imagefile.id}_table_${tableName}.html`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(file), 5000);
  }

  downloadCsv(event) {
    const {downloadCsv, tableName} = this.props
    downloadCsv(tableName)
  }

  renderTableHtml() {
    const { tableJson, tableName } = this.props
    return <table id= {"table_" + tableName} className="bx--data-table tablepage-table">
    {this.renderTableCols()}
    <thead>
      {this.renderTableHeaders(_.slice(tableJson, 0, 0))}
    </thead>
    <tbody>
      {/* {this.renderTableBody(_.slice(tableJson, headersCount))} */}
      {this.renderTableBody(tableJson?.get(tableName))}
    </tbody>
  </table>
  }

  renderTable() {
    let render = this.renderTableHtml();
    return <React.Fragment>
        {render}
      </React.Fragment>
        
  }

  render() {
    const { tableJson, tableName } = this.props
    // console.log(this.props)
    // console.log(tableName)
    // const headersCount = this.splitHeaderRows(tableJson)

    // console.log(tableJson)
    // const headersCount = this.splitHeaderRows(tableJson)

    // const html = this.tableConverter.htmlFromConvertedJson(tableJson)
    // console.log(headersCount)
    return (

      //   <div
      //   className="bx--data-table bx--data-table--no-border tablepage-table"
      //   dangerouslySetInnerHTML={{ __html: html }}
      // ></div>

      <div className="tablepage-table-with-label">
        <div className="tablepage-overflow-menu">
          <span>{tableName}</span>
          <OverflowMenu
                    iconClass="tablepage-overflow-icon"
                    renderIcon={OverflowMenuVertical16}
                  >
                    <OverflowMenuItem
                      onClick={this.downloadHtmlTable.bind(this)}
                      itemText="Download HTML Table"
                    />
                    <OverflowMenuItem
                      onClick={this.downloadCsv.bind(this)}
                      itemText="Download CSV Table"
                    />
                  </OverflowMenu>
        </div>
        <Tooltip
          placement="top"
          trigger="hover"
          overlay={"Double click on the cell to edit its value."}
          defaultVisible={true}
        >
          {this.renderTable()}
          
        </Tooltip>
      </div>



    );
  }
}
