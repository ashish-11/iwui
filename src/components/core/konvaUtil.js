/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

export default class KonvaUtil {

    haveIntersection(cell, r2) {
        let x1=0;
        let x2=0;
        let y1=0;
        let y2=0;
        if (r2.x1 <= r2.x2) {
            if (r2.y2 >= r2.y1) {
                x1 = r2.x1;
                x2 = r2.x2;
                y1 = r2.y1;
                y2 = r2.y2;
            } else {
                x1 = r2.x1;
                x2 = r2.x2;
                y1 = r2.y2
                y2 = r2.y1;
            }
        } else {
            if (r2.y2 >= r2.y1) {
                x1 = r2.x2;
                x2 = r2.x1;
                y1 = r2.y1;
                y2 = r2.y2;
            } else {
                x1 = r2.x2;
                x2 = r2.x1;
                y1 = r2.y2
                y2 = r2.y1;
            }
        }
        return !(
          x1 > cell.x + cell.width ||
          x2 < cell.x ||
          y1 > cell.y + cell.height ||
          y2 < cell.y
        );
    }

    getDistanceSqua(x1, y1, x2, y2) {
        var xDiff = x1 - x2;
        var yDiff = y1 - y2;
        return xDiff * xDiff + yDiff * yDiff;
    }
    
}