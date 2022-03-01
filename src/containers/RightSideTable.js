/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import {connect} from 'react-redux';
import RightSideTable from '../components/RightSideTable';
import {downloadCsv} from '../redux/modules/table'
  
const mapStateToProps = (state) =>{
    return {
        ...state.table,
        ...state.image
    }
}

const mapDispathToProps =(dispath)=>{
    return {
        downloadCsv:(tableId)=>{
            dispath(downloadCsv(tableId))
        },
        // changeRightbarSize:(value)=>{
        //     dispath(changeRightbarSize(value))
        // }
    }
}

export default connect(mapStateToProps,mapDispathToProps)(RightSideTable);