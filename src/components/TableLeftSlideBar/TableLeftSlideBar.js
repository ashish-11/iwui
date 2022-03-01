/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import "./index.scss";
import Document16 from '@carbon/icons-react/lib/document/16';
import { Img } from 'react-image'
import { ReactComponent as CircleG } from '../../assets/Circle-g-16.svg';
import { ReactComponent as CircleR } from '../../assets/Circle-r-16.svg';
import { ReactComponent as CircleY } from '../../assets/Circle-y-16.svg';
import {
    Select,
    SelectItem
} from 'carbon-components-react';
import CaretLeft16 from '@carbon/icons-react/lib/caret--left/16';
import CaretRight16 from '@carbon/icons-react/lib/caret--right/16';
import MinioImage from '../../containers/MinioImage';

export default class TableLeftSlideBar extends Component {
    constructor(props) {
        super(props)
        this._pageChange = this._pageChange.bind(this);
        this._imageSelect = this._imageSelect.bind(this);
        this._showChange = this._showChange.bind(this);
        this.state = {
            rowsPerPage: 5,
            page: 1,
            imageSrc: ''
        }
        this.imgList = this.props.imageList
    }

    componentDidMount() {
        let { imageList } = this.props;
        if (imageList && imageList.length > 0) {
            this._imageSelect(imageList[0])
        }
    }

    _pageChange = (event) => {
        this.setState({
            rowsPerPage: 5,
            page: event.target.value
        })
        let { imageList, imagefile } = this.props;

        let page = Number(event.target.value);
        if(imagefile && page == imagefile.id){
            console.log('same')
        } else{
            this._imageSelect(imageList[page-1]);
        }

    }

    _showChange = (event) => {
        let { changeleftbarShow } = this.props;
        changeleftbarShow();
    }

    _hasUnfinishedOperation() {
        let { splitCell, isCreateTable, mergeCell, tableStore } = this.props;
        if ((splitCell && splitCell.length > 0) || isCreateTable || (mergeCell && mergeCell.length > 0)) {
            return true
        } else {
            let hasModify = false;
            if (tableStore && tableStore.length > 0) {
                tableStore.forEach(table => {
                    if (table.status === 'modify') {
                        hasModify = true
                    }
                })
            }
            return hasModify;
        }
    }

    async _imageSelect(image) {
        let { addImage, updateimageList, imagefile, clearSelectedCell, clearSplitCell, clearTableStore,
            cleanContentMenu, cleanOverflowMenu, updateOverlayShow, createMessage } = this.props;
        // if currenct have unfinished operation it will popup a messgae to warn user.
        if (this._hasUnfinishedOperation()) {
            createMessage('warning', { title: 'Can not select other image', subtitle: 'You still have some operations unfinshed in this page,Please confirm' });
            return null
        }

        if (imagefile && image.id === imagefile.id) {
            console.log('same')
        } else {
            // if change the image it will clear all the menu and Konva Rect in page.
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
            // layer.batchDraw();
            // let LayerImage = this.props.getLayerImage();
            // LayerImage.clear();
            // if (tableStore.length > 0) {
            //     tableStore.forEach(table => {
            //         let label = layer.findOne('.Label');
            //         let complexText = layer.findOne('.Text');
            //         let oldtable = layer.findOne('#' + table.id);
            //         console.log(label)
            //         console.log(complexText)
            //         label.destroy();
            //         complexText.destroy();
            //         oldtable.destroy();
            //     });
            // }

            // layer.clear();
            // await this.clearLayer()
            updateimageList(image.id);
            addImage(image);
        }
    }

    // async clearLayer() {
    //     let layer = this.props.getLayer();
    //     console.log(layer)
    //     layer.destroyChildren();
    //     // layer.batchDraw();
    //     // layer.find('Group').destroy()
    //     let LayerImage = this.props.getLayerImage();
    //     console.log(LayerImage)
    //     LayerImage.clear();
    // }

    PageSelect = (value) => {
        // let pages = Math.ceil(value / this.state.rowsPerPage);
        let pages = value;
        return (
            <React.Fragment>
                <div className="bx--row" >
                    <div className="bx--col-lg-7 pageSelect">
                        <Select inline
                            noLabel={true}
                            size="sm"
                            id='page_select_leftslide'
                            defaultValue={1}
                            onChange={this._pageChange.bind(this)}
                        >
                            {
                                this.SelectItem(pages)

                            }
                        </Select>
                    </div>
                    <div className="bx--col-lg-5 pageInfo" style={{ paddingLeft: '16px' }}>

                        {`of ${pages}`}
                    </div>
                </div>
            </React.Fragment>
        )
    }

    SelectItem = (value) => {
        var res = [];
        for (var i = 0; i < value; i++) {
            res.push(<SelectItem key={i}
                text={`${i + 1}`}
                value={i + 1}
            />)
        }
        return res
    }

    ConfidenceIcon = (value) => {
        if (value > 0.95) {
            return (
                <React.Fragment>
                    <CircleG />
                </React.Fragment>
            )
        } else if (value < 0.7) {
            return (
                <React.Fragment>
                    <CircleR />
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <CircleY />
                </React.Fragment>
            )
        }
    }

    CaretIcon = (value) => {
        if (value) {
            return (
                <React.Fragment>
                    <CaretLeft16 className='caret_icon' onClick={this._showChange.bind(this)} />
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <CaretRight16 className='caret_icon' onClick={this._showChange.bind(this)} />
                </React.Fragment>
            )
        }
    }

    render() {
        return (
            <div>
                <div className="leftbar" style={{ height: this.props.canvasHeight, display: this.props.leftbarShow ? 'flex' : 'none' }}>
                    <div className='tool_area'>
                        <div className="bx--grid bx--grid--full-width banner_top">
                            <div className="bx--row banner" >
                                <div className="bx--col-lg-5 pageInfo">
                                    <Document16 />
                                    Page
                                </div>
                                <div className="bx--col-lg-7 pageInfo">


                                    {this.PageSelect(this.props.imageList.length)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='tool_image_area'>
                        {this.props.imageList && this.props.imageList.map(image => (
                            <div className="bx--grid bx--grid--full-width imageList" key={image.id} onClick={() => { this._imageSelect(image) }}>
                                <div className="bx--row" >
                                    <div className="bx--col-lg-2">
                                        {image.id}
                                    </div>
                                    <div className={`bx--col-lg-9 ${image.selected ? "imageSelected" : ""}`} id="imageList">
                                        {/* <Img className="image" src={image.small_image_presigned_url} /> */}
                                        <MinioImage src={image.small_image} />
                                    </div>
                                    {/* <div className="bx--col-lg-2">
                                        {this.ConfidenceIcon(image.confidence)}
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="leftbarhide" style={{ height: this.props.canvasHeight, left: this.props.leftbarShow ? '160px' : '0px' }}>
                    {this.CaretIcon(this.props.leftbarShow)}
                </div>
            </div>
        );
    }
}