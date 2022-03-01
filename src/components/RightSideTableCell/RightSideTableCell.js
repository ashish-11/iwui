/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from "react";
import "./index.scss";
import { TextArea } from "carbon-components-react";

export default class RightSideTableCell extends Component {
  constructor(props) {
    super(props);

    this.cellStyleHeader = { verticalAlign: "middle", textAlign: "center" };
    this.cellStyle = { verticalAlign: "middle" };
  }

  editCell(event) {
    // console.log(event.target)
    // recover cell selection
    let layer = this.props.getLayer();
    let cells = layer.find('.cell'); 
    cells.forEach(cell=>{
        cell.stroke('#BE15E6');
        cell.strokeWidth(1);
    })
    layer.draw();
    const { cell, tableName } = this.props;
    this.props.editCell(cell.id, tableName);
  }

  onValueChange(event) {
    this.props.updateEditCell(event.target.value)
  }

  onCellEditBlur(event) {
    this.props.saveEditCell()
  }

  onKeyUp(event) {
    const { cell, tableName } = this.props;
    if (event.key === 'Escape') {
      // user presses 'Esc'
      this.props.dropEditCell(cell.id, tableName)
    }
  }

  render() {
    // 1. click on left, highlight on right
    // 2. double click on right, enter edit mode
    // 3. ESC to exit edit mode
    // 4. Auto-save when losing focus
    const { cell, cellEdit, } = this.props;
    return cell.label === "header" ? (
      <th
        key={cell.id}
        onDoubleClick={this.editCell.bind(this)}
        className={cell.selected ? "cell-selected" : "cell-unselected"}
        style={this.cellStyleHeader}
        rowSpan={cell.rowCount}
        colSpan={cell.count}
      >
        {cell.editFlag ?
          <TextArea
            labelText='Update cell value'
            value={cellEdit.name}
            onChange={this.onValueChange.bind(this)}
            onBlur={this.onCellEditBlur.bind(this)}
            onKeyUp={this.onKeyUp.bind(this)}
            autoFocus={true}
          >
          </TextArea>
          :
          cell.name}
      </th>
    ) : (
      <td
        key={cell.id}
        onDoubleClick={this.editCell.bind(this)}
        className={cell.selected ? "cell-selected" : "cell-unselected"}
        style={this.cellStyle}
        rowSpan={cell.rowCount}
        colSpan={cell.count}
      >
        {cell.editFlag ?
          <TextArea
            labelText='Update cell value'
            value={cellEdit.name}
            onChange={this.onValueChange.bind(this)}
            onBlur={this.onCellEditBlur.bind(this)}
            onKeyUp={this.onKeyUp.bind(this)}
            autoFocus={true}
          >
          </TextArea>
          :
          cell.name}
      </td>
    );
  }
}
