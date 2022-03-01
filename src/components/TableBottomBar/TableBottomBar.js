/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import {
    Button
  } from 'carbon-components-react';
import "./index.scss";
import { ReactComponent as MoveIcon } from '../../assets/Move.svg';
import { ReactComponent as ZoomInIcon } from '../../assets/ZoomIn.svg';
import { ReactComponent as ZoomOutIcon } from '../../assets/ZoomOut.svg';
import { ReactComponent as ResetIcon } from '../../assets/Reset.svg';
import { ReactComponent as SelectIcon } from '../../assets/Arrow.svg';
import TableUtil from "../core/util";
const tableUtil = new TableUtil()
export default class TableBottomBar extends Component {
    constructor(props) {
        super(props)
        this._zoomAction = this._zoomAction.bind(this);
        this._pinAction = this._pinAction.bind(this);
    }

    _pinAction(){
        tableUtil.pinAction(this.props)
    }

    _zoomAction(action){
        tableUtil.zoomAction(action,this.props)
        tableUtil.pinRest(action,this.props)
    }

    render() {
        return (
            <div className="bottombar" 
                style={{
                    left: this.props.isMidFullScreen ?  (this.props.canvasWidth)/2 - 100 :
                        (this.props.leftbarShow ? 232 + (this.props.canvasWidth- 232 - this.props.rightsideWidth)/2 - 100:16 + (this.props.canvasWidth - this.props.rightsideWidth)/2 - 100),
                    top: this.props.canvasHeight -15,
                    display:this.props.isRightFullScreen?'none':null
                }}
            >
                    <div className="bx--grid bx--grid--full-width button-icon-area">
                        <div className="bx--row" >
                            <div className="bx--col-lg-3 button-icon">
                                <Button kind='ghost'
                                    // disabled={this.props.isPin}
                                    hasIconOnly
                                    renderIcon={ZoomOutIcon}
                                    tooltipAlignment="center"
                                    tooltipPosition="top"
                                    iconDescription="Zoom Out"
                                    onClick={() => {this._zoomAction("Out")}}
                                />
                            </div>
                            <div className={this.props.isPin? "bx--col-lg-3 button-icon-pin":"bx--col-lg-3 button-icon"}>
                                <Button kind='ghost'
                                    // disabled={true}
                                    hasIconOnly
                                    renderIcon={this.props.isPin?SelectIcon:MoveIcon}
                                    tooltipAlignment="center"
                                    tooltipPosition="top"
                                    iconDescription={this.props.isPin?'Select Mode':'Move Mode'}
                                    onClick={this._pinAction.bind(this)}
                                />
                            </div>  
                            <div className="bx--col-lg-3 button-icon">
                                <Button kind='ghost'
                                    // disabled={this.props.isPin}
                                    hasIconOnly
                                    renderIcon={ResetIcon}
                                    tooltipAlignment="center"
                                    tooltipPosition="top"
                                    iconDescription="Reset to fit"
                                    onClick={() => {this._zoomAction("Reset")}}
                                />
                            </div>  
                            <div className="bx--col-lg-3 button-icon">
                                <Button kind='ghost'
                                    // disabled={this.props.isPin}
                                    hasIconOnly
                                    renderIcon={ZoomInIcon}
                                    tooltipAlignment="center"
                                    tooltipPosition="top"
                                    iconDescription="Zoom In"
                                    onClick={() => {this._zoomAction("In")}}
                                />
                            </div>                  
                        </div>
                    </div>
            </div>
        );
    }
}
