/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from "react";
import "./index.scss";
import {
  // Toggle,
  // Search,
  ToastNotification,
  TooltipDefinition,
} from "carbon-components-react";
import { ResizableBox } from "react-resizable";
import Draggable16 from "@carbon/icons-react/lib/draggable/16";
import RightSideTable from "../../containers/RightSideTable";
import { ReactComponent as FullScreen } from "../../assets/maximize.svg";
import { ReactComponent as NormalScreen } from "../../assets/minimize.svg";
import _ from "lodash";

import { Group, Rect } from 'react-konva';
import Konva from 'konva';

import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TextInput,
  Accordion,
  AccordionItem
} from "carbon-components-react";

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

const steps = [
  'In Progress',
  'Processed',
  'Completed',
];
let random;

const colors = {
  'CustomerAddress': 'rgb(88, 178, 220)',
  'CustomerId': 'rgb(204, 84, 58)',
  'CustomerName': 'rgb(255, 177, 27)',
  'InvoiceDate': 'rgb(46, 92, 110)',
  'InvoiceId': 'rgb(169, 99, 96)',
  'ShippingAddress': 'rgb(143, 119, 181)',
  'VendorAddress': 'rgb(36, 147, 110)',
  'VendorName': 'rgb(190, 194, 63)'
}

