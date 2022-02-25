/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React from 'react'
// import { Image } from 'react-konva';
// import {Image } from 'react-image';
import { connect } from 'react-redux';
import { updImage } from '../redux/modules/image'

class LoadDocumentImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: 1,
      image: null,
      width: 0,
      height: 0,
      x: 0,
      y: 0
    }
  }

  componentDidUpdate(oldProps) {
    if (oldProps.uniqId !== this.props.uniqId) {
      // let layer = this.props.getLayer();
      // layer.find('Group').destroy();
      // layer.find('Rect').destroy();
      // layer.clear();
      this.loadImage();
    }
  }
  componentWillUnmount() {
    if (this.image) {
      this.image.removeEventListener('load', this.handleLoad);
    }

  }
  loadImage() {
    // save to "this" to remove "load" handler on unmount
    this.image = new Image();
    this.image.src = this.props.src;
    this.image.addEventListener('load', this.handleLoad);
  }


  handleLoad = () => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed

    if (this.image.complete) {
      // console.log('image.width:', this.image.width);
      // console.log('image.heght:', this.image.height);

      let curScale = 0;

      // 176px is leftbar's width
      // leave 10px blank both side
      let curWidth = this.props.canvasWidth - 176 - this.props.rightsideWidth - 20;
      let XScale = this.image.width / curWidth;
      // 64px is topbar'height
      // leave 10px blank both side
      let curHeight = this.props.canvasHeight - 64 - 20;
      let YSCale = this.image.height / curHeight;
      curScale = XScale > YSCale ? XScale : YSCale;

      // MidFullScreen and leftBar display don't affect page display. 
      // So comment the following code, use code line 86 instead.
      // let x = this.props.isMidFullScreen ?
      //   this.props.canvasWidth / 2 - (this.image.width / 2) / 2
      //   : (this.props.leftbarShow ?
      //     176 + 10 + curWidth / 2 - (this.image.width / curScale) / 2
      //     : (this.props.canvasWidth - this.props.rightsideWidth) / 2 - (this.image.width / 2) / 2);
      // let y = this.props.isMidFullScreen ?
      // (this.props.canvasHeight - 64) / 2 - (this.image.height / 2) / 2
      // : 64 + 10 + curHeight / 2 - (this.image.height / curScale) / 2;
      let x = 176 + 10 + curWidth / 2 - (this.image.width / curScale) / 2;
      let y = 64 + 10 + curHeight / 2 - (this.image.height / curScale) / 2;

      this.setState({
        scale: curScale,
        image: this.image,
        width: this.image.width / curScale,
        height: this.image.height / curScale,
        x: x,
        y: y
      });
      const { updImage } = this.props;
      updImage({
        id: this.props.id,
        orignalWidth: this.image.width,
        orignalHeight: this.image.height,
        scale: this.state.scale,
        showWidth: this.state.width,
        showHeight: this.state.height,
        x: this.state.x,
        y: this.state.y
      });

    }
  };
  render() {
    return (
      this.state.image ? (<img
        // x={232 + (this.props.x-832)/2 - this.state.width/2}
        src={this.props.src}
        style={{ height: '550px' }}
      />) : null
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.image,
    ...state.setting
  }
}


const mapDispathToProps = (dispath) => {
  return {
    updImage: (image) => {
      dispath(updImage(image))
    }
  }
}

export default connect(mapStateToProps, mapDispathToProps)(LoadDocumentImage);