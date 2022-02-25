
import * as _ from 'lodash'
export default class TableUtil {
    static checkHSplitLegal(cells) {
        // cells must in the same row. y1 and y2 of each cell should equal
        if (!cells || cells.length === 0 ) {
            return false;
        }
        const y1 = cells[0].y1;
        const y2 = cells[0].y2;
        if(cells.some(cell => {
            if (cell.y1 === y1 && cell.y2 === y2) {
                return false;
            }else{
                return true;
            }
        })) {
            // any cell is illegal
            return false;
        };
        return true;
    }
    static checkVSplitLegal(cells) {
        // cells must in the same column. 
        if (!cells || cells.length === 0 ) {
            return false;
        }
        const x1 = cells[0].x1;
        const x2 = cells[0].x2;
        if(cells.some(cell => {
            if (cell.x1 === x1 && cell.x2 === x2) {
                return false;
            }else{
                return true;
            }
        })) {
            // any cell is illegal
            return false;
        };
        return true;
    }
    static findTableNameByCellId(cellId, tables) {
        let name = null
        tables.forEach(table => {
            let findResult = _.find(table.child, child => {
                if (child.id === cellId) {
                    return true;
                }
                return false;
            })
            if (findResult) {
                name = table.name
            }
        });
        return name;
    }
    static clearSelectedFlag(t) {
        [...t.keys()].forEach(key => {
            let myTable = t.get(key);
            myTable.forEach(row => {
              row.forEach(cell => {
                cell.selected = false;
              })
            })
            t.set(key, myTable);
        })
    }
}