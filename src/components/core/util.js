/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

// import * as _ from "lodash";

export default class TableUtil {

    /*
        if change to move mode will set the konva stage to draggable
        if chenge to select mode will set the konva stage to undraggable
    */
    pinAction(props) {
        let { isPin, setPin } = props;
        let stage = props.getStage();
        if (!isPin) {
            stage.container().style.cursor = 'move';
            stage.draggable(true);
            stage.batchDraw();
            setPin(true);
        } else {
            stage.container().style.cursor = 'default';
            // stage.position(position);
            stage.draggable(false);
            stage.batchDraw();
            setPin(false);
        }
    }

    /*
        set the konva stage's start position to 0,0
        and it to undraggable
    */
    pinRest(action, props) {
        let { setPin } = props;
        if (!(action === 'In' || action === 'Out')) {
            let stage = props.getStage();
            stage.container().style.cursor = 'default';
            stage.position({ x: 0, y: 0 });
            stage.draggable(false);
            stage.batchDraw();
            setPin(false);
        }
    }

    /*
        it based on image's center to zoom in and out
    */
    zoomAction(action, props) {
        let { scaleBy, setScale, setPosition, imagefile } = props;
        let stage = props.getStage();
        var oldScale = stage.scaleX() ? stage.scaleX() : 1;
        let layer = props.getLayer();
        let image = layer.findOne('Image');
        if (!(action === 'In' || action === 'Out')) {
            image.position({ x: imagefile.x, y: imagefile.y });
            layer.batchDraw();
        }
        let pointX = image.x() + image.width() / 2;
        let pointY = image.y() + image.height() / 2;

        // let pointX = imagefile.x + imagefile.showWidth/2;
        // let pointY = imagefile.y + imagefile.showHeight/2;
        var mousePointTo = {
            x: pointX / oldScale - stage.x() / oldScale,
            y: pointY / oldScale - stage.y() / oldScale
        };

        var newScale = 1;
        if (action === 'In') {
            newScale = oldScale * scaleBy;
        } else if (action === 'Out') {
            newScale = oldScale / scaleBy;
        }
        stage.scale({ x: newScale, y: newScale });
        setScale(newScale);
        var newPos = {
            x: -(mousePointTo.x - pointX / newScale) * newScale,
            y: -(mousePointTo.y - pointY / newScale) * newScale
        };
        stage.position(newPos);
        setPosition(newPos);
        stage.batchDraw();
    }

    static selectedIsRect(sortedCellList, minX, maxX, minY, maxY) {
        // check if the selected area is a rectangular.
        let curTop = minX;
        let curBottom = minX;
        let curLeft = minY;
        let curRight = minY;
        sortedCellList.forEach((cell) => {
            // top of the selected area is continuous
            if (cell.y1 === minY) {
                if (cell.x1 === curTop) {
                    curTop = cell.x2;
                } else {
                    return false;
                }
            }
            // bottom of the selected area is continuous
            if (cell.y2 === maxY) {
                if (cell.x1 === curBottom) {
                    curBottom = cell.x2;
                } else {
                    return false;
                }
            }
            // bottom of the selected area is continuous
            if (cell.x1 === minX) {
                if (cell.y1 === curLeft) {
                    curLeft = cell.y2;
                } else {
                    return false;
                }
            }
            // bottom of the selected area is continuous
            if (cell.x2 === maxX) {
                if (cell.y1 === curRight) {
                    curRight = cell.y2;
                } else {
                    return false;
                }
            }
        });
        // check if four sides are filled.
        if (curTop !== maxX || curBottom !== maxX || curLeft !== maxY || curRight !== maxY) {
            return false;
        }
        return true;

    }
}