export default class TableRightContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showReviewSubmit: false,
      showReviewTradeSubmit: false,
      showKvpSubmit: false,
      review_comment: "",
      documentKvpData: {},
      current_target: 4
    }
    this.reviewRef = React.createRef();
    this.__handleConfidence = this._handleConfidence.bind(this);
    this._handleAccordianEvent = this._handleAccordianEvent.bind(this);
  }

  componentDidMount(){
    random = Math.random() * (999 - 1) + 1;
    console.log(random)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.InvoiceDate !== this.props.InvoiceDate) {
      this.setInputValue(nextProps.InvoiceDate);
    }
  }

  setInputValue(val) {
    this.refs.InvoiceDate.value = val;
  }

  getInputValue() {
    return this.refs.InvoiceDate.value;
  }

  getActiveStep(val) {
    let v = -1;
    switch (val) {
      case 'Inprogress':
        v = 1;
        break;
      case 'Processed':
        v = 2;
        break;
      case 'Completed':
        v = 3;
        break;
      default:
        v = -1;
        break;
    }
    return v;

  }

  _handleSubmit = (item) => (e) => {
    if (item == "review") {
      let review_comment = this.state.review_comment
      if (review_comment != "") {
        let { updateReviewComment } = this.props;
        let data = {
          comment: review_comment,
          reviewed_by: 'demo_user'
        }
        updateReviewComment(data)
        this.setState({ showReviewSubmit: false })
      }
    } else if (item == "kvp") {
      console.log(this.state.documentKvpData);
      let document_kvp_data = this.state.documentKvpData;
      let document_kvp_arr = []
      if (document_kvp_data != {}) {
        Object.keys(document_kvp_data).map(key => {
          let d = {}
          d[key] = document_kvp_data[key]
          console.log(d);
          document_kvp_arr.push(d)
        })
        console.log(document_kvp_arr);
        let { updateKvpData } = this.props;
        let data = {
          updatedkvpData: document_kvp_arr,
          reviewed_by: 'demo_user'
        }
        updateKvpData(data)
      }
    } else {
      console.log('No Handlers')
    }
  }

  _handleTextChange = (item) => (e) => {
    if (item == "review") {
      console.log(e.target.value)
      if (e.target.value == "") {
        this.setState({ showReviewSubmit: false, showReviewTradeSubmit: false, review_comment: e.target.value })
      } else {
        this.setState({ showReviewSubmit: true, showReviewTradeSubmit: true, review_comment: e.target.value })
      }
    } else {
      if (e.target.value == "") {
        this.setState({ showKvpSubmit: false })
      } else {
        console.log(e.target.name);
        console.log(e.target.value);
        let document_kvp_data = this.state.documentKvpData;
        document_kvp_data[e.target.name] = e.target.value;
        try {
          this.setState(prevState => ({
            prevState, documentKvpData: document_kvp_data, showKvpSubmit: true
          }))
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  _onKvpMouseEnter = key => () => {
    let { imageList, imagefile, documentKvp } = this.props;
    let image = imageList[documentKvp[key]['page_num'] - 1]
    if (imagefile && image.id === imagefile.id) {
      let layer = this.props.getLayer();
      let group = layer.find(`.group${key}`);
      if (group) {
        group.strokeWidth(2.5);
        group.stroke(this._getConfidenceClass(documentKvp[key]['confidence_score']));
      }
      layer.draw();
    }
  }

  _onKvpMouseLeave = key => () => {
    let { imageList, imagefile, documentKvp } = this.props;
    let image = imageList[documentKvp[key]['page_num'] - 1]
    if (imagefile && image.id === imagefile.id) {
      let layer = this.props.getLayer();
      let group = layer.find(`.group${key}`);
      if (group) {
        group.strokeWidth(1);
        group.stroke('#aaa');
        layer.draw();
      }
    }
  }

  _handleKvpPageChange = key => (e) => {
    let { imageList, imagefile, documentKvp, clearSelectedCell, clearSplitCell, clearTableStore,
      cleanContentMenu, cleanOverflowMenu, updateOverlayShow, updateimageList, addImage } = this.props;
    let image = imageList[documentKvp[key]['page_num'] - 1]
    if (imagefile && image.id === imagefile.id)
      console.log('same');
    else {
      let layer = this.props.getLayer();
      layer.find('Group').destroy();
      layer.find('Rect').destroy();
      layer.clear();
      clearSelectedCell();
      clearSplitCell();
      clearTableStore();
      cleanContentMenu();
      cleanOverflowMenu();
      updateOverlayShow(true);
      updateimageList(image.id);
      addImage(image);
    }

  }

  _handleResize = (event, { element, size, handle }) => {
    this.props.onSlider(size);
    // console.log(size)
    // let { changeRightbarSize } = this.props;
    // changeRightbarSize(size.width);
  };

  renderSingleTable(tableJson, ikey) {
    // console.log(tableJson)
    // console.log(ikey)
    let { imageList } = this.props;
    let imgData = _.find(imageList, { 'selected': true })
    return (
      <RightSideTable
        key={ikey}
        tableName={ikey}
        pageNumber={imgData ? imgData.id : ""}
        getLayer={this.props.getLayer}
      />
    );
  }

  _fullscreen() {
    const { setRightFullScreen, setExitRightFullScreen } = this.props;
    if (!this.props.isRightFullScreen) {
      setRightFullScreen();
    } else {
      setExitRightFullScreen();
    }
  }

  _handleConfidence(param) {
    let number = Number(param);
    if (_.isNaN(number)) console.log("number is nan");
    return number.toFixed(2);
  }

  _getConfidenceClass(param) {
    let number = Number(param);
    if (_.isNaN(number)) return "";

    if (number < 0.3) {
      return "red";
    } else if (number > 0.3 && number < 0.6) {
      return "orange"
    } else {
      return "#139F10";
    }
  }

  _getPercentage = (num) => {
    return (num * 100).toFixed(2);
  }

  _handleAccordianEvent = (currentTarget) => (e) => {
    if (this.state.current_target == currentTarget)
      this.setState({ current_target: 4 })
    else
      this.setState({ current_target: currentTarget })
  }

  _checkIfDocumentMetadata = (documentMetadata) => {
    console.log(documentMetadata.comment)
    if(documentMetadata.comment == "" || documentMetadata.comment == null)
      return false
    return true
  }

  renderTables() {
    const { tableJson } = this.props;
    // console.log(this.props)
    if (tableJson.size === 0) {
      return null;
    }
    const render = Array.from(tableJson.keys())
      .sort((a, b) => a - b)
      .map((key) => {
        let v = tableJson.get(key);
        return this.renderSingleTable(v, key);
      });

    return <React.Fragment>{render}</React.Fragment>;
  }

  render() {
    const { documentKvp, documentMetadata } = this.props;

    return (
      <ResizableBox
        className="rightbar"
        width={
          this.props.isRightFullScreen
            ? this.props.canvasWidth
            : this.props.rightsideWidth
        }
        height={this.props.canvasHeight}
        axis="x"
        resizeHandles={["w"]}
        handle={
          this.props.isRightFullScreen ? null : (
            <div
              className="rightbardrag"
              style={{
                height: this.props.canvasHeight,
              }}
            >
              <Draggable16 />
            </div>
          )
        }
        onResize={this._handleResize}
        minConstraints={[0, this.props.canvasHeight]}
        maxConstraints={[this.props.canvasWidth / 2, this.props.canvasHeight]}
        style={{
          left: this.props.isRightFullScreen
            ? 0
            : this.props.canvasWidth - this.props.rightsideWidth,
        }}
      >
        <div
          id="fullTagRight"
          className="rightbar"
          style={{
            // left: this.props.canvasWidth - this.props.rightsideWidth,
            width: this.props.isRightFullScreen
              ? this.props.canvasWidth
              : this.props.rightsideWidth - 16,
            height: this.props.canvasHeight,
            marginLeft: "16px",
          }}
        >
          <div className="tool_area">
            <div className="">
              <div className="bx--row banner">
                <div className="bx--col-lg-4 info">
                  {/* <Toggle
                    aria-label="toggle button"
                    id="toggle-1"
                    defaultToggled={false}
                    labelA="Not Start"
                    labelB="Mark for Review"
                    onToggle={event => {toggleMarkForReview()}}
                    toggled={this.props.markedForReview}
                    className="tablepage-toggle"
                  /> */}
                </div>
                <div className="bx--col-lg-4 info"></div>
                <div className="bx--col-lg-4 info">
                  <div
                    className="tool_icon_full"
                    onClick={this._fullscreen.bind(this)}
                  >
                    <div>
                      {this.props.isRightFullScreen ? (
                        <NormalScreen />
                      ) : (
                        <FullScreen />
                      )}
                    </div>
                    <div className="tool_text">
                      {this.props.isRightFullScreen ? "Restore" : "Maximise"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rightBarHeader">
            <h3 className="rightBarHeaderText">Requests</h3>
          </div>
          <Stepper alternativeLabel activeStep={documentMetadata ? this.getActiveStep(documentMetadata.status) : -1}>
            {steps.map((label, index) => (
              <Step key={label} active={documentMetadata ? index < this.getActiveStep(documentMetadata.status) : false}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Accordion>
            <AccordionItem title="Metadata" open={this.state.current_target == 0} onHeadingClick={this._handleAccordianEvent(0)}>
              {documentMetadata ? (
                Object.keys(documentMetadata).map((key) => {
                  return (
                    <div
                      className="metaData"
                      key={key}
                    >
                      <TableContainer>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="MetaData_left">
                                {key}
                              </TableCell>
                              <TableCell className="MetaData_right">
                                {documentMetadata[key]}
                              </TableCell>
                            </TableRow>

                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  );
                })
              ) : (
                <div>No Metadata available</div>
              )}
            </AccordionItem>
            <AccordionItem title="Key Values" open={this.state.current_target == 1} onHeadingClick={this._handleAccordianEvent(1)}>
              {this.state.showKvpSubmit ? <button className="accrdian-submit-btn" onClick={this._handleSubmit("kvp")}>Submit</button> : <></>}
              {documentKvp &&
                Object.keys(documentKvp).map((key) => {
                  return (
                    <div
                      className="kvpData"
                      key={key}
                      onMouseEnter={this._onKvpMouseEnter(key)}
                      onMouseLeave={this._onKvpMouseLeave(key)}
                    >
                      <div
                        className="kvpHeader"
                        style={{ background: this._getConfidenceClass(documentKvp[key]['confidence_score']) }}
                        onClick={this._handleKvpPageChange(key)}
                      >
                        {/* <span className="kvpHeaderId">{this._getPercentage(documentKvp[key]['confidence_score'])}%</span> */}
                        <span className="kvpHeaderId">
                          <TooltipDefinition
                            align={'center'}
                            direction={'bottom'}
                            tooltipText={`Page ${documentKvp[key]['page_num']}`}
                          >
                            {String(documentKvp[key]['page_num'])}
                          </TooltipDefinition>
                        </span>
                        <div className="kvpHeaderData">
                          <span>{key}</span>
                          <span>{this._getPercentage(documentKvp[key]['confidence_score'])}%</span>
                        </div>
                      </div>
                      <div className="kvpBody">
                      <input type="text" className="kvpBodyInput" key={`key_${documentKvp[key][key]}`} name={key} defaultValue={documentKvp[key][key]} onChange={this._handleTextChange("kvp")}></input>
                      </div>
                    </div>
                  );
                })}
            </AccordionItem>
            <AccordionItem title="Table" open={this.state.current_target == 2} onHeadingClick={this._handleAccordianEvent(2)}>
              {this.props.tableJson && this.props.tableJson.size > 0 ? (
                <React.Fragment>
                  <div className="tablepage-right-containe">
                    <div className="tablepage-table-container">
                      {this.renderTables()}
                    </div>
                  </div>
                </React.Fragment>
              ) : (
                <div>
                  <ToastNotification
                    hideCloseButton
                    kind="info"
                    lowContrast
                    iconDescription="describes the close button"
                    // subtitle="Click “New table” in the editor to select a table for extraction"
                    title="No tables extracted yet"
                    caption={null}
                    className="rightnotification"
                  />
                </div>
              )}
            </AccordionItem>
            <AccordionItem title="Review" open={this.state.current_target == 3} onHeadingClick={this._handleAccordianEvent(3)}>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="MetaData_left">
                        Status
                      </TableCell>
                      <TableCell className="MetaData_right">
                        <label>{documentMetadata ? documentMetadata.status : 'unknown'}</label>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="MetaData_left" style={{ justifyContent: 'space-between' }}>
                        <span>Comment</span>
                      </TableCell>
                      <TableCell className="MetaData_right">
                        <input type="text" key={`review_${random}`} defaultValue={documentMetadata ? documentMetadata.comment : ""} onChange={this._handleTextChange("review")}></input>
                      </TableCell>
                    </TableRow>
                    {this.state.showReviewSubmit ? <button className="accrdian-submit-btn" onClick={this._handleSubmit("review")}>Submit</button> : <></>}
                    {(documentMetadata && this._checkIfDocumentMetadata(documentMetadata))
                      ?
                        <button className="accrdian-submit-btn">TradeShift</button>
                      :
                        this.state.showReviewTradeSubmit ? <button className="accrdian-submit-btn">TradeShift</button> : <></>
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionItem>
          </Accordion>
        </div>
      </ResizableBox>
    );
  }
}
