/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import {connect} from 'react-redux';
import RightSideTableCell from '../components/RightSideTableCell';
import { editCell,updateEditCell,saveEditCell,dropEditCell } from '../redux/modules/table'
const mapStateToProps = (state) =>{
    return {
        ...state.table
    }
}

const mapDispathToProps =(dispath)=>{
    return {
        editCell:(cellId, tableName)=>{
            dispath(editCell(cellId, tableName))
        },
        saveEditCell:()=>{
            dispath(saveEditCell())
        },
        dropEditCell:(cellId, tableName)=>{
            dispath(dropEditCell(cellId, tableName))
        },
        updateEditCell:(value)=>{
            dispath(updateEditCell(value))
        },
        // changeRightbarSize:(value)=>{
        //     dispath(changeRightbarSize(value))
        // }
    }
}

export default connect(mapStateToProps,mapDispathToProps)(RightSideTableCell);